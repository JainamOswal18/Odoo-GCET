import { initializeDatabase, getDb } from '../config/database.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { generateEmployeeId, generateRandomPassword } from '../utils/idGenerator.js';
import { v4 as uuidv4 } from 'uuid';

// Test data configuration
const TEST_DATA = {
    admins: [
        { 
            firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.admin@hrms.com', 
            department: 'HR', designation: 'HR Manager', phone: '+91 9876543200',
            dateOfBirth: '1988-06-15', gender: 'Female',
            address: '456 Park Avenue, Tower A', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India',
            salary: 120000,
            bankAccountNumber: '9876543210123456', bankName: 'ICICI Bank', bankIfscCode: 'ICIC0001234',
            panNumber: 'ABCDE5678G', uanNumber: '987654321012'
        },
        { 
            firstName: 'Michael', lastName: 'Chen', email: 'michael.admin@hrms.com', 
            department: 'HR', designation: 'Admin', phone: '+91 9876543201',
            dateOfBirth: '1990-09-22', gender: 'Male',
            address: '789 Corporate Street, Building B', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India',
            salary: 110000,
            bankAccountNumber: '8765432109876543', bankName: 'Axis Bank', bankIfscCode: 'UTIB0001234',
            panNumber: 'FGHIJ9012K', uanNumber: '876543210987'
        }
    ],
    employees: [
        { 
            firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', 
            department: 'Engineering', designation: 'Software Engineer', phone: '+91 9876543210',
            dateOfBirth: '1992-03-10', gender: 'Male',
            address: '12 Garden View Apartments', city: 'Pune', state: 'Maharashtra', zipCode: '411001', country: 'India',
            salary: 75000,
            bankAccountNumber: '1234567890123456', bankName: 'State Bank of India', bankIfscCode: 'SBIN0012345',
            panNumber: 'ABCDE1234F', uanNumber: '123456789012'
        },
        { 
            firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', 
            department: 'Engineering', designation: 'Senior Developer', phone: '+91 9876543211',
            dateOfBirth: '1990-07-25', gender: 'Female',
            address: '45 Lakeview Residency', city: 'Hyderabad', state: 'Telangana', zipCode: '500001', country: 'India',
            salary: 95000,
            bankAccountNumber: '2345678901234567', bankName: 'HDFC Bank', bankIfscCode: 'HDFC0001234',
            panNumber: 'BCDEF2345G', uanNumber: '234567890123'
        },
        { 
            firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@company.com', 
            department: 'Marketing', designation: 'Marketing Manager', phone: '+91 9876543212',
            dateOfBirth: '1985-11-30', gender: 'Male',
            address: '78 Skyline Towers', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India',
            salary: 85000,
            bankAccountNumber: '3456789012345678', bankName: 'ICICI Bank', bankIfscCode: 'ICIC0001235',
            panNumber: 'CDEFG3456H', uanNumber: '345678901234'
        },
        { 
            firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@company.com', 
            department: 'Sales', designation: 'Sales Executive', phone: '+91 9876543213',
            dateOfBirth: '1993-02-14', gender: 'Female',
            address: '23 Business Park Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001', country: 'India',
            salary: 65000,
            bankAccountNumber: '4567890123456789', bankName: 'Kotak Mahindra Bank', bankIfscCode: 'KKBK0001234',
            panNumber: 'DEFGH4567I', uanNumber: '456789012345'
        },
        { 
            firstName: 'David', lastName: 'Wilson', email: 'david.wilson@company.com', 
            department: 'Engineering', designation: 'DevOps Engineer', phone: '+91 9876543214',
            dateOfBirth: '1991-08-05', gender: 'Male',
            address: '56 Tech Valley Phase 2', city: 'Bangalore', state: 'Karnataka', zipCode: '560002', country: 'India',
            salary: 88000,
            bankAccountNumber: '5678901234567890', bankName: 'Axis Bank', bankIfscCode: 'UTIB0001235',
            panNumber: 'EFGHI5678J', uanNumber: '567890123456'
        },
        { 
            firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@company.com', 
            department: 'Finance', designation: 'Accountant', phone: '+91 9876543215',
            dateOfBirth: '1989-12-20', gender: 'Female',
            address: '34 Finance Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400002', country: 'India',
            salary: 70000,
            bankAccountNumber: '6789012345678901', bankName: 'HDFC Bank', bankIfscCode: 'HDFC0001236',
            panNumber: 'FGHIJ6789K', uanNumber: '678901234567'
        },
        { 
            firstName: 'James', lastName: 'Taylor', email: 'james.taylor@company.com', 
            department: 'Engineering', designation: 'Backend Developer', phone: '+91 9876543216',
            dateOfBirth: '1994-04-18', gender: 'Male',
            address: '67 Innovation Hub', city: 'Pune', state: 'Maharashtra', zipCode: '411002', country: 'India',
            salary: 72000,
            bankAccountNumber: '7890123456789012', bankName: 'State Bank of India', bankIfscCode: 'SBIN0012346',
            panNumber: 'GHIJK7890L', uanNumber: '789012345678'
        },
        { 
            firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@company.com', 
            department: 'Design', designation: 'UI/UX Designer', phone: '+91 9876543217',
            dateOfBirth: '1992-09-08', gender: 'Female',
            address: '89 Creative Studios', city: 'Gurgaon', state: 'Haryana', zipCode: '122001', country: 'India',
            salary: 68000,
            bankAccountNumber: '8901234567890123', bankName: 'ICICI Bank', bankIfscCode: 'ICIC0001237',
            panNumber: 'HIJKL8901M', uanNumber: '890123456789'
        },
        { 
            firstName: 'Thomas', lastName: 'Martinez', email: 'thomas.martinez@company.com', 
            department: 'Operations', designation: 'Operations Manager', phone: '+91 9876543218',
            dateOfBirth: '1987-05-12', gender: 'Male',
            address: '90 Business District', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301', country: 'India',
            salary: 92000,
            bankAccountNumber: '9012345678901234', bankName: 'Kotak Mahindra Bank', bankIfscCode: 'KKBK0001235',
            panNumber: 'IJKLM9012N', uanNumber: '901234567890'
        },
        { 
            firstName: 'Jennifer', lastName: 'Rodriguez', email: 'jennifer.rodriguez@company.com', 
            department: 'Marketing', designation: 'Content Writer', phone: '+91 9876543219',
            dateOfBirth: '1995-01-28', gender: 'Female',
            address: '12 Media House Complex', city: 'Mumbai', state: 'Maharashtra', zipCode: '400003', country: 'India',
            salary: 55000,
            bankAccountNumber: '0123456789012345', bankName: 'Axis Bank', bankIfscCode: 'UTIB0001236',
            panNumber: 'JKLMN0123O', uanNumber: '012345678901'
        }
    ]
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function createUser(db, userData, role, serialNumber) {
    const { 
        firstName, lastName, email, department, designation, phone,
        dateOfBirth, gender, address, city, state, zipCode, country,
        salary, bankAccountNumber, bankName, bankIfscCode, panNumber, uanNumber
    } = userData;
    const year = new Date().getFullYear();
    
    // Generate credentials
    const loginId = generateEmployeeId(firstName, lastName, year, serialNumber);
    const password = generateRandomPassword();
    const hashedPassword = await hashPassword(password);
    
    const userId = uuidv4();
    const employeeId = uuidv4();
    const now = new Date().toISOString();
    
    // Create user
    await db.run(
        `INSERT INTO users (id, email, password, role, isEmailVerified, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, email, hashedPassword, role, 1, 1, now, now]
    );
    
    // Create employee record with all fields
    await db.run(
        `INSERT INTO employees (
            id, userId, firstName, lastName, employeeId, email, phone, 
            dateOfBirth, gender, address, city, state, zipCode, country,
            dateOfJoining, employmentType, designation, department, salary,
            bankAccountNumber, bankName, bankIfscCode, panNumber, uanNumber,
            createdAt, updatedAt
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            employeeId, userId, firstName, lastName, loginId, email, phone || '+91 9999999999',
            dateOfBirth, gender, address, city, state, zipCode, country,
            now, 'Full-time', designation, department, salary,
            bankAccountNumber, bankName, bankIfscCode, panNumber, uanNumber,
            now, now
        ]
    );
    
    // Create leave balance
    await db.run(
        `INSERT INTO leaveBalances (id, employeeId, year, paidLeaveBalance, sickLeaveBalance, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), employeeId, year, 24, 7, now, now]
    );
    
    return { userId, employeeId, loginId, password, email, firstName, lastName };
}

async function generateAttendanceData(db, employeeId, monthsBack = 2) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const records = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            const random = Math.random();
            let status;
            
            if (random < 0.85) {
                status = 'Present';
            } else if (random < 0.95) {
                status = 'Absent';
            } else {
                status = 'Half-day';
            }
            
            const date = formatDate(currentDate);
            const checkInTime = random < 0.85 ? `${date}T09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00.000Z` : null;
            const checkOutTime = checkInTime && random < 0.85 ? `${date}T18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00.000Z` : null;
            
            records.push({
                id: uuidv4(),
                employeeId,
                date,
                status,
                checkInTime,
                checkOutTime,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Insert attendance records
    for (const record of records) {
        await db.run(
            `INSERT INTO attendance (id, employeeId, date, status, checkInTime, checkOutTime, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [record.id, record.employeeId, record.date, record.status, record.checkInTime, record.checkOutTime, record.createdAt, record.updatedAt]
        );
    }
    
    return records.length;
}

async function generateLeaveRequests(db, employeeId, count = 5) {
    const now = new Date();
    const records = [];
    
    for (let i = 0; i < count; i++) {
        const startDate = getRandomDate(new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days
        
        const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const leaveType = getRandomElement(['Paid', 'Sick', 'Unpaid']);
        const status = getRandomElement(['Pending', 'Approved', 'Rejected']);
        const reasons = [
            'Family emergency',
            'Medical appointment',
            'Personal work',
            'Wedding ceremony',
            'Vacation',
            'Home renovation',
            'Child care',
            'Health checkup'
        ];
        
        const record = {
            id: uuidv4(),
            employeeId,
            leaveType,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            numberOfDays,
            remarks: getRandomElement(reasons),
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        records.push(record);
        
        await db.run(
            `INSERT INTO leaveRequests (id, employeeId, leaveType, startDate, endDate, numberOfDays, remarks, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [record.id, record.employeeId, record.leaveType, record.startDate, record.endDate, record.numberOfDays, record.remarks, record.status, record.createdAt, record.updatedAt]
        );
    }
    
    return records.length;
}

async function generateSalaryComponents(db, employeeId) {
    const components = [
        {
            componentName: 'House Rent Allowance',
            componentType: 'Earning',
            calculationType: 'Percentage',
            value: 40,
            description: 'Housing allowance based on base salary'
        },
        {
            componentName: 'Dearness Allowance',
            componentType: 'Earning',
            calculationType: 'Percentage',
            value: 10,
            description: 'Cost of living adjustment allowance'
        },
        {
            componentName: 'Medical Allowance',
            componentType: 'Earning',
            calculationType: 'Fixed',
            value: 2000,
            description: 'Fixed monthly medical allowance'
        },
        {
            componentName: 'Transport Allowance',
            componentType: 'Earning',
            calculationType: 'Fixed',
            value: 1500,
            description: 'Fixed transport/conveyance allowance'
        },
        {
            componentName: 'Provident Fund',
            componentType: 'Deduction',
            calculationType: 'Percentage',
            value: 12,
            description: 'Employee PF contribution (12% of basic)'
        },
        {
            componentName: 'Professional Tax',
            componentType: 'Deduction',
            calculationType: 'Fixed',
            value: 200,
            description: 'State professional tax deduction'
        },
        {
            componentName: 'Income Tax',
            componentType: 'Deduction',
            calculationType: 'Percentage',
            value: 10,
            description: 'Tax Deducted at Source (TDS)'
        }
    ];
    
    for (const comp of components) {
        await db.run(
            `INSERT INTO salaryComponents (id, employeeId, componentName, componentType, calculationType, value, description, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
            [
                uuidv4(),
                employeeId,
                comp.componentName,
                comp.componentType,
                comp.calculationType,
                comp.value,
                comp.description,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );
    }
    
    return components.length;
}

async function generatePayrollData(db, employeeId, designation) {
    const now = new Date();
    const salaries = {
        'Software Engineer': 45000,
        'Senior Developer': 75000,
        'Backend Developer': 55000,
        'DevOps Engineer': 60000,
        'UI/UX Designer': 50000,
        'Marketing Manager': 70000,
        'Sales Executive': 40000,
        'Accountant': 45000,
        'Operations Manager': 65000,
        'Content Writer': 35000,
        'HR Manager': 60000,
        'Admin': 55000
    };
    
    const baseSalary = salaries[designation] || 45000;
    const allowances = Math.round(baseSalary * 0.5); // HRA + DA combined
    const bonus = Math.round(baseSalary * 0.1);
    const deductions = Math.round(baseSalary * 0.22); // PF + Tax combined
    const netSalary = baseSalary + allowances + bonus - deductions;
    
    // Generate payroll for last 3 months
    for (let i = 0; i < 3; i++) {
        const payrollDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const payrollMonth = String(payrollDate.getMonth() + 1).padStart(2, '0');
        const payrollYear = payrollDate.getFullYear();
        
        await db.run(
            `INSERT INTO payroll (id, employeeId, month, year, baseSalary, allowances, deductions, bonus, netSalary, status, paidDate, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                uuidv4(),
                employeeId,
                payrollMonth,
                payrollYear,
                baseSalary,
                allowances,
                deductions,
                bonus,
                netSalary,
                i === 0 ? 'Draft' : 'Paid',
                i === 0 ? null : formatDate(new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 5)),
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );
    }
}

async function seedTestData() {
    try {
        console.log('🚀 Starting test data generation...\n');
        await initializeDatabase();
        
        const db = getDb();
        const credentials = [];
        let serialNumber = 1;
        
        // Create Admins/HRs
        console.log('👤 Creating Admin users...');
        for (const admin of TEST_DATA.admins) {
            const created = await createUser(db, admin, 'Admin', serialNumber++);
            credentials.push({ ...created, role: 'Admin' });
            console.log(`   ✓ Created Admin: ${created.firstName} ${created.lastName}`);
        }
        
        console.log('\n👥 Creating Employee users...');
        // Create Employees
        for (const employee of TEST_DATA.employees) {
            const created = await createUser(db, employee, 'Employee', serialNumber++);
            credentials.push({ ...created, role: 'Employee' });
            console.log(`   ✓ Created Employee: ${created.firstName} ${created.lastName}`);
            
            // Generate salary components
            const componentCount = await generateSalaryComponents(db, created.employeeId);
            console.log(`      → Generated ${componentCount} salary components`);
            
            // Generate attendance data
            const attendanceCount = await generateAttendanceData(db, created.employeeId);
            console.log(`      → Generated ${attendanceCount} attendance records`);
            
            // Generate leave requests
            const leaveCount = await generateLeaveRequests(db, created.employeeId);
            console.log(`      → Generated ${leaveCount} leave requests`);
            
            // Generate payroll data
            await generatePayrollData(db, created.employeeId, employee.designation);
            console.log(`      → Generated payroll data for 3 months`);
        }
        
        console.log('\n' + '═'.repeat(80));
        console.log('✅ TEST DATA GENERATION COMPLETE!');
        console.log('═'.repeat(80) + '\n');
        
        console.log('📋 LOGIN CREDENTIALS:\n');
        console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
        
        // Display Admins
        console.log('│ 👑 ADMINS / HR                                                                 │');
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        credentials.filter(c => c.role === 'Admin').forEach(cred => {
            console.log(`│ ${cred.firstName} ${cred.lastName}`.padEnd(78) + '│');
            console.log(`│   Login ID : ${cred.loginId}`.padEnd(78) + '│');
            console.log(`│   Email    : ${cred.email}`.padEnd(78) + '│');
            console.log(`│   Password : ${cred.password}`.padEnd(78) + '│');
            console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        });
        
        // Display Employees
        console.log('│ 👤 EMPLOYEES                                                                   │');
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        credentials.filter(c => c.role === 'Employee').forEach(cred => {
            console.log(`│ ${cred.firstName} ${cred.lastName}`.padEnd(78) + '│');
            console.log(`│   Login ID : ${cred.loginId}`.padEnd(78) + '│');
            console.log(`│   Email    : ${cred.email}`.padEnd(78) + '│');
            console.log(`│   Password : ${cred.password}`.padEnd(78) + '│');
            console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        });
        
        console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
        
        console.log('📊 STATISTICS:');
        console.log(`   • Total Users: ${credentials.length}`);
        console.log(`   • Admins: ${credentials.filter(c => c.role === 'Admin').length}`);
        console.log(`   • Employees: ${credentials.filter(c => c.role === 'Employee').length}`);
        console.log(`   • Attendance Records: ~${TEST_DATA.employees.length * 40}`);
        console.log(`   • Leave Requests: ${TEST_DATA.employees.length * 5}`);
        console.log(`   • Payroll Records: ${TEST_DATA.employees.length * 3}\n`);
        
        console.log('⚠️  Save these credentials securely!');
        console.log('⚠️  All users can login immediately\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        process.exit(1);
    }
}

seedTestData();
