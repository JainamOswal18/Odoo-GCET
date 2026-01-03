import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, Search, Edit, UserPlus, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import api from '../../services/api';
import './EmployeeManagement.css';

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    designation: string;
    phone: string;
    joiningDate: string;
    salary: number;
    profilePicture?: string;
}

// Mock avatar generator based on employee name
const getAvatarUrl = (name: string, index: number) => {
    const colors = ['1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c', 'f39c12', '16a085', 'e67e22'];
    const color = colors[index % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&bold=true`;
};

export const EmployeeManagement: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        if (user?.role === 'Admin') {
            loadEmployees();
        } else {
            showToast('error', 'Only administrators can access employee management');
            navigate('/dashboard');
        }
    }, [user, navigate, showToast]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployees({ limit: 100 }) as any;
            setEmployees(response.employees || []);
        } catch (error: any) {
            showToast('error', error.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    // Get unique departments from employees
    const departments = ['All', ...Array.from(new Set(employees.map(e => e.department).filter(d => d)))];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="employee-management">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-spinner">Loading employees...</div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="employee-management">
                <div className="employee-management-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1>Employee Directory</h1>
                            <p>Manage and view all employees in your organization</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/register')} className="add-employee-btn">
                        <UserPlus size={20} />
                        Add New Employee
                    </Button>
                </div>

                <Card className="filters-card">
                    <div className="filters-container">
                        <div className="search-box">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="department-filters">
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    className={`filter-btn ${selectedDepartment === dept ? 'active' : ''}`}
                                    onClick={() => setSelectedDepartment(dept)}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <rect x="2" y="2" width="7" height="7" rx="1"/>
                                    <rect x="11" y="2" width="7" height="7" rx="1"/>
                                    <rect x="2" y="11" width="7" height="7" rx="1"/>
                                    <rect x="11" y="11" width="7" height="7" rx="1"/>
                                </svg>
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <rect x="2" y="3" width="16" height="2" rx="1"/>
                                    <rect x="2" y="8" width="16" height="2" rx="1"/>
                                    <rect x="2" y="13" width="16" height="2" rx="1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </Card>

                <div className="employees-stats">
                    <div className="stat-card">
                        <div className="stat-label">Total Employees</div>
                        <div className="stat-value">{employees.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Departments</div>
                        <div className="stat-value">{departments.length - 1}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Showing Results</div>
                        <div className="stat-value">{filteredEmployees.length}</div>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="employees-grid">
                        {filteredEmployees.map((employee, index) => {
                            const fullName = `${employee.firstName} ${employee.lastName}`;
                            const avatar = employee.profilePicture || getAvatarUrl(fullName, index);
                            return (
                                <Card key={employee.id} className="employee-card">
                                    <div className="employee-card-header">
                                        <img 
                                            src={avatar} 
                                            alt={fullName}
                                            className="employee-avatar-large"
                                        />
                                        <div className={`department-badge ${employee.department?.toLowerCase() || 'default'}`}>
                                            {employee.department || 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div className="employee-card-body">
                                        <h3 className="employee-name">{fullName}</h3>
                                        <p className="employee-id">ID: {employee.employeeId}</p>
                                        <p className="employee-position">
                                            <Briefcase size={16} />
                                            {employee.designation || 'N/A'}
                                        </p>
                                        
                                        <div className="employee-contact">
                                            <div className="contact-item">
                                                <Mail size={14} />
                                                <span>{employee.email}</span>
                                            </div>
                                            <div className="contact-item">
                                                <Phone size={14} />
                                                <span>{employee.phone || 'N/A'}</span>
                                            </div>
                                            <div className="contact-item">
                                                <Calendar size={14} />
                                                <span>Joined {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="employee-card-footer">
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => navigate(`/admin/employees/profile?employeeId=${employee.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/admin/employees/profile?employeeId=${employee.id}`)}
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <div className="employee-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Avatar</th>
                                        <th>Employee ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Position</th>
                                        <th>Join Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                                                No employees found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((employee, index) => {
                                            const fullName = `${employee.firstName} ${employee.lastName}`;
                                            const avatar = employee.profilePicture || getAvatarUrl(fullName, index);
                                            return (
                                                <tr key={employee.id}>
                                                    <td>
                                                        <img 
                                                            src={avatar} 
                                                            alt={fullName}
                                                            className="employee-avatar-small"
                                                        />
                                                    </td>
                                                    <td>{employee.employeeId}</td>
                                                    <td>{fullName}</td>
                                                    <td>{employee.email}</td>
                                                    <td>
                                                        <span className={`department-badge-sm ${employee.department?.toLowerCase() || 'default'}`}>
                                                            {employee.department || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>{employee.designation || 'N/A'}</td>
                                                    <td>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="icon-btn view"
                                                                onClick={() => navigate(`/admin/employees/profile?employeeId=${employee.id}`)}
                                                                title="View Profile"
                                                            >
                                                                <Users size={16} />
                                                            </button>
                                                            <button
                                                                className="icon-btn edit"
                                                                onClick={() => navigate(`/admin/employees/profile?employeeId=${employee.id}`)}
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {filteredEmployees.length === 0 && (
                    <div className="no-employees">
                        <Users size={64} />
                        <h3>No employees found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
