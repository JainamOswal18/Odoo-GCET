# Test Data Seeding Script

## Overview
This script generates comprehensive test data for the HRMS application, including:
- 2 Admin/HR users
- 10 Employee users
- Attendance records (2 months of data)
- Leave requests (5 per employee)
- Payroll data (3 months per employee)

## Usage

### Run the seed script:
```bash
cd server
npm run seed
```

### What it creates:

#### Admins (2 users):
- Sarah Johnson - HR Manager
- Michael Chen - Admin

#### Employees (10 users):
- John Doe - Software Engineer (Engineering)
- Jane Smith - Senior Developer (Engineering)
- Robert Brown - Marketing Manager (Marketing)
- Emily Davis - Sales Executive (Sales)
- David Wilson - DevOps Engineer (Engineering)
- Lisa Anderson - Accountant (Finance)
- James Taylor - Backend Developer (Engineering)
- Maria Garcia - UI/UX Designer (Design)
- Thomas Martinez - Operations Manager (Operations)
- Jennifer Rodriguez - Content Writer (Marketing)

### Generated Data:

**Attendance Records:**
- ~40 records per employee (2 months)
- Mix of present (85%), absent (10%), half-day (5%)
- Excludes weekends
- Random check-in/check-out times

**Leave Requests:**
- 5 requests per employee
- Random dates throughout the year
- Mix of: Paid Time Off, Sick Leave, Unpaid Leaves
- Random statuses: pending, approved, rejected
- Varied reasons (family emergency, medical, vacation, etc.)

**Payroll Data:**
- 3 months of payroll records per employee
- Department-specific salaries
- Auto-calculated: HRA (40%), DA (10%), Bonus (10%), PF (12%), Tax (10%)
- Most recent month as "pending", older as "paid"

### Output:
The script will display all login credentials in a formatted table with:
- Login IDs
- Email addresses
- Auto-generated passwords

### Note:
⚠️ Save the credentials immediately after running the script!
⚠️ All users have verified emails and can login right away
⚠️ This script is for testing purposes only - don't use in production!

## Clean Up
To reset and start fresh:
```bash
# Delete the database
rm data/database.sqlite

# Re-initialize
npm run init-db

# Run seed again
npm run seed
```
