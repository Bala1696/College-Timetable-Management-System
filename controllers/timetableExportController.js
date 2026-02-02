const Timetable = require('../models/Timetable');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, BorderStyle, TextRun, AlignmentType, PageOrientation, VerticalAlign } = require('docx');

const FIXED_PERIODS = [
    { id: 1, time: '9.10 - 9.50' },
    { id: 2, time: '9.50 - 10.40' },
    { id: 3, time: '11.00 - 11.50' },
    { id: 4, time: '11.50 - 12.40' },
    { id: 5, time: '1.30 - 2.15' },
    { id: 6, time: '2.15 - 3.00' },
    { id: 7, time: '3.15 - 4.00' },
    { id: 8, time: '4.00 - 4.45' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getYearFromSemester = (sem) => {
    switch (sem) {
        case 'I':
        case 'II': return 'I YEAR';
        case 'III':
        case 'IV': return 'II YEAR';
        case 'V':
        case 'VI': return 'III YEAR';
        case 'VII':
        case 'VIII': return 'IV YEAR';
        default: return '';
    }
};

exports.exportToPDF = async (req, res) => {
    try {
        const { semester, section, venue } = req.query;
        let whereClause = {};
        let filename = 'timetable';
        let headerTitle = '';
        let subtitle = '';

        if (venue) {
            whereClause = { venue };
            filename = `${venue.replace(/ /g, '_')}_timetable`;
            headerTitle = 'LABORATORY TIME TABLE';
            subtitle = venue.toUpperCase();
        } else {
            whereClause = { semester: semester || 'I', section: section || 'A' };
            filename = `timetable_${whereClause.semester}_${whereClause.section}`;
            headerTitle = 'CLASS TIME TABLE';
            subtitle = `Semester ${whereClause.semester} - Section ${whereClause.section}`;
        }

        const timetableData = await Timetable.findAll({
            where: whereClause
        });

        const doc = new PDFDocument({ layout: 'landscape', margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        doc.pipe(res);

        // 1. Header
        const academicYear = 'AY 2025-26 — EVEN SEMESTER';
        const department = 'Dept of Artificial Intelligence & Data Science';

        doc.fontSize(14).font('Helvetica-Bold').text(department, { align: 'center' });
        doc.fontSize(16).text(headerTitle, { align: 'center' });
        doc.fontSize(12).text(academicYear, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(subtitle, { align: 'center' });
        doc.moveDown(1);

        const startX = 30;
        let currentY = doc.y;

        // Settings
        const dayColWidth = 40;
        const medColWidth = 30;
        const periodWidth = (doc.page.width - 60 - dayColWidth - medColWidth) / 8;
        const headerRowHeight = 25;
        const rowHeight = 70;

        // 2. Grid Headers
        doc.fontSize(9).font('Helvetica-Bold');

        // Row 1: Hours
        doc.rect(startX, currentY, dayColWidth, headerRowHeight).fillAndStroke('#f0f0f0', '#000000');
        doc.fillColor('black').text('Hours', startX + 2, currentY + 8);
        doc.rect(startX + dayColWidth, currentY, medColWidth, headerRowHeight).stroke();
        FIXED_PERIODS.forEach((p, i) => {
            const x = startX + dayColWidth + medColWidth + (i * periodWidth);
            doc.rect(x, currentY, periodWidth, headerRowHeight).fillAndStroke('#f0f0f0', '#000000');
            doc.fillColor('black').text(p.id.toString(), x, currentY + 8, { width: periodWidth, align: 'center' });
        });
        currentY += headerRowHeight;

        // Row 2: Day / Meditation / Periods
        doc.rect(startX, currentY, dayColWidth, headerRowHeight).fillAndStroke('#f0f0f0', '#000000');
        doc.fillColor('black').text('Day', startX + 2, currentY + 8);
        doc.rect(startX + dayColWidth, currentY, medColWidth, headerRowHeight).fillAndStroke('#fcfcfc', '#000000');
        doc.fillColor('black').fontSize(7).text('9-9.10', startX + dayColWidth, currentY + 8, { width: medColWidth, align: 'center' });
        FIXED_PERIODS.forEach((p, i) => {
            const x = startX + dayColWidth + medColWidth + (i * periodWidth);
            doc.rect(x, currentY, periodWidth, headerRowHeight).fillAndStroke('#f0f0f0', '#000000');
            doc.fillColor('black').fontSize(8).text(p.time, x, currentY + 8, { width: periodWidth, align: 'center' });
        });
        currentY += headerRowHeight;

        // 3. Grid Data
        DAYS.forEach((day) => {
            // Day Label
            doc.rect(startX, currentY, dayColWidth, rowHeight).stroke();
            doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
            doc.text(day.substring(0, 3).toUpperCase(), startX + 2, currentY + 30, { width: dayColWidth - 4, align: 'center' });

            // Meditation Column
            doc.rect(startX + dayColWidth, currentY, medColWidth, rowHeight).stroke();
            doc.save();
            doc.translate(startX + dayColWidth + 20, currentY + rowHeight - 5);
            doc.rotate(-90);
            doc.fontSize(6).font('Helvetica').text('MEDITATION & NEWS READING', 0, 0);
            doc.restore();

            const dayEntries = timetableData.filter(e => e.day === day);
            const renderedPeriods = new Set();

            for (let i = 1; i <= 8; i++) {
                if (renderedPeriods.has(i)) continue;
                const entry = dayEntries.find(e => e.period_number === i);
                const x = startX + dayColWidth + medColWidth + ((i - 1) * periodWidth);

                if (entry) {
                    const span = (entry.end_period && entry.end_period > entry.period_number) ? (entry.end_period - entry.period_number + 1) : 1;
                    const cellWidth = periodWidth * span;
                    doc.rect(x, currentY, cellWidth, rowHeight).stroke();

                    const p = 5;
                    doc.font('Helvetica-Bold').fontSize(9).text(entry.course_code, x + p, currentY + 15, { width: cellWidth - p * 2, align: 'center' });
                    doc.font('Helvetica').fontSize(8).text(`(${entry.subject_name})`, x + p, currentY + 30, { width: cellWidth - p * 2, align: 'center' });
                    doc.fontSize(7).text(entry.venue, x + p, currentY + 50, { width: cellWidth - p * 2, align: 'center' });
                    for (let s = 0; s < span; s++) renderedPeriods.add(i + s);
                } else {
                    doc.rect(x, currentY, periodWidth, rowHeight).stroke();
                    renderedPeriods.add(i);
                }
            }
            currentY += rowHeight;
        });

        doc.y = currentY + 20;

        // 4. Breaks
        doc.fontSize(8).font('Helvetica').text('FN Break: 10.40 am - 11.00 am | Lunch Break: 12.40 pm - 01.30 pm | AN Break: 03.00 pm - 03.15 pm', { align: 'center' });
        doc.moveDown(2);

        // 5. Course Details Legend
        if (doc.y + 100 > doc.page.height) doc.addPage({ layout: 'landscape' });

        doc.fontSize(12).font('Helvetica-Bold').text('Course Details', startX);
        doc.moveDown(0.5);

        let legendY = doc.y;
        const totalLegendWidth = doc.page.width - 60;
        const lCols = [totalLegendWidth * 0.15, totalLegendWidth * 0.40, totalLegendWidth * 0.20, totalLegendWidth * 0.25];

        // Header
        doc.rect(startX, legendY, totalLegendWidth, 25).fillAndStroke('#f0f0f0', '#000000');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
        let lx = startX;
        ['Course Code', 'Course Name', 'Venue', 'Name of the Faculty'].forEach((h, i) => {
            doc.text(h, lx, legendY + 8, { width: lCols[i], align: 'center' });
            lx += lCols[i];
            if (i < 3) doc.moveTo(lx, legendY).lineTo(lx, legendY + 25).stroke();
        });
        legendY += 25;

        // Data
        const uniqueCourses = [];
        const seen = new Set();
        timetableData.forEach(item => {
            if (item.course_code && !seen.has(item.course_code)) {
                seen.add(item.course_code);
                uniqueCourses.push(item);
            }
        });

        doc.font('Helvetica').fontSize(9);
        uniqueCourses.forEach(c => {
            if (legendY + 25 > doc.page.height - 30) {
                doc.addPage({ layout: 'landscape' });
                legendY = 30;
                doc.moveTo(startX, legendY).lineTo(startX + totalLegendWidth, legendY).stroke();
            }
            doc.rect(startX, legendY, totalLegendWidth, 25).stroke();
            let dlx = startX;
            [c.course_code, c.subject_name, c.venue, c.faculty_name].forEach((txt, i) => {
                doc.text(txt || '-', dlx + 5, legendY + 8, { width: lCols[i] - 10, align: 'center' });
                dlx += lCols[i];
                if (i < 3) doc.moveTo(dlx, legendY).lineTo(dlx, legendY + 25).stroke();
            });
            legendY += 25;
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
};

exports.exportToWord = async (req, res) => {
    try {
        const { semester, section, venue } = req.query;
        let whereClause = {};
        let headerTitle = '';
        let subtitle = '';

        if (venue) {
            whereClause = { venue };
            headerTitle = 'LABORATORY TIME TABLE';
            subtitle = venue.toUpperCase();
        } else {
            whereClause = { semester: semester || 'I', section: section || 'A' };
            headerTitle = 'CLASS TIME TABLE';
            subtitle = `Semester ${whereClause.semester} - Section ${whereClause.section}`;
        }

        const timetableData = await Timetable.findAll({
            where: whereClause
        });

        const academicYear = 'AY 2025-26 — EVEN SEMESTER';
        const department = 'Dept of Artificial Intelligence & Data Science';
        const tableRows = [];

        // Header 1 (Hours)
        tableRows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: "Hours", style: "strong", alignment: AlignmentType.CENTER })], shading: { fill: "f0f0f0" } }),
                new TableCell({ children: [] }),
                ...FIXED_PERIODS.map(p => new TableCell({ children: [new Paragraph({ text: p.id.toString(), alignment: AlignmentType.CENTER })], shading: { fill: "f0f0f0" } }))
            ]
        }));

        // Header 2 (Day / Meditation / Times)
        tableRows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: "Day", style: "strong", alignment: AlignmentType.CENTER })], shading: { fill: "f0f0f0" } }),
                new TableCell({ children: [new Paragraph({ text: "9-9.10", alignment: AlignmentType.CENTER })] }),
                ...FIXED_PERIODS.map(p => new TableCell({ children: [new Paragraph({ text: p.time, alignment: AlignmentType.CENTER })], shading: { fill: "f0f0f0" } }))
            ]
        }));

        // Data Rows
        DAYS.forEach(day => {
            const dayEntries = timetableData.filter(e => e.day === day);
            const cells = [
                new TableCell({ children: [new Paragraph({ text: day.substring(0, 3).toUpperCase(), style: "strong", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ text: "Meditation", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })
            ];

            const renderedPeriods = new Set();
            for (let i = 1; i <= 8; i++) {
                if (renderedPeriods.has(i)) continue;

                const entry = dayEntries.find(e => e.period_number === i);
                if (entry) {
                    const span = (entry.end_period && entry.end_period > entry.period_number)
                        ? (entry.end_period - entry.period_number + 1)
                        : 1;

                    cells.push(new TableCell({
                        children: [
                            new Paragraph({ text: entry.course_code, style: "strong", alignment: AlignmentType.CENTER }),
                            new Paragraph({ text: `(${entry.subject_name})`, alignment: AlignmentType.CENTER }),
                            new Paragraph({ text: entry.venue, alignment: AlignmentType.CENTER })
                        ],
                        columnSpan: span,
                        verticalAlign: VerticalAlign.CENTER
                    }));
                    for (let s = 0; s < span; s++) renderedPeriods.add(i + s);
                } else {
                    cells.push(new TableCell({ children: [new Paragraph({ text: "-" })] }));
                    renderedPeriods.add(i);
                }
            }
            tableRows.push(new TableRow({ children: cells }));
        });

        // 4. legend (Course Details Table)
        const uniqueCourses = [];
        const seen = new Set();
        timetableData.forEach(item => {
            if (item.course_code && !seen.has(item.course_code)) {
                seen.add(item.course_code);
                uniqueCourses.push(item);
            }
        });

        const legendRows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: "Course Code", style: "strong" })], shading: { fill: "f0f0f0" } }),
                    new TableCell({ children: [new Paragraph({ text: "Course Name", style: "strong" })], shading: { fill: "f0f0f0" } }),
                    new TableCell({ children: [new Paragraph({ text: "Venue", style: "strong" })], shading: { fill: "f0f0f0" } }),
                    new TableCell({ children: [new Paragraph({ text: "Name of the Faculty", style: "strong" })], shading: { fill: "f0f0f0" } }),
                ]
            }),
            ...uniqueCourses.map(c => new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: c.course_code || "-" })] }),
                    new TableCell({ children: [new Paragraph({ text: c.subject_name || "-" })] }),
                    new TableCell({ children: [new Paragraph({ text: c.venue || "-" })] }),
                    new TableCell({ children: [new Paragraph({ text: c.faculty_name || "-" })] }),
                ]
            }))
        ];

        const doc = new Document({
            sections: [{
                properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
                children: [
                    new Paragraph({ text: department, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: headerTitle, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: academicYear, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: subtitle, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "" }),
                    new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        }
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "FN Break: 10.40-11.00 | Lunch: 12.40-1.30 | AN Break: 3.00-3.15" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "Course Details", heading: HeadingLevel.HEADING_3 }),
                    new Table({
                        rows: legendRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1 },
                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                            left: { style: BorderStyle.SINGLE, size: 1 },
                            right: { style: BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                        }
                    })
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=timetable.docx');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating Word document' });
    }
};
