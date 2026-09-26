const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Step 1: Register Admin
const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, confirm_password, status } = req.body;

        if (!username || !email || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (username, email, password, confirm_password)"
            });
        }

        // Check if password and confirm_password are same
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            });
        }

        // Validate if email is already registered
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);
        const currentDate = new Date().toLocaleString();

        const admin = await Admin.create({
            username,
            email,
            password: hashedPassword,
            confirm_password: hashedPassword,
            status: status !== undefined ? status : true,
            created_date: currentDate,
            updated_date: currentDate
        });

        const adminData = admin.toObject();
        delete adminData.password;
        delete adminData.confirm_password;

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: adminData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 2: Login Admin and Generate JWT Token
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (admin.status === false) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        const adminData = {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            status: admin.status,
            created_date: admin.created_date,
            updated_date: admin.updated_date
        };

        return res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            token,
            admin: adminData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin
};
