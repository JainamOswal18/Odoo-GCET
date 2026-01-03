import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, Search, Edit, UserPlus, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import './EmployeeManagement.css';

interface Employee {
    employeeId: string;
    name: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    joinDate: string;
    salary: number;
    avatar?: string;
}

// Mock avatar generator based on employee name
const getAvatarUrl = (name: string, index: number) => {
    const colors = ['1abc9c', '2ecc71', '3498db', '9b59b6', 'e74c3c', 'f39c12', '16a085', 'e67e22'];
    const color = colors[index % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200&bold=true`;
};

export const EmployeeManagement: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            const employeeList = users.filter((u: any) => u.role === 'employee').map((u: any, index: number) => ({
                employeeId: u.employeeId,
                name: u.name,
                email: u.email,
                department: u.department || 'Engineering',
                position: u.position || 'Software Developer',
                phone: u.phone || '+91 9876543210',
                joinDate: u.joinDate || '2024-01-01',
                salary: u.salary || 45000,
                avatar: getAvatarUrl(u.name, index)
            }));
            setEmployees(employeeList);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const departments = ['All', 'Engineering', 'HR', 'Marketing', 'Sales', 'Finance'];

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
                        {filteredEmployees.map((employee) => (
                            <Card key={employee.employeeId} className="employee-card">
                                <div className="employee-card-header">
                                    <img 
                                        src={employee.avatar} 
                                        alt={employee.name}
                                        className="employee-avatar-large"
                                    />
                                    <div className={`department-badge ${employee.department.toLowerCase()}`}>
                                        {employee.department}
                                    </div>
                                </div>
                                
                                <div className="employee-card-body">
                                    <h3 className="employee-name">{employee.name}</h3>
                                    <p className="employee-id">ID: {employee.employeeId}</p>
                                    <p className="employee-position">
                                        <Briefcase size={16} />
                                        {employee.position}
                                    </p>
                                    
                                    <div className="employee-contact">
                                        <div className="contact-item">
                                            <Mail size={14} />
                                            <span>{employee.email}</span>
                                        </div>
                                        <div className="contact-item">
                                            <Phone size={14} />
                                            <span>{employee.phone}</span>
                                        </div>
                                        <div className="contact-item">
                                            <Calendar size={14} />
                                            <span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="employee-card-footer">
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => navigate(`/profile?employeeId=${employee.employeeId}`)}
                                    >
                                        View Profile
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate(`/profile?employeeId=${employee.employeeId}`)}
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Button>
                                </div>
                            </Card>
                        ))}
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
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.employeeId}>
                                                <td>
                                                    <img 
                                                        src={employee.avatar} 
                                                        alt={employee.name}
                                                        className="employee-avatar-small"
                                                    />
                                                </td>
                                                <td>{employee.employeeId}</td>
                                                <td>{employee.name}</td>
                                                <td>{employee.email}</td>
                                                <td>
                                                    <span className={`department-badge-sm ${employee.department.toLowerCase()}`}>
                                                        {employee.department}
                                                    </span>
                                                </td>
                                                <td>{employee.position}</td>
                                                <td>{new Date(employee.joinDate).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="icon-btn view"
                                                            onClick={() => navigate(`/profile?employeeId=${employee.employeeId}`)}
                                                            title="View Profile"
                                                        >
                                                            <Users size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn edit"
                                                            onClick={() => navigate(`/profile?employeeId=${employee.employeeId}`)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
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
