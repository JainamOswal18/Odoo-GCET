import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee';
    employeeId: string;
    department?: string;
    position?: string;
}

interface StoredUser extends User {
    password: string; // Only stored locally for demo purposes
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (employeeId: string, email: string, password: string, role: 'admin' | 'employee') => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Helper functions for localStorage
const getStoredUsers = (): StoredUser[] => {
    try {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error reading stored users:', error);
        return [];
    }
};

const saveUser = (user: StoredUser) => {
    try {
        const users = getStoredUsers();
        users.push(user);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('User saved successfully:', user.email);
    } catch (error) {
        console.error('Error saving user:', error);
        throw new Error('Failed to save user data');
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth session
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Get all registered users
            const registeredUsers = getStoredUsers();
            console.log('Registered users:', registeredUsers.length);

            // Find user with matching credentials
            const foundUser = registeredUsers.find(
                u => u.email === email && u.password === password
            );

            if (!foundUser) {
                throw new Error('Invalid email or password');
            }

            // Create user session (without password)
            const userSession: User = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
                employeeId: foundUser.employeeId,
            };

            setUser(userSession);
            localStorage.setItem('currentUser', JSON.stringify(userSession));
            localStorage.setItem('authToken', 'token-' + Date.now());
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        employeeId: string,
        email: string,
        password: string,
        role: 'admin' | 'employee'
    ) => {
        setLoading(true);
        try {
            console.log('Starting registration for:', email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if email already exists
            const existingUsers = getStoredUsers();
            console.log('Checking against existing users:', existingUsers.length);

            if (existingUsers.some(u => u.email === email)) {
                console.log('Email already exists');
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser: StoredUser = {
                id: 'user-' + Date.now(),
                name: email.split('@')[0], // Use email prefix as name
                email,
                password,
                role,
                employeeId,
            };

            console.log('Saving new user:', email);

            // Save to localStorage
            saveUser(newUser);

            console.log('Registration completed successfully for:', email);
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
