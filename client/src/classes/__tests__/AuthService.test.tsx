import { AuthService } from '../services/AuthService';
import axios from 'axios';
import { AuthContextRequest, AuthContextResponse } from '../../context/AuthContext';  
import { UserSettings } from '../../Settings';

// Mock axios to intercept and control network requests during testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  // Mock functions to simulate React state setters
  // These will help us verify that the AuthService correctly updates authentication context
  const mockSetAuthContext = jest.fn();   // Mocks the function that sets authentication context

  // Create a fresh AuthService instance before each test
  // This ensures each test starts with a clean slate
  let authService: AuthService;
  beforeEach(() => {
    // Clear all mock function calls and reset their state
    jest.clearAllMocks();
    
    // Clear localStorage to prevent test interference
    localStorage.clear();

    // Create a new AuthService instance with mock state setters
    // This allows us to track how the service interacts with state
    authService = new AuthService(mockSetAuthContext);
  });

  // Grouped tests for Login functionality
  describe('Login', () => {
    // A valid login request to use across login tests
    const validLoginRequest : AuthContextRequest = {
      email: 'astro@dummy.com',
      password: '1234567890'
    };

    // An invalid login request to test error scenarios
    const invalidLoginRequest : AuthContextRequest = {
      email: 'invalid@dummy.com',
      password: 'wrongpassword'
    };

    it('should successfully login with valid credentials', async () => {
      // ARRANGE: Prepare mock responses for different API calls

      // Mock the login API response
      // This simulates a successful login from the server
      const mockLoginAuthResponse : AuthContextResponse = {
        status: true,
        user: {
          id: 1,
          email: 'astro@dummy.com',
          name: 'astro'
        },
        message: 'Login successful',
        accessToken: 'mock_access_token'
      };

      // Configure axios mocks to return our predefined responses
      // This allows us to control the network request behavior in the test
      mockedAxios.post.mockResolvedValue(mockLoginAuthResponse);  // Mock login POST request

      // ACT: Perform the login action
      const result = await authService.Login(validLoginRequest);

      // ASSERT: Verify the expected outcomes of the login process

      // Check that the login state is set to LOGGED_IN
      expect(result.status).toBe(true);

      // Verify the success message contains 'Login successful'
      expect(result.message).toContain('Login successful');

      // Check that the access token is correctly stored in localStorage
      expect(localStorage.getItem(UserSettings.accessTokenKey)).toBe('mock_access_token');

      // Verify that the authentication state was set to true
      expect(mockSetAuthContext).toHaveBeenCalledWith(true, expect.objectContaining({
        email: 'astro@dummy.com'
      }));
    });

    it('should handle login with invalid credentials', async () => {
      // ARRANGE: Prepare mock error response for invalid login
      // This simulates a server-side authentication failure
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Invalid email or password'
          },
          status: 401  // Unauthorized status code
        }
      };

      // Configure axios mock to throw an error for invalid login
      // This simulates a failed authentication attempt
      mockedAxios.post.mockRejectedValue(mockErrorResponse);

      // ACT: Attempt to log in with invalid credentials
      const result = await authService.Login(invalidLoginRequest);

      // ASSERT: Verify the expected outcomes of the failed login

      // Check that the login state is set to LOGGED_OUT
      expect(result.status).toBe(false);

      // Verify the error message matches the mock response
      expect(result.message).toContain('Invalid email or password');

      // Ensure no access token is stored in localStorage
      expect(localStorage.getItem(UserSettings.accessTokenKey)).toBeNull();

      // Verify that the authentication state was set to false
      expect(mockSetAuthContext).toHaveBeenCalledWith(false, undefined);
    });
  });
});