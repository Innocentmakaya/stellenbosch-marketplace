import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../supabaseClient";
import "./Listings.css"; // Reuse the same CSS file
import { FaEdit, FaTrash } from "react-icons/fa"; // Import icons for buttons

function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

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

  // Handle delete listing
  const handleDelete = async (id) => {
    await supabase.from("listings").delete().eq("id", id);
    setListings(listings.filter((l) => l.id !== id));
    setFilteredListings(filteredListings.filter((l) => l.id !== id));
  };

  if (!user) return null;

  return (
    <div className="listings-container">
      <h1 className="page-heading">My Listings</h1>

      {/* Category Filter */}
      <div className="controls-bar">
        <div className="filter-container">
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Furniture">Furniture</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="listings-flex">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <div key={item.id} className="listing-card">
                <img src={item.image_url} alt={item.title} className="listing-image" />
                <div className="listing-details">
                  <h3>Item: {item.title}</h3>
                  <p>Description: {item.description}</p>
                  <span className="price">Price: R{item.price}</span>
                  <span className="category">Category: {item.category}</span>
                  <span className="date-listed">Date Listed: {new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="listing-actions">
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/edit-listing/${item.id}`)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-listings">No listings in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MyListings;