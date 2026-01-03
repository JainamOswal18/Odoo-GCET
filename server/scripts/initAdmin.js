import { initializeDatabase, getDb } from '../config/database.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { generateEmployeeId, generateRandomPassword } from '../utils/idGenerator.js';
import { v4 as uuidv4 } from 'uuid';

async function initializeAdmin() {
    try {
        console.log('🚀 Initializing database...');
        await initializeDatabase();
        
        const db = getDb();
        
        // Check if admin already exists
        const existingAdmin = await db.get('SELECT * FROM users WHERE role = "Admin"');
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            
            // Get employee details
            const employee = await db.get('SELECT * FROM employees WHERE userId = ?', [existingAdmin.id]);
            
            if (employee) {
                console.log('\n📋 Existing Admin Credentials:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`Login ID: ${employee.employeeId}`);
                console.log(`Email: ${existingAdmin.email}`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
                console.log('⚠️  Password was set during initial creation\n');
            }
            
            process.exit(0);
        }
        
        // Create default admin user
        const adminEmail = 'admin@hrms.com';
        const firstName = 'Admin';
        const lastName = 'User';
        const phone = '+91 9999999999';
        const year = new Date().getFullYear();
        
        // Generate credentials
        const loginId = generateEmployeeId(firstName, lastName, year, 1);
        const password = generateRandomPassword();
        const hashedPassword = await hashPassword(password);
        
        const userId = uuidv4();
        const now = new Date().toISOString();
        
        // Create user
        await db.run(
            `INSERT INTO users (id, email, password, role, isEmailVerified, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, adminEmail, hashedPassword, 'Admin', 1, 1, now, now]
        );
        
        // Create employee record
        const employeeId = uuidv4();
        await db.run(
            `INSERT INTO employees (id, userId, firstName, lastName, employeeId, email, phone, dateOfJoining, employmentType, designation, department, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employeeId, userId, firstName, lastName, loginId, adminEmail, phone, now, 'Full-time', 'System Administrator', 'HR', now, now]
        );
        
        // Create leave balance
        await db.run(
            `INSERT INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), employeeId, year, 12, 6, now, now]
        );
        
        console.log('\n✅ Admin user created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Admin Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Login ID: ${loginId}`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  Please save these credentials securely!');
        console.log('⚠️  Change the password after first login\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
        process.exit(1);
    }
}

initializeAdmin();
