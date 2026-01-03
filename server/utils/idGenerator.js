// Generate Login ID in format: OI[FirstName2][LastName2][Year][Serial]
// Example: OIJOOO20220001 for John Doe joining in 2022
export const generateEmployeeId = (firstName, lastName, year, serialNumber) => {
    const firstTwo = firstName.substring(0, 2).toUpperCase();
    const lastTwo = lastName.substring(0, 2).toUpperCase();
    const serial = serialNumber.toString().padStart(4, '0');
    return `OI${firstTwo}${lastTwo}${year}${serial}`;
};

// Generate random password using adjective + animal pattern
const adjectives = [
    'Bouncy', 'Virtuous', 'Velvety', 'Swift', 'Bright', 'Calm', 'Daring', 'Eager',
    'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively', 'Merry', 'Noble', 'Proud',
    'Quick', 'Brave', 'Clever', 'Fierce', 'Wise', 'Bold', 'Smart', 'Strong'
];

const animals = [
    'Armadillo', 'Wildcat', 'Meerkat', 'Panther', 'Falcon', 'Tiger', 'Eagle', 'Lion',
    'Wolf', 'Bear', 'Hawk', 'Fox', 'Owl', 'Lynx', 'Puma', 'Leopard',
    'Cheetah', 'Jaguar', 'Otter', 'Badger', 'Raven', 'Shark', 'Whale', 'Dragon'
];

export const generateRandomPassword = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective}${animal}`;
};
