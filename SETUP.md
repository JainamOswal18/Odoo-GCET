# 🚀 HRMS Setup Guide

## Prerequisites
- Node.js v16 or higher
- npm or yarn package manager

## Backend Setup

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and update the values
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
- `JWT_SECRET`: Change this to a secure random string (minimum 32 characters)
- `EMAIL_USER` & `EMAIL_PASSWORD`: Optional, for email notifications

### 4. Initialize Database & Create Admin User
```bash
# This will create the database and a default admin account
npm run init-admin
```

**Save the credentials shown in the terminal!** They look like:
```
Login ID: OIADUS20260001
Email: admin@hrms.com
Password: BounceArmadillo
```

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: `http://localhost:5000`

---

## Frontend Setup

### 1. Navigate to Client Directory
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env
```

The default API URL is `http://localhost:5000/api` - no changes needed for local development.

### 4. Start the Development Server
```bash
npm run dev
```

Client will run on: `http://localhost:3000`

---

## 🎯 First Login

1. **Open your browser**: Navigate to `http://localhost:3000`

2. **Sign In as Admin**:
   - Use the Login ID and Password from the init-admin step
   - Or use the email: `admin@hrms.com`

3. **Change Your Password**:
   - Go to Profile → Security
   - Change the default password immediately

4. **Register Employees**:
   - Navigate to the Sign Up page (Admin only)
   - Fill in employee details
   - System will auto-generate Login ID (format: `OI[FirstName2][LastName2][Year][Serial]`)
   - System will auto-generate initial password
   - Share credentials with the employee securely

---

## 📋 Login ID Format

Employee Login IDs are automatically generated in this format:

```
OI + [First 2 letters of First Name] + [First 2 letters of Last Name] + [Year] + [Serial Number]
```

**Examples:**
- John Doe joining in 2026 (1st employee): `OIJODO20260001`
- Jane Smith joining in 2026 (2nd employee): `OIJASM20260002`

---

## 🔐 Authentication Flow

### For Admin/HR:
1. Login with admin credentials
2. Access Sign Up page to register new employees
3. System generates Login ID and password
4. Share credentials with employee

### For Employees:
1. Receive Login ID and password from HR
2. Sign in at the login page
3. Change password on first login (recommended)
4. Access employee features

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Login ID or Email
- `POST /api/auth/register` - Register new employee (Admin only)
- `POST /api/auth/change-password` - Change password

### Employees
- `GET /api/employees` - Get all employees (Admin only)
- `GET /api/employees/:id` - Get employee profile
- `PUT /api/employees/:id` - Update employee profile

### Attendance
- `POST /api/attendance/:employeeId/check-in` - Check in
- `POST /api/attendance/:employeeId/check-out` - Check out
- `GET /api/attendance/:employeeId` - Get attendance records

### Leave
- `POST /api/leave/:employeeId/apply` - Apply for leave
- `GET /api/leave/:employeeId` - Get leave requests
- `POST /api/leave/approve/:id` - Approve leave (Admin only)
- `POST /api/leave/reject/:id` - Reject leave (Admin only)

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

---

## 🔧 Troubleshooting

### Backend Issues

**Database not found:**
```bash
npm run init-admin
```

**Port already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**Authentication errors:**
- Ensure JWT_SECRET is set in .env
- Check that token is included in requests

### Frontend Issues

**API connection failed:**
- Check that backend is running on port 5000
- Verify VITE_API_URL in .env matches backend URL

**CORS errors:**
- Backend CORS is configured for http://localhost:3000
- If using different port, update FRONTEND_URL in backend .env

---

## 📁 Project Structure

```
Odoo-GCET/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth, Toast)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # CSS styles
│   └── .env               # Frontend environment variables
│
└── server/                # Express backend
    ├── config/            # Configuration files
    ├── controllers/       # Business logic
    ├── middleware/        # Express middleware
    ├── routes/            # API routes
    ├── scripts/           # Utility scripts
    ├── utils/             # Helper functions
    ├── validators/        # Input validation
    ├── data/              # SQLite database
    └── .env              # Backend environment variables
```

---

## 🎨 Features

### Admin Features
- ✅ Employee registration with auto-generated credentials
- ✅ Employee management
- ✅ Leave approval/rejection
- ✅ Attendance monitoring
- ✅ Payroll management
- ✅ Attendance reports
- ✅ Dashboard analytics

### Employee Features
- ✅ Personal dashboard
- ✅ Profile management
- ✅ Attendance check-in/out
- ✅ Leave application
- ✅ Salary slip viewing
- ✅ Leave balance tracking

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ Role-based access control
- ✅ Input validation with Joi
- ✅ SQL injection prevention
- ✅ CORS configuration

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Check server logs for backend errors

---

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in .env
2. Update `JWT_SECRET` to a secure value
3. Configure production database path
4. Set up email service for notifications
5. Use PM2 or similar for process management
6. Configure reverse proxy (Nginx/Apache)
7. Set up SSL certificates

### Frontend
1. Update `VITE_API_URL` to production API URL
2. Build the project: `npm run build`
3. Serve the `dist` folder using a web server
4. Configure HTTPS

---

**Happy Managing! 🎉**
