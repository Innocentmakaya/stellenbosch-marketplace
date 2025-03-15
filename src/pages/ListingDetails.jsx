import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { 
  FaWhatsapp, 
  FaPhone, 
  FaHeart, 
  FaFlag, 
  FaComment, 
  FaMoneyBillWave, 
  FaMapMarkerAlt, 
  FaUser,
  FaTag,
  FaStar,
  FaShieldAlt
} from "react-icons/fa";

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      let { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
      } else {
        setListing(data);
      }
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <div className="loading-container">Loading...</div>;
  }

  // Contact & Action Links
  const whatsappLink = `https://wa.me/${listing.contact_number}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${listing.title}`;
  const callLink = `tel:${listing.contact_number}`;

  return (
    <div className="listing-details-container">
      {/* Main Content Grid */}
      <div className="listing-grid">
        {/* Left Column - Image & Seller Info */}
        <div className="left-column">
          <div className="image-container">
            <img 
              src={listing.image_url} 
              alt={listing.title} 
              className="listing-image"
            />
            <div className="image-overlay">
              <span className="condition-tag">
                <FaStar /> Excellent Condition
              </span>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="seller-card">
            <div className="seller-header">
              <img 
                src="https://via.placeholder.com/50" 
                alt="Seller" 
                className="seller-avatar"
              />
              <div>
                <h3>Seller Profile</h3>
                <p className="seller-name">@{listing.user_id}</p>
              </div>
            </div>
            <div className="seller-meta">
              <div className="meta-item">
                <FaMapMarkerAlt />
                <span>Stellenbosch University</span>
              </div>
              <div className="meta-item">
                <FaShieldAlt />
                <span>Verified Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="right-column">
          {/* Listing Header */}
          <div className="listing-header">
            <h1>{listing.title}</h1>
            <div className="price-tag">
              <FaTag />
              <span>R{listing.price}</span>
            </div>
          </div>

          {/* Category & Stats */}
          <div className="category-section">
            <span className="category-badge">{listing.category}</span>
            <div className="stats">
              <span>🔥 1.2k views</span>
              <span>⏳ Listed 2 days ago</span>
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <h2>About This Item</h2>
            <p>{listing.description}</p>
          </div>

          {/* Features */}
          <div className="features-section">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <FaStar className="feature-icon" />
                <span>Like New</span>
              </div>
              <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <span>Authentic</span>
              </div>
              <div className="feature-item">
                <FaMapMarkerAlt className="feature-icon" />
                <span>Campus Pickup</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <a href={whatsappLink} className="action-button whatsapp">
              <FaWhatsapp /> Chat via WhatsApp
            </a>
            <a href={callLink} className="action-button call">
              <FaPhone /> Call Seller
            </a>
          </div>

          {/* Floating Actions */}
          <div className="floating-actions">
            <button className="floating-button favorite">
              <FaHeart />
            </button>
            <button className="floating-button report">
              <FaFlag />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;