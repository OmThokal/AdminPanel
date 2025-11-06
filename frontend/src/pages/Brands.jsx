import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Brands.css";

const API_BASE_URL = "http://localhost:8080/api/brands";

const CATEGORIES_API_URL = "http://localhost:8080/api/categories";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [currentBrand, setCurrentBrand] = useState({
    name: "",
    category: "",
    status: "Active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const getDefaultCategory = (cats) => (cats.length > 0 ? cats[0].name : "");

  const fetchBrands = useCallback(async () => {
    try {
      const response = await axios.get(API_BASE_URL);

      setBrands(
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(CATEGORIES_API_URL);

      const fetchedCategories = response.data;
      setCategories(fetchedCategories);

      setCurrentBrand((prevBrand) => ({
        ...prevBrand,
        category: prevBrand.category || getDefaultCategory(fetchedCategories),
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  /**
   * Handles opening the modal for editing an existing brand or adding a new one.
   * @param {object} [brand] - The brand object to edit, or undefined for a new brand.
   */
  const handleOpenModal = (brand) => {
    let brandToSet = brand || { name: "", category: "", status: "Active" };

    if (!brandToSet._id) {
      brandToSet.category = getDefaultCategory(categories);
    }

    setCurrentBrand(brandToSet);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);

    setCurrentBrand({
      name: "",
      category: getDefaultCategory(categories),
      status: "Active",
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentBrand._id) {
        await axios.put(`${API_BASE_URL}/${currentBrand._id}`, currentBrand);
      } else {
        await axios.post(API_BASE_URL, currentBrand);
      }
      fetchBrands();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting brand:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredBrands.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredBrands.length / entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const timeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return (
      date.toLocaleDateString("en-US", dateFormatOptions) +
      " " +
      date.toLocaleTimeString("en-US", timeFormatOptions)
    );
  };

  return (
    <div className="list-brands-container">
      <div className="list-brands-header">
        <h3>List Brands</h3>
        <div className="header-breadcrumbs">
          <span>Dashboard</span> &gt; <span>List Brands</span>
        </div>
      </div>

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
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-brand-btn" onClick={() => handleOpenModal()}>
            Add Brand
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="brands-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Name</th>
              <th>Category</th>
              <th>Created at</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((brand, index) => (
                <tr key={brand._id}>
                  <td>{indexOfFirstEntry + index + 1}</td>
                  <td>{brand.name}</td>
                  <td>{brand.category}</td>
                  <td>{formatDateTime(brand.createdAt)}</td>
                  <td>
                    <span
                      className={`status-badge ${brand.status.toLowerCase()}`}
                    >
                      {brand.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(brand)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(brand._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {indexOfFirstEntry + 1} to{" "}
          {Math.min(indexOfLastEntry, filteredBrands.length)} of{" "}
          {filteredBrands.length} entries
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-header-title">
                {currentBrand._id ? "Edit Brand" : "Add Brand"}
              </div>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="brand-category">Category:</label>
                <select
                  id="brand-category"
                  value={currentBrand.category}
                  onChange={(e) =>
                    setCurrentBrand({
                      ...currentBrand,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="brand-name">Name:</label>
                <input
                  type="text"
                  id="brand-name"
                  placeholder="Brand name"
                  value={currentBrand.name}
                  onChange={(e) =>
                    setCurrentBrand({ ...currentBrand, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand-status">Status:</label>
                <select
                  id="brand-status"
                  value={currentBrand.status}
                  onChange={(e) =>
                    setCurrentBrand({ ...currentBrand, status: e.target.value })
                  }
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">
                {currentBrand._id ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
