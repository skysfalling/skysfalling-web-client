import React from "react";
import defaultAvatar from "../../../assets/icons/user/default-user-0.svg";
import Status from "../Status";
import "../User.styles.css";

interface ProfileProps {
  email: string;
  name: string;
  image: string;
}

// ================ << MAIN COMPONENT >> ================

/**
 * Profile component
 * @description Display the given user information. 
 * This does not require authentication.
 * @param {ProfileProps} email - User email
 * @param {ProfileProps} name - User name
 * @param {ProfileProps} image - User image
 * @returns {JSX.Element} Profile component
 */
export function Profile({ email, name, image }: ProfileProps) {
  // (( If No Image, Use Default )) -------- >>
  if (!image) {
    image = defaultAvatar;
  }

  // (( If No Name, Use Front of Email )) -------- >>
  if (!name) {
    name = email.split("@")[0];
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="card-container">
      {/* -------- (( AVATAR )) -------- >> */}
      <div className="user-profile-avatar">
        <img src={image} alt="user avatar" />
      </div>
      {/* -------- (( DETAILS )) -------- >> */}
      <div className="user-profile-details">
        <h6>{name || ""}</h6>
        <p>{email || ""}</p>
      </div>
      <Status/>
    </div>
  );
}
