import React from 'react';
import './Card.css';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'transparent';

interface CardProps {
    variant?: CardVariant;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    children,
    className = '',
    onClick,
    hoverable = false,
}) => {
    const classes = [
        'card',
        `card-${variant}`,
        (hoverable || onClick) && 'card-hoverable',
        onClick && 'card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};
