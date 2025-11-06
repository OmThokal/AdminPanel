import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import User from "../assets/userimg.jpg";
export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="profile">
        <img src={User} alt="User" className="avatar" />
        <div>
          <p className="name">Om Thokal</p>
          <span className="status">● Online</span>
        </div>
      </div>

      <nav className="nav">
        <ul>
          <li>
            <NavLink to="/dashboard">🏠 Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/categories">📁 Categories</NavLink>
          </li>
          <li>
            <NavLink to="/brands">🏷️ Brands</NavLink>
          </li>
          <li>
            <NavLink to="/products">📦 Products</NavLink>
          </li>
          <li>
            <NavLink to="/orders">🧾 Orders</NavLink>
          </li>
          {/* <li>
            <NavLink to="/reports">📊 Reports</NavLink>
          </li> */}
          {/* <li>
            <NavLink to="/settings">⚙️ Settings</NavLink>
          </li> */}
        </ul>
      </nav>
    </aside>
  );
}
