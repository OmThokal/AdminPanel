import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Products.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/products";
const CATEGORIES_API_URL = "http://localhost:8080/api/categories";
const BRANDS_API_URL = "http://localhost:8080/api/brands";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    amount: "",
    productImage: null,
    productImagePath: "",
    status: "Active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // --- Data Fetching ---

  const fetchDropdownData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get(CATEGORIES_API_URL),
        axios.get(BRANDS_API_URL),
      ]);

      setCategories(categoriesRes.data.map((c) => c.name));
      setBrands(brandsRes.data.map((b) => b.name));

      if (isAddMode) {
        setCurrentProduct((prev) => ({
          ...prev,
          category:
            categoriesRes.data.length > 0 ? categoriesRes.data[0].name : "",
          brand: brandsRes.data.length > 0 ? brandsRes.data[0].name : "",
        }));
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }, [isAddMode]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setProducts(
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (showModal) {
      fetchDropdownData();
    }
  }, [showModal, fetchDropdownData]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setIsAddMode(false);
      setCurrentProduct({
        ...product,
        productImage: null,
        productImagePath: product.productImage || "",
      });
    } else {
      setIsAddMode(true);
      setCurrentProduct({
        name: "",
        category: categories.length > 0 ? categories[0] : "",
        brand: brands.length > 0 ? brands[0] : "",
        description: "",
        amount: "",
        productImage: null,
        productImagePath: "",
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);

    setCurrentProduct({
      name: "",
      category: categories.length > 0 ? categories[0] : "",
      brand: brands.length > 0 ? brands[0] : "",
      description: "",
      amount: "",
      productImage: null,
      productImagePath: "",
      status: "Active",
    });
  };

  const handleFileChange = (e) => {
    setCurrentProduct({ ...currentProduct, productImage: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", currentProduct.name);
    formData.append("category", currentProduct.category);
    formData.append("brand", currentProduct.brand);
    formData.append("description", currentProduct.description);
    formData.append("amount", currentProduct.amount);
    formData.append("status", currentProduct.status);

    if (currentProduct.productImage) {
      formData.append("image", currentProduct.productImage);
    }

    if (!isAddMode) {
      formData.append("currentImagePath", currentProduct.productImagePath);
    }

    try {
      if (currentProduct._id) {
        await axios.put(`${API_BASE_URL}/${currentProduct._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(API_BASE_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredProducts.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);

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

  const handleNavigateToList = () => {
    setShowModal(false);
  };

  if (showModal) {
    return (
      <div className="add-product-container">
        <div className="add-product-header">
          <h3>Add Product</h3>
          <div className="header-breadcrumbs">
            <span>Dashboard</span> &gt; <span>Add Product</span>
          </div>
          <button className="back-btn" onClick={handleNavigateToList}>
            Back
          </button>
        </div>

        <div className="product-form-card">
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="product-category">Category:</label>
              <select
                id="product-category"
                name="category"
                value={currentProduct.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product-brand">Brand:</label>
              <select
                id="product-brand"
                name="brand"
                value={currentProduct.brand}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select Brand
                </option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product-name">Name:</label>
              <input
                type="text"
                id="product-name"
                name="name"
                placeholder="Enter Name"
                value={currentProduct.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-description">Description:</label>
              <textarea
                id="product-description"
                name="description"
                placeholder="Enter Description"
                value={currentProduct.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-image">Product Image:</label>
              <input
                type="file"
                id="product-image"
                name="image"
                onChange={handleFileChange}
                required={isAddMode && !currentProduct.productImagePath}
              />
              {currentProduct.productImagePath &&
                !currentProduct.productImage && (
                  <p className="image-info">
                    Current Image:{" "}
                    <a
                      href={`http://localhost:8080${currentProduct.productImagePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Image
                    </a>
                  </p>
                )}
            </div>

            <div className="form-group">
              <label htmlFor="product-amount">Amount (INR):</label>
              <input
                type="number"
                id="product-amount"
                name="amount"
                placeholder="Enter Amount"
                value={currentProduct.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-status">Status:</label>
              <select
                id="product-status"
                name="status"
                value={currentProduct.status}
                onChange={handleInputChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              {currentProduct._id ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="list-products-container">
      <div className="list-products-header">
        <h3>List Products</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>List Products</span>
        </div>
      </div>

      <div className="listing-products-title">Listing Products</div>

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
          <button className="add-product-btn" onClick={() => handleOpenModal()}>
            Add Product
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Created at</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((product, index) => (
                <tr key={product._id}>
                  <td>{indexOfFirstEntry + index + 1}</td>
                  <td>
                    {product.productImage ? (
                      <img
                        src={`http://localhost:8080${product.productImage}`}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    ) : (
                      <span className="no-image-placeholder">No Image</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{formatDateTime(product.createdAt)}</td>
                  <td>
                    <span
                      className={`status-badge ${product.status.toLowerCase()}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(product._id)}
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
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {indexOfFirstEntry + 1} to{" "}
          {Math.min(indexOfLastEntry, filteredProducts.length)} of{" "}
          {filteredProducts.length} entries
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

export default Products;
