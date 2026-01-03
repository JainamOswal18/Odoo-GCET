# HRMS Frontend - Human Resource Management System

A modern, production-ready Human Resource Management System (HRMS) frontend built with React, Tailwind CSS, and Vite. This application provides comprehensive HR management features including employee management, attendance tracking, leave management, and payroll processing.

## 🚀 Features

### Authentication
- ✅ Sign In / Sign Up with validation
- ✅ Role-based access control (Admin/Employee)
- ✅ Password strength indicators
- ✅ Remember me functionality
- ✅ Protected routes

### Employee Features
- ✅ Personal dashboard with quick stats
- 📋 Profile management (Resume, Private Info, Salary, Security)
- 📅 Attendance tracking (Daily/Weekly views)
- 📝 Leave application and status tracking
- 💰 Salary slip viewing and download

### Admin Features
- ✅ Admin dashboard with organization metrics
- 👥 Employee management
- 📊 Attendance monitoring and management
- ✅ Leave approval workflows
- 💵 Payroll processing and management
- ⚙️ System settings

### Design System
- 🎨 Beautiful gradient color palette (Purple, Pink, Orange)
- 📱 Fully responsive (Mobile, Tablet, Desktop)
- ♿ WCAG 2.1 AA accessibility compliant
- 🌙 Modern UI with smooth animations
- 🎯 Consistent spacing and typography

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository or navigate to the client folder:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## 📦 Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

To preview the production build:
```bash
npm run preview
```

## 🎨 Design System

### Color Palette

- **Primary Purple**: `#D946EF` / `#C41E9F`
- **Secondary Pink**: `#EC4899`
- **Tertiary Orange**: `#F59E0B`
- **Success Green**: `#10B981`
- **Error Red**: `#EF4444`
- **Warning Yellow**: `#FBBF24`
- **Neutral Grays**: `#E5E7EB` to `#1F1F1F`

### Typography

- **Font Family**: Inter, Segoe UI, system fonts
- **Headings**: H1 (2.5rem), H2 (2rem), H3 (1.5rem), H4 (1.25rem)
- **Body**: 14px-16px for optimal readability

### Responsive Breakpoints

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 1024px
- **Desktop**: 1025px+

## 🔐 Demo Credentials

### Admin Access
- **Employee ID**: `admin`
- **Password**: Any password (demo mode)

### Employee Access
- **Employee ID**: `EMP001`
- **Password**: Any password (demo mode)

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Avatar.jsx
│   │   │   └── StatusDot.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   ├── employee/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Leave.jsx
│   │   │   └── Salary.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Employees.jsx
│   │       ├── Attendance.jsx
│   │       ├── LeaveApprovals.jsx
│   │       ├── Payroll.jsx
│   │       └── Settings.jsx
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🧩 Key Components

### Layout Components

- **Sidebar**: Responsive navigation with role-based menu items
- **Header**: Top bar with notifications and user menu
- **Layout**: Wrapper component combining sidebar and header

### UI Components

- **Button**: Multiple variants (primary, secondary, success, danger, etc.)
- **Card**: Container with optional hover effects
- **Input**: Text input with label, error, and help text support
- **Select**: Dropdown with validation
- **Textarea**: Multi-line text input
- **Modal**: Overlay dialog with customizable content
- **Badge**: Status indicators (success, error, warning, info)
- **Avatar**: User profile picture or initials
- **StatusDot**: Colored dot indicators for status

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

- Custom color palette
- Extended spacing system
- Custom animations
- Responsive breakpoints
- Custom utility classes

### Vite

Optimized build configuration:

- Code splitting for vendors
- Fast refresh for development
- Optimized production builds
- Port 3000 by default

## 🚀 Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use PropTypes or TypeScript for type checking
- Keep components small and focused
- Use meaningful variable and function names

### State Management

- Context API for global state (Auth)
- Local state for component-specific data
- Consider Redux or Zustand for complex state needs

### API Integration

The project includes helper utilities for:

- Date formatting
- Currency formatting
- Validation (email, phone, password)
- Salary calculations
- Debouncing

Replace mock data with actual API calls in production.

## 📱 Responsive Design

The application is fully responsive with:

- Mobile-first approach
- Hamburger menu on mobile
- Stacked layouts on small screens
- Grid layouts on larger screens
- Touch-friendly buttons (minimum 44px)

## ♿ Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader support

## 🎯 Performance Optimization

- Code splitting
- Lazy loading
- Image optimization
- Debounced inputs
- Optimized bundle size

## 🧪 Testing

To add testing:

```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm test
```

## 🚢 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag and drop the dist folder to Netlify
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@hrms.com or create an issue in the repository.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide React for the beautiful icons
- Vite for the blazing fast build tool

## 📈 Roadmap

### Phase 1 (MVP) - ✅ Completed
- [x] Authentication system
- [x] Basic dashboard
- [x] Layout components
- [x] UI component library
- [x] Routing and state management

### Phase 2 (Essential Features) - 🚧 In Progress
- [ ] Complete profile management
- [ ] Full attendance tracking
- [ ] Leave management workflows
- [ ] Salary calculations and viewing
- [ ] Search and filtering

### Phase 3 (Advanced Features) - 📅 Planned
- [ ] Charts and data visualization
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

## 💡 Tips for Development

1. **Hot Reload**: Vite provides instant hot module replacement
2. **Tailwind IntelliSense**: Install the VS Code extension for autocomplete
3. **React DevTools**: Use browser extension for debugging
4. **ESLint**: Follow the configured linting rules
5. **Component Isolation**: Test components individually before integration

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Built with ❤️ for efficient HR management**
