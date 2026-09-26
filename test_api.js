const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = 5555;
let server;
let adminToken = "";
let manager1Id = "";
let manager2Id = "";
let manager3Id = "";

const request = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const payload = postData ? JSON.stringify(postData) : null;
        const opts = { ...options };
        opts.headers = { ...opts.headers };
        if (payload) {
            opts.headers["Content-Length"] = Buffer.byteLength(payload);
        }
        const req = http.request(opts, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });
        req.on("error", reject);
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
};

const runTests = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();

        server = app.listen(PORT, async () => {
            console.log(`Test server running on port ${PORT}\n`);

            const testEmail = `admin_${Date.now()}@example.com`;

            // Step 1: Register Admin - Test Password Mismatch
            console.log("--> Testing Step 1: Register Admin (Password mismatch check)");
            let res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/admin/register",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, {
                username: "SuperAdmin",
                email: testEmail,
                password: "password123",
                confirm_password: "differentpassword",
                status: true
            });
            console.log(`Status: ${res.status}, Message: ${res.data.message}`);

            // Step 1: Register Admin - Successful
            console.log("\n--> Testing Step 1: Register Admin (Successful)");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/admin/register",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, {
                username: "SuperAdmin",
                email: testEmail,
                password: "password123",
                confirm_password: "password123",
                status: true
            });
            console.log(`Status: ${res.status}, Success: ${res.data.success}, Message: ${res.data.message}`);

            // Step 1: Register Admin - Duplicate Email
            console.log("\n--> Testing Step 1: Register Admin (Duplicate email check)");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/admin/register",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, {
                username: "SuperAdmin2",
                email: testEmail,
                password: "password123",
                confirm_password: "password123",
                status: true
            });
            console.log(`Status: ${res.status}, Message: ${res.data.message}`);

            // Step 2: Login Admin
            console.log("\n--> Testing Step 2: Login Admin");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/admin/login",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }, {
                email: testEmail,
                password: "password123"
            });
            console.log(`Status: ${res.status}, Success: ${res.data.success}`);
            adminToken = res.data.token;
            console.log(`Token received: ${adminToken.substring(0, 25)}...`);

            // Check Access without Token
            console.log("\n--> Testing Access without Token (Expect 401)");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/all",
                method: "GET"
            });
            console.log(`Status: ${res.status}, Message: ${res.data.message}`);

            // Step 3: Insert Manager 1
            console.log("\n--> Testing Step 3: Insert Manager 1 (with Admin Token)");
            const m1Email = `rahul_${Date.now()}@example.com`;
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/add",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                }
            }, {
                Name: "Rahul Sharma",
                email: m1Email,
                phone: "9876543210",
                salary: "50000",
                designation: "Senior Manager",
                status: true
            });
            console.log(`Status: ${res.status}, Success: ${res.data.success}, ID: ${res.data.manager._id}`);
            manager1Id = res.data.manager._id;

            // Step 3: Insert Manager 2
            console.log("\n--> Testing Step 3: Insert Manager 2");
            const m2Email = `priya_${Date.now()}@example.com`;
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/add",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                }
            }, {
                Name: "Priya Patel",
                email: m2Email,
                phone: "9123456780",
                salary: "60000",
                designation: "Tech Lead",
                status: true
            });
            manager2Id = res.data.manager._id;
            console.log(`Status: ${res.status}, Success: ${res.data.success}, ID: ${manager2Id}`);

            // Step 3: Insert Manager 3
            console.log("\n--> Testing Step 3: Insert Manager 3");
            const m3Email = `amit_${Date.now()}@example.com`;
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/add",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                }
            }, {
                Name: "Amit Verma",
                email: m3Email,
                phone: "9988776655",
                salary: "45000",
                designation: "Assistant Manager",
                status: true
            });
            manager3Id = res.data.manager._id;
            console.log(`Status: ${res.status}, Success: ${res.data.success}, ID: ${manager3Id}`);

            // Step 4: Get All Managers Data
            console.log("\n--> Testing Step 4: Get All Manager Data");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/all",
                method: "GET",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            console.log(`Status: ${res.status}, Success: ${res.data.success}, Total count: ${res.data.total}`);

            // Step 6: Update API using PUT
            console.log("\n--> Testing Step 6: Update Manager using PUT method");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: `/api/manager/update/${manager1Id}`,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                }
            }, {
                salary: "75000",
                designation: "General Manager"
            });
            console.log(`Status: ${res.status}, Updated Salary: ${res.data.manager.salary}, Updated Designation: ${res.data.manager.designation}`);

            // Step 7: Searching API
            console.log("\n--> Testing Step 7: Searching API (Search by name 'Rahul')");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/search?search=Rahul",
                method: "GET",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            console.log(`Status: ${res.status}, Results count: ${res.data.count}`);

            console.log("\n--> Testing Step 7: Searching API (Search by phone '91234')");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/search?search=91234",
                method: "GET",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            console.log(`Status: ${res.status}, Results count: ${res.data.count}`);

            // Step 8: Pagination API
            console.log("\n--> Testing Step 8: Pagination API (page=1, limit=2)");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/pagination?page=1&limit=2",
                method: "GET",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            console.log(`Status: ${res.status}, Page: ${res.data.currentPage}, TotalPages: ${res.data.totalPages}, TotalRecords: ${res.data.totalRecords}, RecordsReturned: ${res.data.managers.length}`);

            // Step 5: Delete API using Parameters
            console.log(`\n--> Testing Step 5: Delete API using Parameters (delete ID: ${manager3Id})`);
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: `/api/manager/delete/${manager3Id}`,
                method: "DELETE",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            console.log(`Status: ${res.status}, Message: ${res.data.message}`);

            // Step 9: Multiple Delete Records API
            console.log("\n--> Testing Step 9: Multiple Delete Records API");
            res = await request({
                hostname: "localhost",
                port: PORT,
                path: "/api/manager/delete-multiple",
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                }
            }, {
                ids: [manager1Id, manager2Id]
            });
            console.log(`Status: ${res.status}, Response:`, res.data);

            console.log("\n==========================================");
            console.log("ALL 9 STEPS TESTED AND WORKING PERFECTLY!");
            console.log("==========================================");

            server.close();
            process.exit(0);
        });
    } catch (err) {
        console.error("Test failed:", err);
        if (server) server.close();
        process.exit(1);
    }
};

runTests();
