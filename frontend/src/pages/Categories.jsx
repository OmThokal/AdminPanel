import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Categories.css";

const API_BASE_URL = "http://localhost:8080/api/categories";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    status: "Active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_BASE_URL);
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setCategories(sortedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Modal Handlers
  const handleOpenModal = (category = { name: "", status: "Active" }) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory({ name: "", status: "Active" });
  };

  // Create or Update Category
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory._id) {
        await axios.put(`${API_BASE_URL}/${currentCategory._id}`, currentCategory);
      } else {
        await axios.post(API_BASE_URL, currentCategory);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  // Filtered + Paginated Data
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredCategories.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })} ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  };

  return (
    <div className="list-categories-container">
      {/* Header */}
      <div className="list-categories-header">
        <h3>List Categories</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>List Categories</span>
        </div>
      </div>

      {/* Table Controls */}
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
              placeholder="Search by name..."
            />
          </div>
          <button className="add-category-btn" onClick={() => handleOpenModal()}>
            + Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-text">Loading categories...</p>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Name</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((category, index) => (
                  <tr key={category._id}>
                    <td>{indexOfFirstEntry + index + 1}</td>
                    <td>{category.name}</td>
                    <td>{formatDateTime(category.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${category.status.toLowerCase()}`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="table-footer">
        <div className="pagination-info">
          Showing {indexOfFirstEntry + 1} to{" "}
          {Math.min(indexOfLastEntry, filteredCategories.length)} of{" "}
          {filteredCategories.length} entries
        </div>
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-number">{currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h4>{currentCategory._id ? "Edit Category" : "Add Category"}</h4>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="category-name">Name:</label>
                <input
                  type="text"
                  id="category-name"
                  value={currentCategory.name}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-status">Status:</label>
                <select
                  id="category-status"
                  value={currentCategory.status}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      status: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                {currentCategory._id ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
