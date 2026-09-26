const express = require("express");

const adminRoutes = require("./routes/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Welcome Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Admin & Manager API Server"
    });
});

// Mount Routes
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

module.exports = app;
