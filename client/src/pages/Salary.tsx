import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Salary.css';

interface SalarySlip {
    month: string;
    year: number;
    basicSalary: number;
    hra: number;
    transport: number;
    medical: number;
    bonus: number;
    pf: number;
    tax: number;
    otherDeductions: number;
}

export const Salary: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const viewEmployeeId = searchParams.get('employeeId');
    const [selectedPeriod, setSelectedPeriod] = useState('January 2026');
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

    useEffect(() => {
        if (user?.role === 'admin') {
            loadEmployees();
        }
    }, [user]);

    const loadEmployees = () => {
        const registeredUsers = localStorage.getItem('registeredUsers');
        if (registeredUsers) {
            const users = JSON.parse(registeredUsers);
            const empList = users.filter((u: any) => u.role === 'employee');
            setEmployees(empList);
            if (viewEmployeeId) {
                setSelectedEmployee(viewEmployeeId);
            }
        }
    };

    const currentSalary: SalarySlip = {
        month: 'January',
        year: 2026,
        basicSalary: 35000,
        hra: 10000,
        transport: 2000,
        medical: 1500,
        bonus: 5000,
        pf: 4200,
        tax: 3800,
        otherDeductions: 500,
    };

    const totalEarnings = 
        currentSalary.basicSalary + 
        currentSalary.hra + 
        currentSalary.transport + 
        currentSalary.medical + 
        currentSalary.bonus;

    const totalDeductions = 
        currentSalary.pf + 
        currentSalary.tax + 
        currentSalary.otherDeductions;

    const netSalary = totalEarnings - totalDeductions;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleDownloadSlip = () => {
        alert('Salary slip download functionality will be implemented');
    };

    return (
        <DashboardLayout>
            <div className="salary-container">
                <div className="salary-header">
                    <h1>{user?.role === 'admin' ? 'Payroll Management' : 'Salary Details'}</h1>
                    <div className="salary-actions">
                        {user?.role === 'admin' && (
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="period-selector"
                                style={{ marginRight: '12px' }}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.name} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        )}
                        <select 
                            value={selectedPeriod} 
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="period-selector"
                        >
                            <option>January 2026</option>
                            <option>December 2025</option>
                            <option>November 2025</option>
                            <option>October 2025</option>
                        </select>
                        <Button variant="primary" onClick={handleDownloadSlip}>
                            Download Slip
                        </Button>
                    </div>
                </div>

                <div className="salary-summary">
                    <Card className="summary-card">
                        <div className="summary-icon" style={{ background: 'var(--primary-purple)' }}>💰</div>
                        <div className="summary-content">
                            <div className="summary-label">Net Salary</div>
                            <div className="summary-value">{formatCurrency(netSalary)}</div>
                            <div className="summary-period">{currentSalary.month} {currentSalary.year}</div>
                        </div>
                    </Card>
                    <Card className="summary-card">
                        <div className="summary-icon" style={{ background: 'var(--success-green)' }}>📈</div>
                        <div className="summary-content">
                            <div className="summary-label">Total Earnings</div>
                            <div className="summary-value">{formatCurrency(totalEarnings)}</div>
                        </div>
                    </Card>
                    <Card className="summary-card">
                        <div className="summary-icon" style={{ background: 'var(--error-red)' }}>📉</div>
                        <div className="summary-content">
                            <div className="summary-label">Total Deductions</div>
                            <div className="summary-value">{formatCurrency(totalDeductions)}</div>
                        </div>
                    </Card>
                </div>

                <div className="salary-breakdown">
                    <Card className="breakdown-card">
                        <div className="breakdown-header">
                            <h2>Earnings</h2>
                        </div>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <span className="item-label">Basic Salary</span>
                                <span className="item-value">{formatCurrency(currentSalary.basicSalary)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">House Rent Allowance (HRA)</span>
                                <span className="item-value">{formatCurrency(currentSalary.hra)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">Transport Allowance</span>
                                <span className="item-value">{formatCurrency(currentSalary.transport)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">Medical Allowance</span>
                                <span className="item-value">{formatCurrency(currentSalary.medical)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">Performance Bonus</span>
                                <span className="item-value">{formatCurrency(currentSalary.bonus)}</span>
                            </div>
                            <div className="breakdown-item total">
                                <span className="item-label">Total Earnings</span>
                                <span className="item-value">{formatCurrency(totalEarnings)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="breakdown-card">
                        <div className="breakdown-header">
                            <h2>Deductions</h2>
                        </div>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <span className="item-label">Provident Fund (PF)</span>
                                <span className="item-value">{formatCurrency(currentSalary.pf)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">Income Tax (TDS)</span>
                                <span className="item-value">{formatCurrency(currentSalary.tax)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-label">Other Deductions</span>
                                <span className="item-value">{formatCurrency(currentSalary.otherDeductions)}</span>
                            </div>
                            <div className="breakdown-item total">
                                <span className="item-label">Total Deductions</span>
                                <span className="item-value">{formatCurrency(totalDeductions)}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="net-salary-card">
                    <div className="net-salary-content">
                        <div className="net-salary-label">Net Salary (Take Home)</div>
                        <div className="net-salary-value">{formatCurrency(netSalary)}</div>
                        <div className="net-salary-note">
                            Amount credited to your account
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};
