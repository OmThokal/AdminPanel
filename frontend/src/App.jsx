import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Products from "./pages/Products";
import Order from "./pages/Order";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const userName = "Om Thokal";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      <div className="app-layout">
        {isLoggedIn && <Sidebar isOpen={sidebarOpen} />}

        <div
          className={`main-content ${
            isLoggedIn ? (sidebarOpen ? "" : "full-width") : "full-width"
          }`}
        >
          {isLoggedIn && (
            <Navbar
              userName={userName}
              onLogout={handleLogout}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          )}

          <main className="main-page">
            <Routes>
              <Route path="/login" element={<LoginForm onLogin={() => setIsLoggedIn(true)} />} />
              <Route path="/register" element={<RegisterForm onRegister={() => setIsLoggedIn(true)} />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/categories" element={isLoggedIn ? <Categories /> : <Navigate to="/login" />} />
              <Route path="/brands" element={isLoggedIn ? <Brands /> : <Navigate to="/login" />} />
              <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/login" />} />
              <Route path="/orders" element={isLoggedIn ? <Order /> : <Navigate to="/login" />} />
              <Route path="/reports" element={isLoggedIn ? <Reports /> : <Navigate to="/login" />} />
              <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
