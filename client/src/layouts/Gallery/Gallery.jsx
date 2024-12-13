import React, { useState, useEffect } from "react";
import axios from "axios";
import { Profile } from "../../components/User";
import { Panel as DebugPanel } from '../../components/Debug';
import { Grid } from '../../components/Grid';

// ( Styles ) ----------------
import './Gallery.styles.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const Gallery = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging function
  const debug = (...args) => {
    if (process.env.REACT_APP_DEBUG === "true") {
      console.log("[Users Debug]:", ...args);
    }
  };

  // Log all environment variables on component mount
  useEffect(() => {
    debug("Environment Variables:", {
      SERVER_URL: process.env.REACT_APP_SERVER_URL,
      ENV: process.env.REACT_APP_ENV,
      DEBUG: process.env.REACT_APP_DEBUG,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  // (( FETCH USERS )) -------- >>
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${SERVER_URL}/auth/getAll`);
        setUsers(response.data);
      } catch (err) {
        const errorMessage = err.message || "Failed to fetch users";
        debug("Error:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ================ << RETURNING UI ELEMENTS >> ================
  // (( DRAW LOADING )) -------- >>
  if (loading) {
    return (
      <section className="users-page">
        <h1>Users</h1>
        <div className="loading">Loading users...</div>
      </section>
    );
  }

  // (( DRAW ERROR )) -------- >>
  if (error && users.length === 0) {
    return (
      <section className="users-page">
        <h1>Users</h1>
        <div className="error">
          <p>Error: {error}</p>
          <div className="debug-info">
            <p>Environment Information:</p>
            <pre>
              {JSON.stringify(
                {
                  SERVER_URL: process.env.REACT_APP_SERVER_URL || "Not set",
                  ENV: process.env.NODE_ENV,
                  DEBUG: process.env.REACT_APP_DEBUG || "Not set",
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </section>
    );
  }

  // (( DRAW USERS )) -------- >>
  return (
    <section className="users-page">
      <h1>Users</h1>
      <DebugPanel
        messages={[
            `Server URL: ${SERVER_URL}`,
            `Environment: ${process.env.NODE_ENV}`,
            `${users.length} users fetched`
        ]}
      />

      <Grid>
        {users.map((user, index) => (
          <Profile
            email={user.email}
            name={user.name}
            image={user.image}
            key={index}
          />
        ))}
      </Grid>
    </section>
  );
};

export default Gallery;
