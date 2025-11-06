// Report.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// import "./Report.css"; // create this css file

const API_BASE_URL = "http://localhost:8080/api";

const Report = ({ onBack }) => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/reports`, {
        params: filters,
      });
      setSummary(res.data.summary);
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Report fetch error:", err);
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h3>Reports</h3>
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      {/* Summary Cards */}
      <div className="report-summary">
        <div className="summary-card">
          <h4>Total Orders</h4>
          <p>{summary.totalOrders}</p>
        </div>
        <div className="summary-card">
          <h4>Total Revenue</h4>
          <p>₹{summary.totalRevenue}</p>
        </div>
        <div className="summary-card">
          <h4>Total Products</h4>
          <p>{summary.totalProducts}</p>
        </div>
        <div className="summary-card">
          <h4>Total Customers</h4>
          <p>{summary.totalCustomers}</p>
        </div>
      </div>

      {/* Filters */}
      <form className="report-filters" onSubmit={handleFilterSubmit}>
        <label>Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <label>End Date:</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <button type="submit" className="filter-btn">
          Apply
        </button>
      </form>

      {/* Orders Table */}
      <div className="report-table">
        <h4>Order Details</h4>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.total}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found for selected dates.</p>
        )}
      </div>
    </div>
  );
};

export default Report;
