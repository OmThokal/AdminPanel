import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Orders.css";

const API_BASE_URL = "http://localhost:8080/api/orders";
const CATEGORIES_API_URL = "http://localhost:8080/api/categories";
const BRANDS_API_URL = "http://localhost:8080/api/brands";
const PRODUCTS_API_URL = "http://localhost:8080/api/products";

const CreateOrder = ({ onBack }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerContactNumber: "",
    customerAddress: "",
    discountPercentage: 0,
    paymentMode: "Cash",
    status: "Active",
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      productId: "",
      quantity: 1,
      amount: 0,
      category: "",
      brand: "",
    },
  ]);

  const [dropdownData, setDropdownData] = useState({
    categories: [],
    brands: [],
    products: [],
  });

  const [loading, setLoading] = useState(false);
  const [totalSummary, setTotalSummary] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
  });

  // --- Fetch Categories, Brands, Products ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes, productsRes] = await Promise.all([
          axios.get(CATEGORIES_API_URL),
          axios.get(BRANDS_API_URL),
          axios.get(PRODUCTS_API_URL),
        ]);

        setDropdownData({
          categories: categoriesRes.data,
          brands: brandsRes.data,
          products: productsRes.data,
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchData();
  }, []);

  // --- Calculate Totals ---
  useEffect(() => {
    let subtotal = items.reduce(
      (sum, item) => sum + item.amount * Number(item.quantity),
      0
    );
    let discount = subtotal * (Number(formData.discountPercentage) / 100);
    let total = subtotal - discount;

    setTotalSummary({
      subtotal: subtotal,
      discount: discount,
      total: total,
    });
  }, [items, formData.discountPercentage]);

  // --- Handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, name, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          let updatedItem = { ...item, [name]: value };

          if (name === "productId") {
            const product = dropdownData.products.find((p) => p._id === value);
            if (product) {
              updatedItem.amount = product.amount;
              updatedItem.category = product.category;
              updatedItem.brand = product.brand;
            } else {
              updatedItem.amount = 0;
              updatedItem.category = "";
              updatedItem.brand = "";
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now(),
        productId: "",
        quantity: 1,
        amount: 0,
        category: "",
        brand: "",
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // --- Validation ---
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      alert("Customer name is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      alert("Invalid email format.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.customerContactNumber)) {
      alert("Contact number must be 10 digits.");
      return false;
    }
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      alert("Discount must be between 0 and 100.");
      return false;
    }
    return true;
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const orderItems = items
      .filter((item) => item.productId && Number(item.quantity) > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

    if (orderItems.length === 0) {
      alert("Please add at least one valid product item.");
      setLoading(false);
      return;
    }

    const finalData = {
      ...formData,
      items: orderItems,
    };

    try {
      const response = await axios.post(API_BASE_URL, finalData);
      alert(`Order created successfully! Order ID: ${response.data.orderId}`);
      onBack();
    } catch (error) {
      console.error(
        "Submission Error:",
        error.response ? error.response.data : error.message
      );
      alert(
        "Failed to create order: " +
          (error.response?.data?.error || "Server error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-order-container">
      <div className="create-order-header">
        <h3>Create Order</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>Create Order</span>
        </div>
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-form-grid">
        {/* --- Buyer Info --- */}
        <div className="form-section buyer-info">
          <h4>Buyer Information</h4>
          <div className="form-group-double">
            <label>Name:</label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter Name"
              value={formData.customerName}
              onChange={handleFormChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="customerEmail"
              placeholder="Enter Email"
              value={formData.customerEmail}
              onChange={handleFormChange}
              required
            />
            <label>Contact Number:</label>
            <input
              type="number"
              name="customerContactNumber"
              placeholder="Enter Number"
              value={formData.customerContactNumber}
              onChange={handleFormChange}
              required
            />
            <label>Address:</label>
            <textarea
              name="customerAddress"
              placeholder="Enter Address"
              value={formData.customerAddress}
              onChange={handleFormChange}
              required
            />
          </div>
        </div>

        {/* --- Product Info --- */}
        <div className="form-section product-info">
          <h4>Product Information</h4>
          {items.map((item, index) => (
            <div key={item.id} className="product-item-row">
              <div className="form-group">
                <label>Product:</label>
                <select
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(item.id, "productId", e.target.value)
                  }
                  required
                >
                  <option value="">Select Product</option>
                  {dropdownData.products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group read-only-group">
                <label>Category:</label>
                <input type="text" value={item.category} readOnly disabled />
              </div>
              <div className="form-group read-only-group">
                <label>Brand:</label>
                <input type="text" value={item.brand} readOnly disabled />
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleItemChange(item.id, "quantity", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group read-only-group">
                <label>Amount (INR):</label>
                <input
                  type="text"
                  value={(item.amount * Number(item.quantity)).toFixed(2)}
                  readOnly
                  disabled
                />
              </div>

              <div className="item-action-btn">
                {index === items.length - 1 ? (
                  <button
                    type="button"
                    className="btn-add-more"
                    onClick={handleAddItem}
                  >
                    Add More
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Mobile summary */}
          <div className="order-summary-mobile">
            <p>Subtotal: ₹{totalSummary.subtotal.toFixed(2)}</p>
            <p>Total: ₹{totalSummary.total.toFixed(2)}</p>
          </div>
        </div>

        {/* --- Other Info --- */}
        <div className="form-section other-info">
          <h4>Other Information</h4>
          <div className="form-group-triple">
            <label>Discount(%):</label>
            <input
              type="number"
              name="discountPercentage"
              placeholder="Enter Discount"
              min="0"
              max="100"
              value={formData.discountPercentage}
              onChange={handleFormChange}
            />
            <label>Payment Mode:</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleFormChange}
            >
              <option value="Cash">Cash</option>
              <option value="Pending">Pending</option>
              <option value="Card">Card</option>
            </select>
            <label>Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Desktop summary */}
          <div className="order-summary-desktop">
            <p>
              Subtotal (INR): <span>₹{totalSummary.subtotal.toFixed(2)}</span>
            </p>
            <p>
              Discount ({formData.discountPercentage}%):{" "}
              <span>- ₹{totalSummary.discount.toFixed(2)}</span>
            </p>
            <p className="total-line">
              Total (INR): <span>₹{totalSummary.total.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Order"}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
