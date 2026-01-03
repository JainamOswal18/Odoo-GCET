export const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    const current = new Date(start);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
};

export const getCurrentMonth = () => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, '0');
};

export const getCurrentYear = () => {
    return new Date().getFullYear();
};

export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};
