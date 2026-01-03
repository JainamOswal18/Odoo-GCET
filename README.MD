# 🏢 Odoo-GCET HRMS - Complete Human Resource Management System

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-black.svg)](https://expressjs.com/)

A modern, full-featured Human Resource Management System built with React, TypeScript, Node.js, and Express. This system provides comprehensive HR functionality including employee management, attendance tracking, leave management, and payroll processing.

## 🎯 Key Features

### 👤 User Management
- **Role-based authentication** (Admin, HR, Employee)
- **Auto-generated Login IDs** (`OI[FirstName2][LastName2][Year][SerialNumber]`)
- **Secure password generation** with animal-adjective patterns
- **Profile management** with avatar uploads
- **Admin-only employee registration**

### 👥 Employee Management
- **Beautiful grid and table views** with employee cards
- **Advanced filtering and search** by department, name, or status
- **Department management** with color-coded badges
- **Employee profiles** with comprehensive information
- **Avatar integration** with fallback to generated avatars

### ⏰ Attendance System
- **Real-time attendance tracking** with clock in/out
- **Monthly attendance reports** with visual calendar
- **Attendance analytics** and statistics
- **Late arrival and early departure tracking**
- **Admin oversight** of all employee attendance

### 🏖️ Leave Management
- **Multiple leave types** (Paid, Sick, Casual, Emergency)
- **Leave balance tracking** with visual indicators
- **Request approval workflow** (Pending → Approved/Rejected)
- **Admin leave approval interface**
- **Automatic balance calculations**
- **Leave history and analytics**

### 💰 Payroll Management
- **Comprehensive payroll creation** (individual or bulk)
- **Multi-component salary structure** (Basic, Allowances, Bonus, Deductions)
- **Three-stage payroll workflow** (Draft → Processed → Paid)
- **Payslip generation** and download
- **Payroll analytics and reporting**
- **Monthly payroll processing**

### 📊 Dashboard & Analytics
- **Role-specific dashboards** with relevant metrics
- **Real-time statistics** and KPI tracking
- **Interactive charts** and visual data representation
- **Quick action shortcuts** to key functions
- **Notification system** for pending approvals

## 🏗️ System Architecture

```
Odoo-GCET/
├── client/                    # React Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   │   ├── admin/       # Admin-specific pages
│   │   │   └── employee/    # Employee-specific pages
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API service layer
│   │   ├── styles/          # Global styles and themes
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── server/                   # Node.js Backend API
│   ├── controllers/         # Business logic controllers
│   ├── middleware/          # Authentication & validation
│   ├── routes/              # API route definitions
│   ├── validators/          # Input validation schemas
│   ├── utils/               # Helper utilities
│   ├── scripts/            # Database initialization scripts
│   └── config/             # Configuration files
└── docs/                    # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Odoo-GCET
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Initialize database and create admin user
   npm run init-admin
   # Save the generated admin credentials!
   
   # Start server (development mode)
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   
   # Create environment file
   cp .env.example .env
   # Default API URL is already configured
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Login with the admin credentials generated in step 2

## 📱 User Interface

### 🎨 Design System
- **Modern UI/UX** with clean, professional design
- **Gradient themes** and consistent color palette
- **Responsive design** for desktop and mobile devices
- **Intuitive navigation** with breadcrumbs and clear menu structure
- **Interactive elements** with hover states and animations
- **Accessible components** following WCAG guidelines

### 🖼️ Visual Components
- **Dashboard cards** with statistics and quick actions
- **Data tables** with sorting, filtering, and pagination
- **Modal dialogs** for forms and confirmations
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Calendar views** for attendance and leave tracking

## 🔐 Authentication & Security

### Login System
- **Dual authentication** using Login ID or email
- **JWT-based sessions** with secure token handling
- **Role-based access control** (RBAC)
- **Password strength requirements** and validation
- **Automatic session management**

### Security Features
- **Input validation** on all forms and API endpoints
- **SQL injection prevention** with parameterized queries
- **XSS protection** with input sanitization
- **CORS configuration** for cross-origin requests
- **Rate limiting** to prevent abuse
- **Secure file uploads** with type and size validation

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Employee registration (Admin only)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Employee Management
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Management
- `POST /api/attendance/checkin` - Clock in
- `POST /api/attendance/checkout` - Clock out
- `GET /api/attendance/employee/:id` - Get employee attendance
- `GET /api/attendance/report` - Generate attendance reports

### Leave Management
- `POST /api/leave/request` - Submit leave request
- `GET /api/leave/employee/:id` - Get employee leaves
- `PUT /api/leave/:id/approve` - Approve leave request
- `PUT /api/leave/:id/reject` - Reject leave request

### Payroll Management
- `POST /api/payroll` - Create payroll
- `GET /api/payroll` - Get payroll records
- `PUT /api/payroll/:id` - Update payroll
- `POST /api/payroll/:id/process` - Process payroll
- `POST /api/payroll/:id/pay` - Mark as paid

## 🛠️ Development

### Technology Stack

**Frontend:**
- **React 18.3.1** - UI library
- **TypeScript 5.7.2** - Type safety
- **Vite 6.0.5** - Build tool
- **React Router 6.28.0** - Client-side routing
- **Tailwind CSS 3.4.17** - Styling framework
- **Lucide React** - Icon system
- **Date-fns** - Date manipulation

**Backend:**
- **Node.js** - Runtime environment
- **Express 5.2.1** - Web framework
- **JSON Web Tokens** - Authentication
- **Bcrypt.js** - Password hashing
- **Joi** - Input validation
- **Multer** - File uploads
- **Compression** - Response compression

### Development Scripts

**Client:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
```

**Server:**
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm run init-admin   # Create admin user
npm run seed         # Seed test data
```

### Code Standards
- **ESLint** configuration for code quality
- **Prettier** for consistent formatting
- **TypeScript strict mode** enabled
- **Component-based architecture** with reusable components
- **RESTful API design** with consistent endpoints
- **Error handling** with proper HTTP status codes

## 🌟 Advanced Features

### Real-time Updates
- **Live dashboard statistics** updating without page refresh
- **Real-time notifications** for leave requests and approvals
- **Instant feedback** with toast notifications
- **Optimistic UI updates** for better user experience

### Data Management
- **Local storage integration** for offline capability
- **Data persistence** across browser sessions
- **Import/Export functionality** for data portability
- **Backup and restore** capabilities
- **Data validation** at multiple layers

### Customization
- **Configurable leave types** and policies
- **Flexible payroll components** and calculations
- **Customizable dashboard** layouts and widgets
- **Theme customization** options
- **Multi-language support** ready

## 📄 Documentation

- **[SETUP.md](SETUP.md)** - Detailed installation and setup guide
- **[CHANGES.md](CHANGES.md)** - Complete changelog and update history
- **[client/COMPLETE_FEATURES_SUMMARY.md](client/COMPLETE_FEATURES_SUMMARY.md)** - Full feature implementation details
- **[client/ADMIN_FEATURES_SUMMARY.md](client/ADMIN_FEATURES_SUMMARY.md)** - Admin-specific functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support, please check the documentation files or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core HRMS functionality
- Complete employee management system
- Attendance tracking and reporting
- Leave management with approval workflow
- Payroll processing and management
- Role-based authentication and security

---

**Built with ❤️ for modern HR management**