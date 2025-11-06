import React, { useState } from "react";
import "./Navbar.css";
import User from "../assets/userimg.jpg";

export default function Navbar({ userName, onLogout, toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="navbar">
      <button className="hamburger" onClick={toggleSidebar}>
        ☰
      </button>

      <div className="navbar-left">
        <h2>Admin Panel</h2>
      </div>

      <div className="navbar-right">
        <div
          className="user-info"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="user-name">{userName}</span>
          <img src={User} alt="User" className="user-avatar" />
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
