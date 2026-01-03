import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Employee';
    employeeId: string;
    employeeUUID: string;
    department?: string;
    position?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (loginId: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<{ loginId: string; password: string }>;
    logout: () => void;
    loading: boolean;
}

interface RegisterData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName?: string;
    avatar?: File;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth session
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('authToken');
        
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, []);

    const login = async (loginId: string, password: string) => {
        setLoading(true);
        try {
            const response = await api.login(loginId, password);
            
            const userSession: User = {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
                role: response.user.role as 'Admin' | 'Employee',
                employeeId: response.employee?.employeeId || '',
                employeeUUID: response.employee?.id || '',
                department: response.employee?.department,
                position: response.employee?.position,
            };

            setUser(userSession);
            localStorage.setItem('currentUser', JSON.stringify(userSession));
            localStorage.setItem('authToken', response.token);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData): Promise<{ loginId: string; password: string }> => {
        setLoading(true);
        try {
            const response = await api.register(data);
            
            return {
                loginId: response.loginId,
                password: response.generatedPassword,
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
