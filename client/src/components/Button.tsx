import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full-width',
        loading && 'btn-loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="spinner" />}
            <span className={loading ? 'btn-content-loading' : ''}>{children}</span>
        </button>
    );
};
