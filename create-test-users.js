// Create test users for employee tracking system
db = db.getSiblingDB('employee-tracking');

// Create admin user
db.users.insertOne({
    name: "Admin User",
    email: "admin@test.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVRSI0hQudO", // password123
    role: "ADMIN",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create employee user
db.users.insertOne({
    name: "Test Employee",
    email: "employee@test.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVRSI0hQudO", // password123
    role: "EMPLOYEE",
    employeeId: "EMP001",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

print("✅ Test users created successfully!");
print("Admin: admin@test.com / password123");
print("Employee: employee@test.com / password123");



