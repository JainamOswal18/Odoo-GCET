import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Attendance } from './pages/Attendance';
import { Leave } from './pages/Leave';
import { Salary } from './pages/Salary';
// Admin Pages
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { LeaveApproval } from './pages/admin/LeaveApproval';
import { AttendanceView } from './pages/admin/AttendanceView';
import { AttendanceReport } from './pages/admin/AttendanceReport';
import { PayrollManagement } from './pages/admin/PayrollManagement';
// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import './styles/global.css';
import './styles/animations.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/signin"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignIn />}
            />
            <Route
                path="/forgot-password"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
            />
            <Route
                path="/reset-password"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
            />
            <Route
                path="/signup"
                element={
                    <ProtectedRoute>
                        <SignUp />
                    </ProtectedRoute>
                }
            />

            {/* Protected Routes - Common */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute>
                        <Attendance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leave"
                element={
                    <ProtectedRoute>
                        <Leave />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/salary"
                element={
                    <ProtectedRoute>
                        <Salary />
                    </ProtectedRoute>
                }
            />

            {/* Employee-Specific Routes */}
            <Route
                path="/employee/dashboard"
                element={
                    <ProtectedRoute>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employee/profile"
                element={
                    <ProtectedRoute>
                        <EmployeeProfile />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/employees"
                element={
                    <ProtectedRoute>
                        <EmployeeManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/employees/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/leave-approvals"
                element={
                    <ProtectedRoute>
                        <LeaveApproval />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/attendance"
                element={
                    <ProtectedRoute>
                        <AttendanceView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute>
                        <AttendanceReport />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/payroll"
                element={
                    <ProtectedRoute>
                        <PayrollManagement />
                    </ProtectedRoute>
                }
            />

            {/* Default Route */}
            <Route 
                path="/" 
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />
                } 
            />
            <Route 
                path="*" 
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />
                } 
            />
        </Routes>
    );
};

function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
