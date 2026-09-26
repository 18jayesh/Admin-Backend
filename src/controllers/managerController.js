const mongoose = require("mongoose");
const Manager = require("../models/managerModel");

// Step 3: Insert Manager Information (Protected by Admin Token)
const createManager = async (req, res) => {
    try {
        const {
            Name,
            name,
            email,
            phone,
            salary,
            designation,
            status
        } = req.body;

        const managerName = Name || name;

        if (!managerName || !email || !salary || !designation) {
            return res.status(400).json({
                success: false,
                message: "Name, email, salary, and designation are required"
            });
        }

        // Check if manager email already exists
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({
                success: false,
                message: "Manager with this email already exists"
            });
        }

        const currentDate = new Date().toLocaleString();

        const manager = await Manager.create({
            name: managerName,
            email,
            phone: phone || "",
            salary,
            designation,
            status: status !== undefined ? status : true,
            created_date: currentDate,
            updated_date: currentDate
        });

        return res.status(201).json({
            success: true,
            message: "Manager created successfully",
            manager
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 4: Get All Managers / Users Data
const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find().sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            total: managers.length,
            managers
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 5: Delete Manager by Parameter (id passed in req.params)
const deleteManagerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid manager ID format"
            });
        }

        const manager = await Manager.findById(id);
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }

        await Manager.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Manager deleted successfully",
            deletedManager: manager
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 6: Update Manager using PUT method
const updateManager = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid manager ID format"
            });
        }

        const manager = await Manager.findById(id);
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }

        // If email is being updated, verify it is not taken by another manager
        if (req.body.email && req.body.email !== manager.email) {
            const emailExists = await Manager.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already taken by another manager"
                });
            }
        }

        const updateData = {
            ...req.body,
            updated_date: new Date().toLocaleString()
        };

        if (req.body.Name && !req.body.name) {
            updateData.name = req.body.Name;
        }

        const updatedManager = await Manager.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: "after", runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Manager updated successfully",
            manager: updatedManager
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 7: Search Managers by name or email or phone
const searchManagers = async (req, res) => {
    try {
        const searchQuery = req.query.search || req.query.query || req.query.key || "";

        let filter = {};

        if (searchQuery.trim() !== "") {
            filter = {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                    { phone: { $regex: searchQuery, $options: "i" } }
                ]
            };
        }

        const managers = await Manager.find(filter).sort({ _id: -1 });

        return res.status(200).json({
            success: true,
            query: searchQuery,
            count: managers.length,
            managers
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 8: Pagination API
const getManagersWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalRecords = await Manager.countDocuments();
        const totalPages = Math.ceil(totalRecords / limit);

        const managers = await Manager.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            currentPage: page,
            limit,
            totalPages,
            totalRecords,
            managers
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Step 9: Multiple Delete Records API
const deleteMultipleManagers = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of manager IDs in 'ids'"
            });
        }

        // Validate each ID format
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid manager IDs provided"
            });
        }

        const deleteResult = await Manager.deleteMany({ _id: { $in: validIds } });

        return res.status(200).json({
            success: true,
            message: `${deleteResult.deletedCount} manager(s) deleted successfully`,
            deletedCount: deleteResult.deletedCount
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
    createManager,
    getAllManagers,
    deleteManagerById,
    updateManager,
    searchManagers,
    getManagersWithPagination,
    deleteMultipleManagers
};
