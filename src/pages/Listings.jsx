import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Listings.css";
import { FaArrowUp, FaTimesCircle } from "react-icons/fa";

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
      } else {
        const sortedData = sortListings("newest", data);
        setListings(sortedData);
        setFilteredListings(sortedData);
      }
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
    if (category === "all") {
      setFilteredListings([...listings]);
    } else {
      const filtered = listings.filter((item) => item.category === category);
      setFilteredListings(filtered);
    }
  };

  // 🗑 Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortOption("newest");
    setFilteredListings([...listings]);
  };

  if (!user) return null;

  return (
    <div className="listings-container">
      <h1 className="page-heading">Browse Listings</h1>

      {/* 🔍 Search Bar, Filters, and Sorting */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-box"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-filters-button" onClick={clearFilters}>
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
          </select>
        </div>
        <div className="sort-container">
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 🏷 Listings Display */}
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="listings-flex">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <div key={item.id} className="listing-card" onClick={() => navigate(`/listing/${item.id}`)}>
                <img src={item.image_url} alt={item.title} className="listing-image" />
                <div className="listing-details">
                  <h3>Item: {item.title}</h3>
                  <p>Description: {item.description}</p>
                  <span className="price">Price: R{item.price}</span>
                  <span className="category">Category: {item.category}</span>
                  <span className="date-listed">Date Listed: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-listings">No listings match your search.</p>
          )}
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