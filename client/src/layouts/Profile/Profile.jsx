import React, { useContext } from "react";
import { AuthContext } from "../../context";
import { Login, Register, Logout } from "../../components/User";

function Profile() {
  const authContext = useContext(AuthContext);

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <h1>Profile</h1>

      <p>AuthState : {authContext.status ? "Logged In" : "Logged Out"}</p>
      <div>User Data : {authContext.user ? (
        <div style={{marginLeft: "20px"}}>
          <p>Email : {authContext.user.email}</p>
          <p>Name : {authContext.user.name}</p>
          <p>Id : {authContext.user.id}</p>
        </div>
      ) : "No User Data"}</div>

      {authContext.status ? (
        <div className="card-container">
          <Logout />
        </div>
      ) : (
        <div className="card-container">
          <Login />
        </div>
      )}

    </div>
  );
}

export default Profile;
