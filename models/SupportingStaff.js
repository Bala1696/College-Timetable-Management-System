const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportingStaff = sequelize.define("SupportingStaff", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    qualification: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    designation: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    experience: {
        type: DataTypes.STRING, // e.g. "5 Years"
        allowNull: true,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },

    mobileNo: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    profilePhoto: {
        type: DataTypes.STRING, // filename only
        allowNull: true,
    },
},
    {
        tableName: "supporting_staff",
        timestamps: true,
    });

module.exports = SupportingStaff;
