import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { DollarSign, Plus, Eye, Download, Calendar, Users, TrendingUp, Edit } from 'lucide-react';
import './PayrollManagement.css';

interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    bonus: number;
    netSalary: number;
    status: 'draft' | 'processed' | 'paid';
    createdAt: string;
    processedAt?: string;
}

export const PayrollManagement: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'processed' | 'paid'>('all');
    const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
    
    const [formData, setFormData] = useState({
        employeeId: '',
        month: new Date().toISOString().slice(0, 7),
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        bonus: 0
    });

    useEffect(() => {
        loadEmployees();
        loadPayrollRecords();
    }, []);

    const loadEmployees = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            const employeeList = users.filter((u: any) => u.role === 'employee');
            setEmployees(employeeList);
        }
    };

    const loadPayrollRecords = () => {
        const stored = localStorage.getItem('payroll_records');
        if (stored) {
            setPayrollRecords(JSON.parse(stored));
        }
    };

    const savePayrollRecords = (records: PayrollRecord[]) => {
        localStorage.setItem('payroll_records', JSON.stringify(records));
        setPayrollRecords(records);
    };

    const handleCreatePayroll = (e: React.FormEvent) => {
        e.preventDefault();

        const employee = employees.find(e => e.employeeId === formData.employeeId);
        if (!employee) {
            showToast('error', 'Please select an employee');
            return;
        }

        // Check if payroll already exists for this employee and month
        const existing = payrollRecords.find(
            p => p.employeeId === formData.employeeId && 
            p.month === formData.month.split('-')[1] && 
            p.year === parseInt(formData.month.split('-')[0])
        );

        if (existing) {
            showToast('error', 'Payroll already exists for this employee and month');
            return;
        }

        const netSalary = formData.basicSalary + formData.allowances + formData.bonus - formData.deductions;

        const newPayroll: PayrollRecord = {
            id: Date.now().toString(),
            employeeId: formData.employeeId,
            employeeName: employee.name,
            month: formData.month.split('-')[1],
            year: parseInt(formData.month.split('-')[0]),
            basicSalary: formData.basicSalary,
            allowances: formData.allowances,
            deductions: formData.deductions,
            bonus: formData.bonus,
            netSalary,
            status: 'draft',
            createdAt: new Date().toISOString()
        };

        const updated = [...payrollRecords, newPayroll];
        savePayrollRecords(updated);
        showToast('success', 'Payroll created successfully');
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditPayroll = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingPayroll) return;

        const netSalary = formData.basicSalary + formData.allowances + formData.bonus - formData.deductions;

        const updated = payrollRecords.map(p => 
            p.id === editingPayroll.id
                ? { ...p, ...formData, netSalary }
                : p
        );

        savePayrollRecords(updated);
        showToast('success', 'Payroll updated successfully');
        setShowEditModal(false);
        setEditingPayroll(null);
        resetForm();
    };

    const handleProcessPayroll = (payrollId: string) => {
        const updated = payrollRecords.map(p =>
            p.id === payrollId
                ? { ...p, status: 'processed' as const, processedAt: new Date().toISOString() }
                : p
        );
        savePayrollRecords(updated);
        showToast('success', 'Payroll processed successfully');
    };

    const handleMarkAsPaid = (payrollId: string) => {
        const updated = payrollRecords.map(p =>
            p.id === payrollId
                ? { ...p, status: 'paid' as const }
                : p
        );
        savePayrollRecords(updated);
        showToast('success', 'Payroll marked as paid');
    };

    const handleBulkCreate = () => {
        const [year, month] = selectedMonth.split('-');
        let created = 0;

        employees.forEach(emp => {
            const existing = payrollRecords.find(
                p => p.employeeId === emp.employeeId && 
                p.month === month && 
                p.year === parseInt(year)
            );

            if (!existing) {
                const newPayroll: PayrollRecord = {
                    id: `${Date.now()}_${emp.employeeId}`,
                    employeeId: emp.employeeId,
                    employeeName: emp.name,
                    month,
                    year: parseInt(year),
                    basicSalary: emp.salary || 45000,
                    allowances: 5000,
                    deductions: 2000,
                    bonus: 0,
                    netSalary: (emp.salary || 45000) + 5000 - 2000,
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };
                payrollRecords.push(newPayroll);
                created++;
            }
        });

        if (created > 0) {
            savePayrollRecords([...payrollRecords]);
            showToast('success', `Created payroll for ${created} employees`);
        } else {
            showToast('info', 'Payroll already exists for all employees in this period');
        }
    };

    const openEditModal = (payroll: PayrollRecord) => {
        setEditingPayroll(payroll);
        setFormData({
            employeeId: payroll.employeeId,
            month: `${payroll.year}-${payroll.month.padStart(2, '0')}`,
            basicSalary: payroll.basicSalary,
            allowances: payroll.allowances,
            deductions: payroll.deductions,
            bonus: payroll.bonus
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            month: new Date().toISOString().slice(0, 7),
            basicSalary: 0,
            allowances: 0,
            deductions: 0,
            bonus: 0
        });
    };

    const handleDownloadPayslip = (payroll: PayrollRecord) => {
        const content = `
PAYSLIP
${payroll.employeeName} (${payroll.employeeId})
Period: ${getMonthName(payroll.month)} ${payroll.year}

Basic Salary: ₹${payroll.basicSalary.toLocaleString()}
Allowances: ₹${payroll.allowances.toLocaleString()}
Bonus: ₹${payroll.bonus.toLocaleString()}
Deductions: ₹${payroll.deductions.toLocaleString()}
-----------------------------------
Net Salary: ₹${payroll.netSalary.toLocaleString()}

Status: ${payroll.status.toUpperCase()}
Generated: ${new Date().toLocaleDateString()}
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payslip_${payroll.employeeId}_${payroll.year}${payroll.month}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const getMonthName = (month: string) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(month) - 1];
    };

    const filteredRecords = payrollRecords.filter(p => {
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        return true;
    });

    const totalPayroll = filteredRecords.reduce((sum, p) => sum + p.netSalary, 0);
    const draftCount = payrollRecords.filter(p => p.status === 'draft').length;
    const processedCount = payrollRecords.filter(p => p.status === 'processed').length;
    const paidCount = payrollRecords.filter(p => p.status === 'paid').length;

    return (
        <DashboardLayout>
            <div className="payroll-management">
                <div className="payroll-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <DollarSign size={32} />
                        </div>
                        <div>
                            <h1>Payroll Management</h1>
                            <p>Create, manage and process employee payroll</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} />
                            Create Payroll
                        </Button>
                        <Button onClick={handleBulkCreate}>
                            <Users size={20} />
                            Bulk Create for All
                        </Button>
                    </div>
                </div>

                <div className="payroll-stats">
                    <Card className="stat-card-payroll">
                        <div className="stat-icon blue">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">₹{totalPayroll.toLocaleString()}</div>
                            <div className="stat-label">Total Payroll</div>
                        </div>
                    </Card>
                    <Card className="stat-card-payroll">
                        <div className="stat-icon yellow">
                            <Edit size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{draftCount}</div>
                            <div className="stat-label">Draft</div>
                        </div>
                    </Card>
                    <Card className="stat-card-payroll">
                        <div className="stat-icon purple">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{processedCount}</div>
                            <div className="stat-label">Processed</div>
                        </div>
                    </Card>
                    <Card className="stat-card-payroll">
                        <div className="stat-icon green">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{paidCount}</div>
                            <div className="stat-label">Paid</div>
                        </div>
                    </Card>
                </div>

                <Card className="filters-card">
                    <div className="payroll-filters">
                        <div className="filter-group">
                            <label>Filter by Status</label>
                            <div className="status-filters">
                                {(['all', 'draft', 'processed', 'paid'] as const).map(status => (
                                    <button
                                        key={status}
                                        className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>
                                <Calendar size={18} />
                                Bulk Create Period
                            </label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="month-input"
                            />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="payroll-table-header">
                        <h2>Payroll Records</h2>
                        <span className="record-count">{filteredRecords.length} records</span>
                    </div>
                    <div className="payroll-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Period</th>
                                    <th>Basic Salary</th>
                                    <th>Allowances</th>
                                    <th>Bonus</th>
                                    <th>Deductions</th>
                                    <th>Net Salary</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="no-data">
                                            No payroll records found. Create your first payroll entry!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((payroll) => (
                                        <tr key={payroll.id}>
                                            <td className="employee-cell">
                                                <div className="employee-info">
                                                    <div className="employee-name">{payroll.employeeName}</div>
                                                    <div className="employee-id">{payroll.employeeId}</div>
                                                </div>
                                            </td>
                                            <td>{getMonthName(payroll.month)} {payroll.year}</td>
                                            <td>₹{payroll.basicSalary.toLocaleString()}</td>
                                            <td>₹{payroll.allowances.toLocaleString()}</td>
                                            <td>₹{payroll.bonus.toLocaleString()}</td>
                                            <td>₹{payroll.deductions.toLocaleString()}</td>
                                            <td className="net-salary">₹{payroll.netSalary.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge-payroll ${payroll.status}`}>
                                                    {payroll.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-payroll">
                                                    {payroll.status === 'draft' && (
                                                        <>
                                                            <button
                                                                className="action-btn edit"
                                                                onClick={() => openEditModal(payroll)}
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className="action-btn process"
                                                                onClick={() => handleProcessPayroll(payroll.id)}
                                                                title="Process"
                                                            >
                                                                <TrendingUp size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {payroll.status === 'processed' && (
                                                        <button
                                                            className="action-btn pay"
                                                            onClick={() => handleMarkAsPaid(payroll.id)}
                                                            title="Mark as Paid"
                                                        >
                                                            <DollarSign size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => navigate(`/profile?employeeId=${payroll.employeeId}`)}
                                                        title="View Employee"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn download"
                                                        onClick={() => handleDownloadPayslip(payroll)}
                                                        title="Download Payslip"
                                                    >
                                                        <Download size={16} />
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
            </div>

            {/* Create Payroll Modal */}
            {showCreateModal && (
                <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Payroll">
                    <form onSubmit={handleCreatePayroll} className="payroll-form">
                        <div className="form-group">
                            <label>Employee *</label>
                            <select
                                value={formData.employeeId}
                                onChange={(e) => {
                                    const emp = employees.find(e => e.employeeId === e.target.value);
                                    setFormData({ ...formData, employeeId: e.target.value, basicSalary: emp?.salary || 0 });
                                }}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.name} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Period *</label>
                            <input
                                type="month"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Basic Salary *</label>
                                <input
                                    type="number"
                                    value={formData.basicSalary}
                                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Allowances</label>
                                <input
                                    type="number"
                                    value={formData.allowances}
                                    onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Bonus</label>
                                <input
                                    type="number"
                                    value={formData.bonus}
                                    onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Deductions</label>
                                <input
                                    type="number"
                                    value={formData.deductions}
                                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="net-salary-preview">
                            <strong>Net Salary:</strong>
                            <span>₹{(formData.basicSalary + formData.allowances + formData.bonus - formData.deductions).toLocaleString()}</span>
                        </div>

                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Payroll</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Payroll Modal */}
            {showEditModal && editingPayroll && (
                <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingPayroll(null); resetForm(); }} title="Edit Payroll">
                    <form onSubmit={handleEditPayroll} className="payroll-form">
                        <div className="form-group">
                            <label>Employee</label>
                            <input type="text" value={editingPayroll.employeeName} disabled />
                        </div>

                        <div className="form-group">
                            <label>Period</label>
                            <input type="text" value={`${getMonthName(editingPayroll.month)} ${editingPayroll.year}`} disabled />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Basic Salary *</label>
                                <input
                                    type="number"
                                    value={formData.basicSalary}
                                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Allowances</label>
                                <input
                                    type="number"
                                    value={formData.allowances}
                                    onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Bonus</label>
                                <input
                                    type="number"
                                    value={formData.bonus}
                                    onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Deductions</label>
                                <input
                                    type="number"
                                    value={formData.deductions}
                                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="net-salary-preview">
                            <strong>Net Salary:</strong>
                            <span>₹{(formData.basicSalary + formData.allowances + formData.bonus - formData.deductions).toLocaleString()}</span>
                        </div>

                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => { setShowEditModal(false); setEditingPayroll(null); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Payroll</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
};
