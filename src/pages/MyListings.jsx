import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";
import "./Listings.css"; // Reuse the same CSS file
import { FaEdit, FaTrash, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa"; // Import icons for buttons

function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserListings = async () => {
      setIsLoading(true);
      let { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        setListings(data);
        setFilteredListings(data);
      }
      setIsLoading(false);
    };

    fetchUserListings();
  }, [user, navigate]);

  // Handle category change
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredListings(listings);
    } else {
      setFilteredListings(listings.filter((item) => item.category === category));
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setShowConfirmation(true);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirmation = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  // Handle delete listing
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    const id = itemToDelete.id;
    await supabase.from("listings").delete().eq("id", id);
    setListings(listings.filter((l) => l.id !== id));
    setFilteredListings(filteredListings.filter((l) => l.id !== id));
    
    // Close the confirmation dialog
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  // Format the date in a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) return null;

  return (
    <div className="listings-container">
      <h1 className="page-heading">My Listings</h1>

      {/* Category Filter */}
      <div className="controls-bar">
        <div className="filter-container">
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Furniture">Furniture</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Create new listing button */}
      <div className="create-listing-container">
        <Link to="/sell" className="create-listing-button">
          <span>+ Create New Listing</span>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete <strong>"{itemToDelete?.title}"</strong>?</p>
            <p className="confirmation-warning">This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <button className="btn-cancel" onClick={closeDeleteConfirmation}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="no-results">
          <h3>No listings found</h3>
          <p>You haven't created any listings in this category yet.</p>
          <Link to="/sell" className="btn btn-primary">Create Your First Listing</Link>
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map((item, index) => (
            <div 
              key={item.id}
              className="listing-card"
              style={{"--card-index": index % 10 + 1}}
            >
              <div className="item-image-container">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={item.title}
                  className="item-image"
                />
              </div>
              
              <div className="listing-details">
                <span className="item-category">{item.category}</span>
                <h3 className="item-title">{item.title}</h3>
                <div className="item-price">R{item.price.toFixed(2)}</div>
                <p className="item-description">{item.description}</p>
                
                <div className="item-meta">
                  <div className="item-date">
                    <FaCalendarAlt /> {formatDate(item.created_at)}
                  </div>
                </div>
                
                <div className="listing-actions">
                  <button
                    className="edit-button"
                    onClick={() => navigate(`/edit-listing/${item.id}`)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => openDeleteConfirmation(item)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListings;