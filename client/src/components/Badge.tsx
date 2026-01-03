import React from 'react';
import './Badge.css';

export type BadgeStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'present'
    | 'absent'
    | 'on-leave'
    | 'processing'
    | 'on-time'
    | 'late';

interface BadgeProps {
    status: BadgeStatus;
    children?: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className = '' }) => {
    const statusLabels: Record<BadgeStatus, string> = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        present: 'Present',
        absent: 'Absent',
        'on-leave': 'On Leave',
        processing: 'Processing',
        'on-time': 'On Time',
        late: 'Late',
    };

    return (
        <span className={`badge badge-${status} ${className}`}>
            {children || statusLabels[status]}
        </span>
    );
};

export const StatusDot: React.FC<{ status: 'present' | 'absent' | 'leave' | 'future' }> = ({ status }) => {
    return <span className={`status-dot status-dot-${status}`} />;
};
