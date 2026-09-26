const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    confirm_password: {
        type: String,
        required: [true, "Confirm password is required"]
    },
    status: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: String,
        default: () => new Date().toLocaleString()
    },
    updated_date: {
        type: String,
        default: () => new Date().toLocaleString()
    }
}, {
    versionKey: false
});

module.exports = mongoose.model("Admin", adminSchema);
