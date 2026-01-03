export const ROLES = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
};

export const LEAVE_TYPES = {
    PAID: 'Paid',
    SICK: 'Sick',
    UNPAID: 'Unpaid',
};

export const LEAVE_STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

export const ATTENDANCE_STATUS = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    HALF_DAY: 'Half-day',
    LEAVE: 'Leave',
};

export const PAYROLL_STATUS = {
    DRAFT: 'Draft',
    PROCESSED: 'Processed',
    PAID: 'Paid',
};

export const EMPLOYMENT_TYPES = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
};

export const DEFAULT_LEAVE_BALANCES = {
    PAID: 12,
    SICK: 6,
    UNPAID: 0,
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    EMPLOYEE_ID_EXISTS: 'Employee ID already exists',
    USER_NOT_FOUND: 'User not found',
    EMPLOYEE_NOT_FOUND: 'Employee not found',
    LEAVE_REQUEST_NOT_FOUND: 'Leave request not found',
    INSUFFICIENT_LEAVE_BALANCE: 'Insufficient leave balance',
    INVALID_DATE_RANGE: 'Invalid date range',
    INVALID_PASSWORD: 'Password does not meet requirements',
    EMAIL_NOT_VERIFIED: 'Email not verified',
};
