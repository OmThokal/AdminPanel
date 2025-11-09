import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import User from "../assets/userimg.jpg";

export default function Sidebar({ isOpen }) {
  return (
    <aside className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="profile">
        <img src={User} alt="User" className="avatar" />
        <div className="profile-info">
          <p className="name">Om Thokal</p>
          <span className="status">● Online</span>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard">🏠 Dashboard</NavLink>
        <NavLink to="/categories">📁 Categories</NavLink>
        <NavLink to="/brands">🏷️ Brands</NavLink>
        <NavLink to="/products">📦 Products</NavLink>
        <NavLink to="/orders">🧾 Orders</NavLink>
      </nav>
    </aside>
  );
}
