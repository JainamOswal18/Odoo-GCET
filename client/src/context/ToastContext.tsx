import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, type, message };

        setToasts(prev => [...prev, newToast]);

        const duration = type === 'error' ? 5000 : type === 'warning' ? 4000 : type === 'info' ? 4000 : 3000;

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast toast-${toast.type}`}>
                            <span className="toast-icon">
                                {toast.type === 'success' && '✓'}
                                {toast.type === 'error' && '✕'}
                                {toast.type === 'warning' && '⚠'}
                                {toast.type === 'info' && 'ℹ'}
                            </span>
                            <span className="toast-message">{toast.message}</span>
                            <button
                                className="toast-close"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Close notification"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
