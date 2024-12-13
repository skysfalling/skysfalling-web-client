import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import AuthService from "../../../classes/services/AuthService";
import "../User.styles.css";
import { IUserAuthRequest, IUserAuthResponse } from "@shared/interfaces";
import { AuthContext } from "src/context/AuthContext";

/**
 * Login component
 * @returns {JSX.Element} Login component
 */
export default function Login() {
  const { setAuthContext } = useContext(AuthContext);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
    
  const initialValues: IUserAuthRequest = {
    email: "astro@dummy.com",
    password: ""
  };

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={AuthService.AuthLoginValidationSchema}
        onSubmit={async (values) => {
          const response: IUserAuthResponse = await AuthService.Login(values, setAuthContext);
          if (response.success) {
            setLoginSuccess(true);
            setLoginError(null);
          } else {
            setLoginSuccess(false);
            setLoginError(response.message ?? null);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* (( EMAIL FIELD )) -------- >> */}
            <div className="form-group">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="form-input"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error-message"
              />
            </div>

            {/* (( PASSWORD FIELD )) -------- >> */}
            <div className="form-group">
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="form-input"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error-message"
              />
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <div className="submit-result">
              {loginError && <div className="submit-result-error">Login Error : {loginError}</div>}
              {loginSuccess && <div className="submit-result-success">Login successful</div>}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}