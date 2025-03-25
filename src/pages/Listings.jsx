import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Listings.css";
import { FaArrowUp, FaTimesCircle, FaSearch, FaFilter, FaSort, FaPlus, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

function Listings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetching listings and user data
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login");
      } else {
        setUser(data.user);
      }
    };

    checkUser();

    const fetchListings = async () => {
      setIsLoading(true);
      let { data, error } = await supabase.from("listings").select("*");
      if (error) {
        console.error("Error fetching listings:", error);
        setIsLoading(false);
        return;
      }
      
      const sortedData = sortListings("newest", data);
      setListings(sortedData);
      setFilteredListings(sortedData);
      setIsLoading(false);
    };

    fetchListings();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setListings([]);
        navigate("/login");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  // Filter listings based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search query is empty, only apply category filter
      if (selectedCategory === 'all') {
        setFilteredListings(sortListings(sortOption, listings));
      } else {
        const filtered = listings.filter(item => item.category === selectedCategory);
        setFilteredListings(sortListings(sortOption, filtered));
      }
    } else {
      // Apply both search and category filters
      const query = searchQuery.toLowerCase().trim();
      let filtered = listings.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
      
      // Apply category filter if not 'all'
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
      
      setFilteredListings(sortListings(sortOption, filtered));
    }
  }, [searchQuery, selectedCategory, listings, sortOption]);

  // 🔄 Sorting function
  const sortListings = (option, data) => {
    let sortedListings = [...data];

    if (option === "lowToHigh") {
      sortedListings.sort((a, b) => a.price - b.price);
    } else if (option === "highToLow") {
      sortedListings.sort((a, b) => b.price - a.price);
    } else if (option === "newest") {
      sortedListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (option === "oldest") {
      sortedListings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return sortedListings;
  };

  // 🏷 Handle sorting change
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    setFilteredListings(sortListings(option, filteredListings));
  };

  // 🏷 Handle category filter change
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  };

  // 🔍 Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 🗑 Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortOption("newest");
    setFilteredListings([...listings]);
  };

  // Format the date in a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a listing is new (less than 2 days old)
  const isNewListing = (dateString) => {
    return new Date(dateString) > new Date(Date.now() - 86400000 * 2);
  };

  if (!user) return null;

  return (
    <div className="listings-container">
      <h1 className="page-heading">Browse Listings</h1>

      {/* 🔍 Search Bar, Filters, and Sorting */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-box"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="clear-filters-button" onClick={() => setSearchQuery("")}>
              <FaTimesCircle />
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="sort-container">
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter badges and clear all button */}
      {(searchQuery || selectedCategory !== "all" || sortOption !== "newest") && (
        <div className="active-filters">
          {searchQuery && (
            <span className="filter-badge">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")}>×</button>
            </span>
          )}
          
          {selectedCategory !== "all" && (
            <span className="filter-badge">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("all")}>×</button>
            </span>
          )}
          
          {sortOption !== "newest" && (
            <span className="filter-badge">
              Sort: {sortOption === "lowToHigh" ? "Price (Low to High)" : 
                     sortOption === "highToLow" ? "Price (High to Low)" : 
                     "Oldest First"}
              <button onClick={() => setSortOption("newest")}>×</button>
            </span>
          )}
          
          <button className="clear-all-filters" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Create new listing button */}
      <div className="create-listing-container">
        <Link to="/create-listing" className="create-listing-button">
          <FaPlus /> Create New Listing
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        // No results
        <div className="no-results">
          <h3>No listings found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button className="btn btn-primary" onClick={clearFilters}>Reset All Filters</button>
        </div>
      ) : (
        // Listings grid
        <div className="listings-grid">
          {filteredListings.map((item, index) => (
            <div 
              key={item.id}
              className="listing-card"
              style={{"--card-index": index % 10 + 1}}
            >
              {isNewListing(item.created_at) && <div className="new-badge">NEW</div>}
              
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
                  
                  <Link to={`/listing/${item.id}`} className="view-details">
                    View Details <FaArrowRight className="view-details-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back to Top Button */}
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <FaArrowUp />
      </button>
    </div>
  );
}

export default Listings;