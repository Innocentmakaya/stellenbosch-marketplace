import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaHeart, FaFlag, FaComment, FaMoneyBillWave } from "react-icons/fa";

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
      {/* Hero Section */}
      <div className="hero-section">
        <img src={listing.image_url} alt={listing.title} className="hero-image" />
        <div className="hero-overlay">
          <h1>{listing.title}</h1>
          <p className="hero-price">R{listing.price}</p>
          <p className="hero-category">{listing.category}</p>
        </div>
      </div>

      {/* Description Section */}
      <div className="description-section">
        <h2>About This Listing</h2>
        <p className="description-text">{listing.description}</p>
      </div>

      {/* Contact & Actions Section */}
      <div className="actions-section">
        <h2>Get in Touch</h2>
        <div className="action-buttons">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="action-button whatsapp">
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={callLink} className="action-button call">
            <FaPhone /> Call
          </a>
          <button className="action-button chat">
            <FaComment /> Chat
          </button>
        </div>
      </div>

      {/* Payment Options */}
      <div className="payment-section">
        <h2>Payment Options</h2>
        <div className="payment-buttons">
          <button className="payment-button eft">
            <FaMoneyBillWave /> Pay via EFT
          </button>
          <button className="payment-button snapscan">
            <FaMoneyBillWave /> Pay via SnapScan
          </button>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="extra-actions">
        <button className="extra-button favorite">
          <FaHeart /> Save for Later
        </button>
        <button className="extra-button report">
          <FaFlag /> Report Listing
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;