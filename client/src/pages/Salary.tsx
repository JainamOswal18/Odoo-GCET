import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import api from '../services/api';
import './Salary.css';

interface SalaryComponent {
    id: string;
    employeeId: string;
    componentName: string;
    componentType: 'Earning' | 'Deduction';
    calculationType: 'Fixed' | 'Percentage';
    value: number;
    description: string;
    calculatedAmount?: number;
}

type TabType = 'salary-slip' | 'salary-structure';

export const Salary: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const viewEmployeeId = searchParams.get('employeeId');
    
    const [activeTab, setActiveTab] = useState<TabType>('salary-slip');
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('January 2026');
    const [baseSalary, setBaseSalary] = useState(0);
    const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
    const [showComponentModal, setShowComponentModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
    
    const [componentForm, setComponentForm] = useState({
        componentName: '',
        componentType: 'Earning' as 'Earning' | 'Deduction',
        calculationType: 'Percentage' as 'Fixed' | 'Percentage',
        value: 0,
        description: ''
    });

    const currentEmployeeId = viewEmployeeId || user?.employeeUUID;

    useEffect(() => {
        if (currentEmployeeId) {
            loadSalaryData();
        } else {
            setLoading(false);
        }
    }, [currentEmployeeId]);

    const loadSalaryData = async () => {
        try {
            setLoading(true);
            
            const componentsData = await api.getSalaryComponents(currentEmployeeId!);

            const compData = componentsData as any;
            setSalaryComponents(compData.components || []);
            setBaseSalary(compData.baseSalary || 0);
        } catch (error: any) {
            showToast('error', error.message || 'Failed to load salary data');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        const earnings = salaryComponents
            .filter(c => c.componentType === 'Earning')
            .reduce((sum, c) => sum + (c.calculatedAmount || 0), baseSalary);
        
        const deductions = salaryComponents
            .filter(c => c.componentType === 'Deduction')
            .reduce((sum, c) => sum + (c.calculatedAmount || 0), 0);
        
        return { earnings, deductions, netSalary: earnings - deductions };
    };

    const handleAddComponent = () => {
        setEditingComponent(null);
        setComponentForm({
            componentName: '',
            componentType: 'Earning',
            calculationType: 'Percentage',
            value: 0,
            description: ''
        });
        setShowComponentModal(true);
    };

    const handleEditComponent = (component: SalaryComponent) => {
        setEditingComponent(component);
        setComponentForm({
            componentName: component.componentName,
            componentType: component.componentType,
            calculationType: component.calculationType,
            value: component.value,
            description: component.description
        });
        setShowComponentModal(true);
    };

    const handleSaveComponent = async () => {
        try {
            if (!currentEmployeeId) return;

            if (editingComponent) {
                await api.updateSalaryComponent(currentEmployeeId, editingComponent.id, componentForm);
                showToast('success', 'Salary component updated successfully');
            } else {
                await api.createSalaryComponent(currentEmployeeId, componentForm);
                showToast('success', 'Salary component added successfully');
            }
            
            setShowComponentModal(false);
            await loadSalaryData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to save salary component');
        }
    };

    const handleDeleteComponent = async (componentId: string) => {
        if (!confirm('Are you sure you want to delete this component?')) return;
        
        try {
            if (!currentEmployeeId) return;
            await api.deleteSalaryComponent(currentEmployeeId, componentId);
            showToast('success', 'Salary component deleted successfully');
            await loadSalaryData();
        } catch (error: any) {
            showToast('error', error.message || 'Failed to delete salary component');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const { earnings, deductions, netSalary } = calculateTotals();

    const renderSalarySlipTab = () => (
        <div className="tab-content">
            <div className="salary-summary">
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--primary-purple)' }}>💰</div>
                    <div className="summary-content">
                        <div className="summary-label">Net Salary</div>
                        <div className="summary-value">{formatCurrency(netSalary)}</div>
                        <div className="summary-period">{selectedPeriod}</div>
                    </div>
                </Card>
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--success-green)' }}>📈</div>
                    <div className="summary-content">
                        <div className="summary-label">Total Earnings</div>
                        <div className="summary-value">{formatCurrency(earnings)}</div>
                    </div>
                </Card>
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'var(--error-red)' }}>📉</div>
                    <div className="summary-content">
                        <div className="summary-label">Total Deductions</div>
                        <div className="summary-value">{formatCurrency(deductions)}</div>
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
                            <span className="item-label">Basic Salary (Fixed Wage)</span>
                            <span className="item-value">{formatCurrency(baseSalary)}</span>
                        </div>
                        {salaryComponents
                            .filter(c => c.componentType === 'Earning')
                            .map(comp => (
                                <div key={comp.id} className="breakdown-item">
                                    <span className="item-label">
                                        {comp.componentName}
                                        {comp.calculationType === 'Percentage' && (
                                            <span className="calculation-detail">
                                                ({comp.value}% of Base)
                                            </span>
                                        )}
                                    </span>
                                    <span className="item-value">
                                        {formatCurrency(comp.calculatedAmount || 0)}
                                    </span>
                                </div>
                            ))}
                        <div className="breakdown-item total">
                            <span className="item-label">Total Earnings</span>
                            <span className="item-value">{formatCurrency(earnings)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="breakdown-card">
                    <div className="breakdown-header">
                        <h2>Deductions</h2>
                    </div>
                    <div className="breakdown-list">
                        {salaryComponents
                            .filter(c => c.componentType === 'Deduction')
                            .map(comp => (
                                <div key={comp.id} className="breakdown-item">
                                    <span className="item-label">
                                        {comp.componentName}
                                        {comp.calculationType === 'Percentage' && (
                                            <span className="calculation-detail">
                                                ({comp.value}% of Base)
                                            </span>
                                        )}
                                    </span>
                                    <span className="item-value">
                                        {formatCurrency(comp.calculatedAmount || 0)}
                                    </span>
                                </div>
                            ))}
                        {salaryComponents.filter(c => c.componentType === 'Deduction').length === 0 && (
                            <div className="breakdown-item">
                                <span className="item-label">No deductions</span>
                                <span className="item-value">₹0</span>
                            </div>
                        )}
                        <div className="breakdown-item total">
                            <span className="item-label">Total Deductions</span>
                            <span className="item-value">{formatCurrency(deductions)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="net-salary-card">
                <div className="net-salary-content">
                    <div className="net-salary-label">Net Salary (Take Home)</div>
                    <div className="net-salary-value">{formatCurrency(netSalary)}</div>
                    <div className="net-salary-note">Amount credited to your account</div>
                </div>
            </Card>
        </div>
    );

    const renderSalaryStructureTab = () => (
        <div className="tab-content">
            <Card className="structure-card">
                <div className="structure-header">
                    <div>
                        <h2>Wage Information</h2>
                        <p className="structure-subtitle">Base salary and salary component configuration</p>
                    </div>
                    {user?.role === 'Admin' && (
                        <Button variant="primary" onClick={handleAddComponent}>
                            Add Component
                        </Button>
                    )}
                </div>

                <div className="wage-info">
                    <div className="wage-item">
                        <label>Wage Type</label>
                        <div className="wage-value">Fixed Wage</div>
                    </div>
                    <div className="wage-item">
                        <label>Base Salary (Monthly)</label>
                        <div className="wage-value">{formatCurrency(baseSalary)}</div>
                    </div>
                </div>
            </Card>

            <Card className="structure-card">
                <div className="structure-header">
                    <h2>Salary Components</h2>
                    <p className="structure-subtitle">Components are automatically calculated based on the defined wage</p>
                </div>

                <div className="components-section">
                    <h3 className="component-type-header">Earnings</h3>
                    <div className="components-table">
                        <div className="table-header">
                            <div>Component Name</div>
                            <div>Calculation Type</div>
                            <div>Value</div>
                            <div>Calculated Amount</div>
                            {user?.role === 'Admin' && <div>Actions</div>}
                        </div>
                        {salaryComponents
                            .filter(c => c.componentType === 'Earning')
                            .map(comp => (
                                <div key={comp.id} className="table-row">
                                    <div>
                                        <div className="component-name">{comp.componentName}</div>
                                        {comp.description && (
                                            <div className="component-desc">{comp.description}</div>
                                        )}
                                    </div>
                                    <div>{comp.calculationType}</div>
                                    <div>
                                        {comp.calculationType === 'Percentage' 
                                            ? `${comp.value}%` 
                                            : formatCurrency(comp.value)}
                                    </div>
                                    <div className="calculated-amount">
                                        {formatCurrency(comp.calculatedAmount || 0)}
                                    </div>
                                    {user?.role === 'Admin' && (
                                        <div className="action-buttons">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEditComponent(comp)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteComponent(comp.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        {salaryComponents.filter(c => c.componentType === 'Earning').length === 0 && (
                            <div className="empty-state">No earning components defined</div>
                        )}
                    </div>
                </div>

                <div className="components-section">
                    <h3 className="component-type-header">Deductions</h3>
                    <div className="components-table">
                        <div className="table-header">
                            <div>Component Name</div>
                            <div>Calculation Type</div>
                            <div>Value</div>
                            <div>Calculated Amount</div>
                            {user?.role === 'Admin' && <div>Actions</div>}
                        </div>
                        {salaryComponents
                            .filter(c => c.componentType === 'Deduction')
                            .map(comp => (
                                <div key={comp.id} className="table-row">
                                    <div>
                                        <div className="component-name">{comp.componentName}</div>
                                        {comp.description && (
                                            <div className="component-desc">{comp.description}</div>
                                        )}
                                    </div>
                                    <div>{comp.calculationType}</div>
                                    <div>
                                        {comp.calculationType === 'Percentage' 
                                            ? `${comp.value}%` 
                                            : formatCurrency(comp.value)}
                                    </div>
                                    <div className="calculated-amount">
                                        {formatCurrency(comp.calculatedAmount || 0)}
                                    </div>
                                    {user?.role === 'Admin' && (
                                        <div className="action-buttons">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEditComponent(comp)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteComponent(comp.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        {salaryComponents.filter(c => c.componentType === 'Deduction').length === 0 && (
                            <div className="empty-state">No deduction components defined</div>
                        )}
                    </div>
                </div>

                <div className="calculation-note">
                    <strong>Automatic Calculation:</strong> The system calculates each component amount based on the employee's defined wage. 
                    Fixed components use the specified amount, while percentage-based components are calculated as a percentage of the base salary.
                </div>
            </Card>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="salary-container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-spinner">Loading salary data...</div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="salary-container">
                <div className="salary-header">
                    <h1>{user?.role === 'Admin' ? 'Payroll Management' : 'Salary Details'}</h1>
                    <div className="salary-actions">
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
                    </div>
                </div>

                <div className="profile-tabs">
                    <button
                        className={`tab-button ${activeTab === 'salary-slip' ? 'active' : ''}`}
                        onClick={() => setActiveTab('salary-slip')}
                    >
                        Salary Slip
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'salary-structure' ? 'active' : ''}`}
                        onClick={() => setActiveTab('salary-structure')}
                    >
                        Salary Structure
                    </button>
                </div>

                <div className="salary-content">
                    {activeTab === 'salary-slip' && renderSalarySlipTab()}
                    {activeTab === 'salary-structure' && renderSalaryStructureTab()}
                </div>
            </div>

            {showComponentModal && (
                <Modal
                    isOpen={showComponentModal}
                    onClose={() => setShowComponentModal(false)}
                    title={editingComponent ? 'Edit Salary Component' : 'Add Salary Component'}
                >
                    <div className="component-form">
                        <div className="form-group">
                            <label>Component Name</label>
                            <Input
                                value={componentForm.componentName}
                                onChange={(e) => setComponentForm({ ...componentForm, componentName: e.target.value })}
                                placeholder="e.g., House Rent Allowance, Provident Fund"
                            />
                        </div>

                        <div className="form-group">
                            <label>Component Type</label>
                            <select
                                value={componentForm.componentType}
                                onChange={(e) => setComponentForm({ ...componentForm, componentType: e.target.value as any })}
                                className="form-select"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <option value="Earning">Earning</option>
                                <option value="Deduction">Deduction</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Calculation Type</label>
                            <select
                                value={componentForm.calculationType}
                                onChange={(e) => setComponentForm({ ...componentForm, calculationType: e.target.value as any })}
                                className="form-select"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <option value="Fixed">Fixed Amount</option>
                                <option value="Percentage">Percentage of Wage</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                {componentForm.calculationType === 'Percentage' 
                                    ? 'Percentage Value (%)' 
                                    : 'Fixed Amount (₹)'}
                            </label>
                            <Input
                                type="number"
                                value={componentForm.value}
                                onChange={(e) => setComponentForm({ ...componentForm, value: Number(e.target.value) })}
                                placeholder={componentForm.calculationType === 'Percentage' ? 'e.g., 50' : 'e.g., 5000'}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <Input
                                value={componentForm.description}
                                onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })}
                                placeholder="Brief description of this component"
                            />
                        </div>

                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSaveComponent}>
                                {editingComponent ? 'Update Component' : 'Add Component'}
                            </Button>
                            <Button variant="secondary" onClick={() => setShowComponentModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
};
