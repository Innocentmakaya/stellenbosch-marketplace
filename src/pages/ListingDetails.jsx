import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaHeart, FaFlag, FaComment, FaMoneyBillWave, FaMapMarkerAlt, FaUser } from "react-icons/fa";

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
    return <p className="loading-text">Loading...</p>;
  }

  // Contact & Action Links
  const whatsappLink = `https://wa.me/${listing.contact_number}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${listing.title}`;
  const callLink = `tel:${listing.contact_number}`;

  return (
    <div className="listing-details-container">
      {/* Listing Image */}
      <div className="listing-image-container">
        <img src={listing.image_url} alt={listing.title} className="listing-detail-image" />
      </div>

      {/* Listing Info */}
      <div className="listing-info">
        <h2>{listing.title}</h2>
        <p className="listing-price">R{listing.price}</p>
        <p className="listing-description">{listing.description}</p>

        {/* Seller & Location Info */}
        <div className="seller-info">
          <div className="info-item">
            <FaUser className="info-icon" />
            <span>Seller: {listing.user_id}</span>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <span>Location: Stellenbosch</span>
          </div>
        </div>

        {/* Category & Condition */}
        <div className="listing-meta">
          <span className="category-badge">{listing.category}</span>
          <span className="condition-badge">Good Condition</span>
        </div>
      </div>

      {/* Contact & Actions */}
      <div className="actions-container">
        <h3>Contact Seller</h3>
        <div className="button-group">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={callLink} className="contact-button call">
            <FaPhone /> Call
          </a>
          <button className="contact-button chat">
            <FaComment /> Chat
          </button>
        </div>
      </div>

      {/* Payment Options */}
      <div className="payment-section">
        <h3>Payment Options</h3>
        <div className="button-group">
          <button className="payment-button">
            <FaMoneyBillWave /> Pay via EFT
          </button>
          <button className="payment-button">
            <FaMoneyBillWave /> Pay via SnapScan
          </button>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="extra-actions">
        <button className="action-button favorite">
          <FaHeart /> Save for Later
        </button>
        <button className="action-button report">
          <FaFlag /> Report Listing
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;