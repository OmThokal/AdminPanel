import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import "./Orders.css";

const API_BASE_URL = "http://localhost:8080/api/orders";

// === PDF GENERATOR ===
const generatePdf = (orderData) => {
  const { order, items } = orderData;
  const totalDiscount = order.subtotalAmount - order.totalAmount;
  const doc = new jsPDF();

  // ===== COMPANY HEADER =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("My Company Pvt Ltd", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("123, Business Street, Pune, India", 14, 20);
  doc.text("Email: mycompany123@gmail.com | Phone: +91-9322027580", 14, 25);

  // Invoice number & date (top-right)
  doc.setFontSize(12);
  doc.text(`Invoice #: ${order._id.substring(0, 8).toUpperCase()}`, 150, 15);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 22);

  // ===== CUSTOMER INFO =====
  autoTable(doc, {
    startY: 35,
    theme: "plain",
    styles: { fontSize: 11 },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } },
    body: [
      [
        {
          content: `Billed To:\n${order.customerName}\n${order.customerAddress}\n${order.customerContactNumber}`,
        },
        {
          content: `Shipped To:\n${order.customerName}\n${order.customerAddress}\n${order.customerContactNumber}`,
        },
      ],
    ],
  });

  // ===== ITEMS TABLE =====
  const itemRows = items.map((item) => [
    item.productName,
    `Rs. ${item.unitPrice.toFixed(2)}`,
    item.quantity,
    `Rs. ${item.lineTotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Item", "Price", "Quantity", "Total"]],
    body: itemRows,
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: {
      fillColor: [46, 111, 168],
      textColor: 255,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "right" },
    },
  });

  // ===== TOTALS BOX =====
  const finalY = doc.lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: finalY,
    theme: "plain",
    styles: { fontSize: 11, halign: "right" },
    body: [
      ["Subtotal (Rs. ):", `Rs. ${order.subtotalAmount.toFixed(2)}`],
      [
        `Discount (${order.discountPercentage}%):`,
        `- Rs. ${totalDiscount.toFixed(2)}`,
      ],
      [
        { content: "Grand Total (Rs. ):", styles: { fontStyle: "bold" } },
        {
          content: `Rs. ${order.totalAmount.toFixed(2)}`,
          styles: { fontStyle: "bold" },
        },
      ],
    ],
  });

  // ===== FOOTER =====
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Thank you for your business!", 14, 285);

  // ✅ Force download
  doc.save(`Invoice_Order_${order._id.substring(0, 8)}.pdf`);
};

// === MAIN COMPONENT ===
const InvoiceDetail = ({ orderId, onBack }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order by ID
  const fetchInvoiceData = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${orderId}`);
      setOrderData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  const exportPdf = () => {
    if (orderData) {
      generatePdf(orderData);
    }
  };

  // === UI STATES ===
  if (loading) {
    return <div className="loading-state">Loading Invoice...</div>;
  }

  if (error || !orderData) {
    return (
      <div className="error-state">
        {error || "Order not found."}
        <button className="back-btn" onClick={onBack}>
          Back to List
        </button>
      </div>
    );
  }

  const { order, items } = orderData;
  const totalDiscountAmount = order.subtotalAmount - order.totalAmount;

  // === RENDER INVOICE ===
  return (
    <div className="invoice-detail-container">
      <div className="invoice-detail-header">
        <h3>Invoice Detail</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>Invoice Detail</span>
        </div>
        <div className="invoice-header-actions">
          <button className="back-btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <button className="btn-export-pdf" onClick={exportPdf}>
            <i className="fas fa-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <div className="invoice-card">
        <div className="invoice-title">
          Invoice: #{order._id.substring(0, 8).toUpperCase()}
        </div>

        <div className="invoice-metadata-grid">
          <div className="billed-to">
            <h4>Billed To:</h4>
            <p>
              <strong>{order.customerName}</strong>
            </p>
            <p>{order.customerAddress}</p>
            <p>{order.customerContactNumber}</p>
          </div>

          <div className="shipped-to">
            <h4>Shipped To:</h4>
            <p>
              <strong>{order.customerName}</strong>
            </p>
            <p>{order.customerAddress}</p>
            <p>{order.customerContactNumber}</p>
          </div>

          <div className="payment-info">
            <h4>Payment/Contact:</h4>
            <p className={`status-text ${order.paymentMode.toLowerCase()}`}>
              {order.paymentMode}
            </p>
            <p>{order.customerEmail}</p>
          </div>

          <div className="order-dates">
            <h4>Order Date:</h4>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            <p>{new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="order-summary-box">
          <h4>Order Summary</h4>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Totals</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.productName}</td>
                  <td>Rs. {item.unitPrice.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right">
                  Subtotal (Rs. )
                </td>
                <td>Rs. {order.subtotalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right">
                  Discount ({order.discountPercentage}%)
                </td>
                <td>- Rs. {totalDiscountAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right final-total">
                  Total (Rs. )
                </td>
                <td className="final-total">
                  Rs. {order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
