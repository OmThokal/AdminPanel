import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate
import axios from "axios";
import CreateOrder from "./CreateOrder";
import InvoiceDetail from "./InvoiceDetail";
import "./Orders.css";

const API_BASE_URL = "http://localhost:8080/api/orders";

const Orders = () => {
  const navigate = useNavigate(); // ✅ initialize navigate
  const [view, setView] = useState("list");
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setOrders(
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  useEffect(() => {
    if (view === "list") fetchOrders();
  }, [view, fetchOrders]);

  const handleViewInvoice = (orderId) => {
    setCurrentOrderId(orderId);
    setView("invoice");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order and all its details?"
      )
    ) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        console.log("Delete response:", response.data);
        fetchOrders(); // refresh list
      } catch (error) {
        if (error.response) {
          console.error(
            "Error deleting order:",
            error.response.data.error
          );
          alert(`Error: ${error.response.data.error}`);
        } else {
          console.error("Error deleting order:", error.message);
          alert("Error deleting order. Check console for details.");
        }
      }
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredOrders.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredOrders.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  if (view === "create") return <CreateOrder onBack={() => setView("list")} />;
  if (view === "invoice")
    return (
      <InvoiceDetail orderId={currentOrderId} onBack={() => setView("list")} />
    );

  return (
    <div className="list-orders-container">
      <div className="list-orders-header">
        <h3>List Orders</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>List Orders</span>
        </div>
      </div>

      <div className="listing-orders-title">Listing Orders</div>

      <div className="table-controls">
        <div className="show-entries">
          Show
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          entries
        </div>
        <div className="search-and-add">
          <div className="search-box">
            <label htmlFor="search">Search:</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-order-btn" onClick={() => setView("create")}>
            Create Order
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Customer Information</th>
              <th>Total Products</th>
              <th>Total Amount</th>
              <th>Discount(%)</th>
              <th>Created at</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((order, index) => (
                <tr key={order._id}>
                  <td>{indexOfFirstEntry + index + 1}</td>
                  <td className="customer-info-cell">
                    <p>Name: {order.customerName}</p>
                    <p>Email: {order.customerEmail}</p>
                    <p>Phone: {order.customerContactNumber}</p>
                  </td>
                  <td>{order.totalProducts}</td>
                  <td>INR {order.totalAmount.toFixed(2)}</td>
                  <td>{order.discountPercentage}%</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <span
                      className={`status-badge ${order.paymentMode.toLowerCase()}`}
                    >
                      {order.paymentMode}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-invoice"
                        onClick={() => handleViewInvoice(order._id)}
                      >
                        Invoice
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(order._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {indexOfFirstEntry + 1} to{" "}
          {Math.min(indexOfLastEntry, filteredOrders.length)} of{" "}
          {filteredOrders.length} entries
        </div>
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-number">{currentPage}</div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
