import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import "../components/Card.css";

const API_BASE_URL = "http://localhost:8080/api";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    categories: 0,
    brands: 0,
    products: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/counts`);

      setCounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard counts:", err);
      setError("Failed to load dashboard data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p className="text-xl font-semibold text-gray-600">
          Loading Dashboard Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p className="text-xl font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="mr-2 text-4xl">📊</span> Dashboard
        </h1>
      </div>

      <div className="dashboard-cards mt-6">
        <Card
          number={counts.categories}
          title="Categories"
          color="#2a9fd6"
          icon="🛍️"
        />
        <Card number={counts.brands} title="Brands" color="#4CAF50" icon="🏷️" />
        <Card
          number={counts.products}
          title="Products"
          color="#E94A4A"
          icon="📦"
        />
        <Card number={counts.orders} title="Orders" color="#F5B041" icon="🛒" />
      </div>
    </div>
  );
};

export default Dashboard;
