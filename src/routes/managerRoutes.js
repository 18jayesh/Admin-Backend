const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createManager,
    getAllManagers,
    deleteManagerById,
    updateManager,
    searchManagers,
    getManagersWithPagination,
    deleteMultipleManagers
} = require("../controllers/managerController");

// Apply Admin Auth Middleware to all manager routes
router.use(authMiddleware);

// Step 3: Insert Manager Information
router.post("/add", createManager);
router.post("/", createManager);

// Step 7: Searching API (Must be before parameterized routes)
router.get("/search", searchManagers);

// Step 8: Pagination API (Must be before parameterized routes)
router.get("/pagination", getManagersWithPagination);

// Step 9: Multiple Delete Records API
router.delete("/delete-multiple", deleteMultipleManagers);
router.post("/delete-multiple", deleteMultipleManagers);

// Step 4: Get All Managers / Users Data
router.get("/all", getAllManagers);
router.get("/", getAllManagers);

// Step 6: Update API using PUT method
router.put("/update/:id", updateManager);
router.put("/:id", updateManager);

// Step 5: Delete API using Parameters
router.delete("/delete/:id", deleteManagerById);
router.delete("/:id", deleteManagerById);

module.exports = router;
