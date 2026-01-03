const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    private getHeaders(includeAuth: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const data = await response.json();

        if (!response.ok) {
            // If validation error with details, show the first field error
            if (data.details && Array.isArray(data.details) && data.details.length > 0) {
                throw new Error(data.details[0].message);
            }
            throw new Error(data.error || data.message || 'An error occurred');
        }

        return data;
    }

    // Auth APIs
    async login(loginId: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ loginId, password }),
        });

        return this.handleResponse<{
            token: string;
            user: {
                id: string;
                email: string;
                role: string;
                name: string;
            };
            employee: {
                id: string;
                firstName: string;
                lastName: string;
                employeeId: string;
                department?: string;
                position?: string;
            } | null;
        }>(response);
    }

    async register(data: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        companyName?: string;
        avatar?: File;
    }) {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('phone', data.phone);
        if (data.companyName) {
            formData.append('companyName', data.companyName);
        }
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        return this.handleResponse<{
            message: string;
            loginId: string;
            generatedPassword: string;
            email: string;
            firstName: string;
            lastName: string;
        }>(response);
    }

    async forgotPassword(email: string) {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });

        return this.handleResponse<{
            message: string;
        }>(response);
    }

    async resetPassword(token: string, newPassword: string) {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ token, newPassword }),
        });

        return this.handleResponse<{
            message: string;
        }>(response);
    }

    async changePassword(currentPassword: string, newPassword: string) {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        return this.handleResponse(response);
    }

    // Employee APIs
    async getEmployeeProfile(employeeId: string) {
        const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    async updateEmployeeProfile(employeeId: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    // Attendance APIs
    async checkIn(employeeId: string) {
        const response = await fetch(`${API_BASE_URL}/attendance/${employeeId}/check-in`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    async checkOut(employeeId: string) {
        const response = await fetch(`${API_BASE_URL}/attendance/${employeeId}/check-out`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    async getAttendance(employeeId: string, params?: { startDate?: string; endDate?: string }) {
        const queryParams = new URLSearchParams(params as any).toString();
        const response = await fetch(
            `${API_BASE_URL}/attendance/${employeeId}?${queryParams}`,
            {
                method: 'GET',
                headers: this.getHeaders(true),
            }
        );

        return this.handleResponse(response);
    }

    // Leave APIs
    async applyLeave(employeeId: string, data: {
        leaveType: string;
        startDate: string;
        endDate: string;
        remarks?: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/leave/${employeeId}/apply`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    async getLeaveRequests(employeeId: string, status?: string) {
        const queryParams = status ? `?status=${status}` : '';
        const response = await fetch(
            `${API_BASE_URL}/leave/${employeeId}${queryParams}`,
            {
                method: 'GET',
                headers: this.getHeaders(true),
            }
        );

        return this.handleResponse(response);
    }

    async getLeaveBalance(employeeId: string, year?: number) {
        const queryParams = year ? `?year=${year}` : '';
        const response = await fetch(
            `${API_BASE_URL}/leave/${employeeId}/balance${queryParams}`,
            {
                method: 'GET',
                headers: this.getHeaders(true),
            }
        );

        return this.handleResponse(response);
    }

    async approveLeave(leaveRequestId: string, comments?: string) {
        const response = await fetch(`${API_BASE_URL}/leave/approve/${leaveRequestId}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ approvalComments: comments }),
        });

        return this.handleResponse(response);
    }

    async rejectLeave(leaveRequestId: string, comments?: string) {
        const response = await fetch(`${API_BASE_URL}/leave/reject/${leaveRequestId}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ approvalComments: comments }),
        });

        return this.handleResponse(response);
    }

    // Dashboard APIs
    async getEmployeeDashboard() {
        const response = await fetch(`${API_BASE_URL}/dashboard/employee`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    async getAdminDashboard() {
        const response = await fetch(`${API_BASE_URL}/dashboard/admin`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    // Payroll APIs
    async getPayroll(employeeId: string, params?: { month?: string; year?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append('month', params.month);
        if (params?.year) queryParams.append('year', params.year.toString());

        const response = await fetch(
            `${API_BASE_URL}/payroll/${employeeId}?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: this.getHeaders(true),
            }
        );

        return this.handleResponse(response);
    }

    async getSalaryComponents(employeeId: string) {
        const response = await fetch(`${API_BASE_URL}/payroll/${employeeId}/components`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }

    async createSalaryComponent(employeeId: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/payroll/${employeeId}/components`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    async updateSalaryComponent(employeeId: string, componentId: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/payroll/${employeeId}/components/${componentId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    async deleteSalaryComponent(employeeId: string, componentId: string) {
        const response = await fetch(`${API_BASE_URL}/payroll/${employeeId}/components/${componentId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        return this.handleResponse(response);
    }
}

export const api = new ApiService();
export default api;

