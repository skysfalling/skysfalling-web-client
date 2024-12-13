import axios, { AxiosError } from "axios";

// Custom error types for different scenarios
export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

class ErrorService {
    /**
     * Handles API request errors with detailed error checking and logging
     * @param prefix - Prefix for error logging
     * @param error - The error object to handle
     * @throws Various error types based on the scenario
     */
    static HandleAPIRequestError(prefix: string, error: any): void {
        // Handle Axios specific errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const statusCode = axiosError.response?.status;
            const errorMessage = axiosError.message || 'An error occurred';

            console.log(`${prefix} Axios Error [${statusCode}]: `, axiosError.response);

            // Handle specific HTTP status codes
            switch (statusCode) {
                // Client Errors (4xx)
                case 400:
                    throw new ValidationError(`Bad Request: ${errorMessage}`);
                case 401:
                    throw new AuthenticationError('Authentication required');
                case 403:
                    throw new AuthenticationError('Access forbidden');
                case 404:
                    throw new Error(`Resource not found: ${errorMessage}`);
                case 405:
                    throw new Error(`Method not allowed: ${errorMessage}`);
                case 408:
                    throw new NetworkError('Request timeout');
                case 409:
                    throw new Error(`Resource conflict: ${errorMessage}`);
                case 429:
                    throw new Error('Too many requests. Please try again later');

                // Server Errors (5xx)
                case 500:
                    throw new Error(`Internal server error: ${errorMessage}`);
                case 502:
                    throw new NetworkError('Bad gateway');
                case 503:
                    throw new NetworkError('Service unavailable');
                case 504:
                    throw new NetworkError('Gateway timeout');

                default:
                    if (statusCode && statusCode >= 400 && statusCode < 500) {
                        throw new Error(`Client error (${statusCode}): ${errorMessage}`);
                    } else if (statusCode && statusCode >= 500) {
                        throw new Error(`Server error (${statusCode}): ${errorMessage}`);
                    }
            }

            // Handle network-related errors
            if (axiosError.code === 'ECONNABORTED') {
                throw new NetworkError('Request timed out');
            }
            if (axiosError.code === 'ECONNREFUSED') {
                throw new NetworkError('Connection refused');
            }
            if (!axiosError.response) {
                throw new NetworkError('Network error - No response received');
            }
        }
        // Handle standard JavaScript errors
        else if (error instanceof Error) {
            console.log(`${prefix} Standard Error: `, error);
            
            // Handle specific error types
            if (error instanceof TypeError) {
                throw new Error(`Type error: ${error.message}`);
            }
            if (error instanceof ReferenceError) {
                throw new Error(`Reference error: ${error.message}`);
            }
            if (error instanceof SyntaxError) {
                throw new Error(`Syntax error: ${error.message}`);
            }

            throw new Error(error.message || 'An unexpected error occurred');
        }
        // Handle unknown errors
        else {
            console.log(`${prefix} Unknown Error: `, error);
            throw new Error('An unknown error occurred');
        }
    }

    /**
     * Handles validation errors for form submissions or data processing
     * @param errors - Object containing validation errors
     */
    static HandleValidationError(errors: Record<string, string[]>): void {
        const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
        throw new ValidationError(`Validation failed: ${errorMessages}`);
    }

    /**
     * Handles rate limiting errors
     * @param retryAfter - Optional time (in seconds) to wait before retrying
     */
    static HandleRateLimitError(retryAfter?: number): void {
        const message = retryAfter 
            ? `Rate limit exceeded. Please try again in ${retryAfter} seconds`
            : 'Rate limit exceeded. Please try again later';
        throw new Error(message);
    }

    /**
     * Handles authentication-related errors
     * @param type - Type of authentication error
     */
    static HandleAuthError(type: 'expired' | 'invalid' | 'missing'): void {
        switch (type) {
            case 'expired':
                throw new AuthenticationError('Authentication token has expired');
            case 'invalid':
                throw new AuthenticationError('Invalid authentication token');
            case 'missing':
                throw new AuthenticationError('Authentication token is missing');
        }
    }

    /**
     * Logs errors to an external service (implement as needed)
     * @param error - Error to log
     * @param context - Additional context information
     */
    static LogError(error: Error, context?: Record<string, any>): void {
        // Implement error logging logic (e.g., to external service)
        console.error('Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }
}

export default ErrorService;
