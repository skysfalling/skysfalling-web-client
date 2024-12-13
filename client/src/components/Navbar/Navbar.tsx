import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import NavLink from "../../interfaces/NavLink";

import "./Navbar.styles.css";

/**
 * Navigation Bar for the Web page
 */
const Navbar = ({ links }: { links: NavLink[] }) => {
  return (
    <nav className="nav-bar">
      <ThemeToggle />
      
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="nav-link"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
