import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ENV } from './environment.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../data');

let db = null;

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const initializeDatabase = async () => {
    try {
        db = await open({
            filename: ENV.DB_PATH,
            driver: sqlite3.Database,
        });

        await db.configure('busyTimeout', 5000);

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Create tables
        await createTables();

        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

const createTables = async () => {
    const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Employee')),
      isEmailVerified INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      employeeId TEXT NOT NULL UNIQUE,
      phone TEXT,
      email TEXT NOT NULL,
      dateOfBirth TEXT,
      gender TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      country TEXT,
      profilePicture TEXT,
      designation TEXT,
      department TEXT,
      dateOfJoining TEXT NOT NULL,
      reportingTo TEXT,
      employmentType TEXT NOT NULL CHECK(employmentType IN ('Full-time', 'Part-time', 'Contract')),
      salary REAL,
      bankAccountNumber TEXT,
      bankName TEXT,
      bankIfscCode TEXT,
      panNumber TEXT,
      uanNumber TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      date TEXT NOT NULL,
      checkInTime TEXT,
      checkOutTime TEXT,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Half-day', 'Leave')),
      remarks TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(employeeId, date),
      FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leaveRequests (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      leaveType TEXT NOT NULL CHECK(leaveType IN ('Paid', 'Sick', 'Unpaid')),
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      numberOfDays INTEGER NOT NULL,
      remarks TEXT,
      status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
      approvedBy TEXT,
      approvalComments TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY(approvedBy) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      baseSalary REAL NOT NULL,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      bonus REAL DEFAULT 0,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      netSalary REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Draft', 'Processed', 'Paid')) DEFAULT 'Draft',
      paidDate TEXT,
      remarks TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(employeeId, month, year),
      FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS salaryComponents (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      componentName TEXT NOT NULL,
      componentType TEXT NOT NULL CHECK(componentType IN ('Earning', 'Deduction')),
      calculationType TEXT NOT NULL CHECK(calculationType IN ('Fixed', 'Percentage')),
      value REAL NOT NULL,
      description TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payrollDetails (
      id TEXT PRIMARY KEY,
      payrollId TEXT NOT NULL,
      componentName TEXT NOT NULL,
      componentType TEXT NOT NULL,
      calculatedAmount REAL NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(payrollId) REFERENCES payroll(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leaveBalances (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      year INTEGER NOT NULL,
      paidLeaveBalance INTEGER DEFAULT 12,
      sickLeaveBalance INTEGER DEFAULT 6,
      unpaidLeaveBalance INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(employeeId, year),
      FOREIGN KEY(employeeId) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auditLogs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      entityType TEXT,
      entityId TEXT,
      changes TEXT,
      ipAddress TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_employees_userId ON employees(userId);
    CREATE INDEX IF NOT EXISTS idx_attendance_employeeId_date ON attendance(employeeId, date);
    CREATE INDEX IF NOT EXISTS idx_leaveRequests_employeeId ON leaveRequests(employeeId);
    CREATE INDEX IF NOT EXISTS idx_payroll_employeeId ON payroll(employeeId);
    CREATE INDEX IF NOT EXISTS idx_salaryComponents_employeeId ON salaryComponents(employeeId);
    CREATE INDEX IF NOT EXISTS idx_payrollDetails_payrollId ON payrollDetails(payrollId);
    CREATE INDEX IF NOT EXISTS idx_leaveBalances_employeeId ON leaveBalances(employeeId);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

    try {
        await db.exec(schema);
    } catch (error) {
        if (!error.message.includes('already exists')) {
            throw error;
        }
    }
};

export const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};
