const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Faculty = sequelize.define("Faculty", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    qualification: { type: DataTypes.STRING, allowNull: false },
    designation: { type: DataTypes.STRING, allowNull: false },
    teachingExp: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    mobileNo: { type: DataTypes.STRING, allowNull: false, unique: true },
    profilePhoto: { type: DataTypes.STRING },
});

module.exports = Faculty;
