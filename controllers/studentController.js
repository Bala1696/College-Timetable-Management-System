const { Student } = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, Table, TableRow, TableCell } = require('docx');
const fs = require('fs-extra');
const path = require('path');
const { Op } = require("sequelize");

const DOWNLOAD_DIR = path.join(__dirname, '../downloads');
fs.ensureDirSync(DOWNLOAD_DIR);

// Permission Helper
const canManageStudents = (user) => {
    return ['admin', 'faculty', 'supporting_staff'].includes(user.role);
};

const isAdmin = (user) => {
    return user.role === 'admin';
};

// CREATE STUDENT 
exports.createStudent = async (req, res) => {
    try {
        if (!canManageStudents(req.user)) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const { serialNo, rollNumber, studentName, remarks, year } = req.body;

        // Validate year manually 
        if (!year || !["I", "II", "III", "IV"].includes(year)) {
            return res.status(400).json({ message: "Invalid or missing year" });
        }

        // Unique roll number per year
        const exists = await Student.findOne({
            where: { rollNumber, year },
        });

        if (exists) {
            return res
                .status(409)
                .json({ message: "Student with this roll number already exists in this year" });
        }

        const student = await Student.create({
            serialNo,
            rollNumber,
            studentName,
            remarks,
            year,
        });

        return res.status(201).json({
            message: "Student created successfully",
            student,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error creating student",
            error: err.message,
        });
    }
};

// GET ALL STUDENTS 
exports.getStudents = async (req, res) => {
    try {
        const { year } = req.query;

        const where = {};
        if (year) where.year = year;

        const students = await Student.findAll({
            where,
            order: [["serialNo", "ASC"]],
        });

        return res.status(200).json(students);
    } catch (err) {
        console.error("GET STUDENTS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch students" });
    }
};

// GET STUDENT BY ID 
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.json(student);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching student' });
    }
};

// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
    try {
        if (!canManageStudents(req.user)) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const studentId = req.params.id;
        const { serialNo, rollNumber, studentName, remarks, year } = req.body;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (rollNumber) {
            const exists = await Student.findOne({
                where: {
                    rollNumber,
                    year: year || student.year,
                    id: { [Op.ne]: studentId },
                },
            });
            if (exists) {
                return res.status(409).json({ message: "Roll number already in use for this year" });
            }
        }

        await student.update({ serialNo, rollNumber, studentName, remarks, year });

        return res.status(200).json({
            message: "Student updated successfully",
            student,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error updating student",
            error: err.message,
        });
    }
};

// DELETE STUDENT 
exports.deleteStudent = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ message: 'Only Admin can delete students' });
        }

        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.destroy();
        return res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error deleting student' });
    }
};

// EXPORT TO EXCEL
exports.exportExcel = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await Student.findAll({ where: year ? { year } : {} });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Students');

        sheet.columns = [
            { header: 'S.No', key: 'serialNo', width: 10 },
            { header: 'Roll Number', key: 'rollNumber', width: 20 },
            { header: 'Name', key: 'studentName', width: 25 },
            { header: 'Remarks', key: 'remarks', width: 25 },
            { header: 'Year', key: 'year', width: 10 },
        ];

        students.forEach(s => sheet.addRow(s.toJSON()));

        const fileName = `students-${year || 'all'}-${Date.now()}.xlsx`;
        const filePath = path.join(DOWNLOAD_DIR, fileName);
        await workbook.xlsx.writeFile(filePath);
        res.download(filePath, fileName, (err) => {
            if (!err) fs.remove(filePath); // Cleanup
        });
    } catch (err) {
        res.status(500).json({ message: 'Excel export failed', error: err.message });
    }
};

// EXPORT TO PDF 
exports.exportPDF = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await Student.findAll({ where: year ? { year } : {} });

        const fileName = `students-${year || 'all'}-${Date.now()}.pdf`;
        const filePath = path.join(DOWNLOAD_DIR, fileName);
        fs.ensureDirSync(DOWNLOAD_DIR);

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(18).text(`Students ${year || ''} Year`, { align: 'center' });
        doc.moveDown(2);

        const startX = doc.page.margins.left;
        let y = doc.y;
        const rowHeight = 25;
        const col = { sno: 50, roll: 120, name: 180, remarks: 150, year: 50 };

        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('S.No', startX, y, { width: col.sno });
        doc.text('Roll No', startX + col.sno, y, { width: col.roll });
        doc.text('Name', startX + col.sno + col.roll, y, { width: col.name });
        doc.text('Remarks', startX + col.sno + col.roll + col.name, y, { width: col.remarks });
        doc.text('Year', startX + col.sno + col.roll + col.name + col.remarks, y, { width: col.year });
        y += rowHeight;

        doc.font('Helvetica').fontSize(11);
        students.forEach((s, i) => {
            if (y > doc.page.height - 60) { doc.addPage(); y = doc.page.margins.top; }
            doc.text(i + 1, startX, y, { width: col.sno });
            doc.text(s.rollNumber, startX + col.sno, y, { width: col.roll });
            doc.text(s.studentName, startX + col.sno + col.roll, y, { width: col.name });
            doc.text(s.remarks || '-', startX + col.sno + col.roll + col.name, y, { width: col.remarks });
            doc.text(s.year, startX + col.sno + col.roll + col.name + col.remarks, y, { width: col.year });
            y += rowHeight;
        });

        doc.end();
        writeStream.on('finish', () => {
            res.download(filePath, fileName, (err) => {
                if (!err) fs.remove(filePath); // Cleanup
            });
        });
        writeStream.on('error', err => res.status(500).json({ message: 'PDF write failed', error: err.message }));

    } catch (err) {
        res.status(500).json({ message: 'PDF export failed', error: err.message });
    }
};

// EXPORT TO WORD
exports.exportWord = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await Student.findAll({ where: year ? { year } : {} });

        const rows = [
            new TableRow({
                children: ['S.No', 'Roll Number', 'Name', 'Remarks', 'Year']
                    .map(h => new TableCell({ children: [new Paragraph({ text: h, bold: true })] })),
            }),
            ...students.map(s => new TableRow({
                children: [
                    String(s.serialNo || '-'),
                    s.rollNumber,
                    s.studentName,
                    s.remarks || '-',
                    s.year
                ].map(v => new TableCell({ children: [new Paragraph(String(v))] }))
            }))
        ];

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: `Student List - ${year || 'All'} Year`, heading: 'Heading1', alignment: 'center' }),
                    new Table({ rows, width: { size: 100, type: 'pct' } })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        const fileName = `students-${year || 'all'}-${Date.now()}.docx`;
        const filePath = path.join(DOWNLOAD_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        res.download(filePath, fileName, (err) => {
            if (!err) fs.remove(filePath); // Cleanup
        });
    } catch (err) {
        res.status(500).json({ message: 'Word export failed', error: err.message });
    }
};
