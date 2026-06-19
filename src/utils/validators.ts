// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone number validation (Indian format)
export const isValidPhone = (phone: string): boolean => {
    // Accepts formats: 9876543210, +919876543210, +91 9876543210
    const phoneRegex = /^(\+91[\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password validation
export const isValidPassword = (password: string): boolean => {
    // At least 6 characters
    return password.length >= 6;
};

// Serial number validation
export const isValidSerialNo = (serialNo: string): boolean => {
    // Not empty and reasonable length
    return serialNo.trim().length > 0 && serialNo.length <= 20;
};

// Name validation
export const isValidName = (name: string): boolean => {
    // Not empty and reasonable length
    return name.trim().length > 0 && name.length <= 100;
};

// Number validation
export const isValidNumber = (value: string | number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= 0;
};

// Validation error messages
export const ValidationErrors = {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    NAME_REQUIRED: 'Name is required',
    PHONE_INVALID: 'Please enter a valid phone number',
    SERIAL_NO_REQUIRED: 'Serial number is required',
    BRANCH_REQUIRED: 'Please select a branch',
    RATE_INVALID: 'Please enter a valid rate',
};

// Form validators
export const validateLoginForm = (email: string, password: string): string | null => {
    if (!email) return ValidationErrors.EMAIL_REQUIRED;
    if (!isValidEmail(email)) return ValidationErrors.EMAIL_INVALID;
    if (!password) return ValidationErrors.PASSWORD_REQUIRED;
    if (!isValidPassword(password)) return ValidationErrors.PASSWORD_TOO_SHORT;
    return null;
};

export const validateRegisterForm = (
    email: string,
    password: string,
    name: string,
    phone?: string
): string | null => {
    if (!email) return ValidationErrors.EMAIL_REQUIRED;
    if (!isValidEmail(email)) return ValidationErrors.EMAIL_INVALID;
    if (!password) return ValidationErrors.PASSWORD_REQUIRED;
    if (!isValidPassword(password)) return ValidationErrors.PASSWORD_TOO_SHORT;
    if (!name) return ValidationErrors.NAME_REQUIRED;
    if (phone && !isValidPhone(phone)) return ValidationErrors.PHONE_INVALID;
    return null;
};

export const validateWorkerForm = (
    name: string,
    serialNo: string,
    phone?: string
): string | null => {
    if (!name) return ValidationErrors.NAME_REQUIRED;
    if (!serialNo) return ValidationErrors.SERIAL_NO_REQUIRED;
    if (phone && !isValidPhone(phone)) return ValidationErrors.PHONE_INVALID;
    return null;
};

export const validateBranchForm = (
    name: string,
    permanentRate: string | number,
    contractRate: string | number
): string | null => {
    if (!name) return ValidationErrors.NAME_REQUIRED;
    if (!isValidNumber(permanentRate)) return ValidationErrors.RATE_INVALID;
    if (!isValidNumber(contractRate)) return ValidationErrors.RATE_INVALID;
    return null;
};
