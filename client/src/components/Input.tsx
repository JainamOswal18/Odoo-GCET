import React, { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helpText,
    icon,
    type = 'text',
    className = '',
    id,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {props.required && <span className="required-mark">*</span>}
                </label>
            )}

            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}

                <input
                    id={inputId}
                    type={inputType}
                    className={`input ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
                    {...props}
                />

                {type === 'password' && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}
            </div>

            {error && <span className="input-error-message">{error}</span>}
            {helpText && !error && <span className="input-help-text">{helpText}</span>}
        </div>
    );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    helpText?: string;
}> = ({ label, error, helpText, className = '', id, ...props }) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={textareaId} className="input-label">
                    {label}
                    {props.required && <span className="required-mark">*</span>}
                </label>
            )}

            <textarea
                id={textareaId}
                className={`input textarea ${error ? 'input-error' : ''}`}
                {...props}
            />

            {error && <span className="input-error-message">{error}</span>}
            {helpText && !error && <span className="input-help-text">{helpText}</span>}
        </div>
    );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    helpText?: string;
    options: { value: string; label: string }[];
}> = ({ label, error, helpText, options, className = '', id, ...props }) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={selectId} className="input-label">
                    {label}
                    {props.required && <span className="required-mark">*</span>}
                </label>
            )}

            <select
                id={selectId}
                className={`input select ${error ? 'input-error' : ''}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && <span className="input-error-message">{error}</span>}
            {helpText && !error && <span className="input-help-text">{helpText}</span>}
        </div>
    );
};
