export const ROLES = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
} as const;

export const ACTIVITY_STATUS = {
    ON: 'ON',
    OFF: 'OFF',
    AUTO_OFF: 'AUTO_OFF',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    USER_NOT_FOUND: 'User not found',
    USER_INACTIVE: 'User account is inactive',
    EMPLOYEE_NOT_FOUND: 'Employee not found',
    SESSION_NOT_FOUND: 'Activity session not found',
    SESSION_ALREADY_ACTIVE: 'Activity session already active',
    SESSION_NOT_ACTIVE: 'No active session found',
    DUPLICATE_EMAIL: 'Email already exists',
    DUPLICATE_EMPLOYEE_ID: 'Employee ID already exists',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
} as const;

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    EMPLOYEE_CREATED: 'Employee created successfully',
    EMPLOYEE_UPDATED: 'Employee updated successfully',
    LOCATION_SAVED: 'Location saved successfully',
    SESSION_STARTED: 'Activity session started',
    SESSION_ENDED: 'Activity session ended',
} as const;
