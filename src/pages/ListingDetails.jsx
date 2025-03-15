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
      <div className="listing-header">
        <img src={listing.image_url} alt={listing.title} className="listing-detail-image" />
        <div className="listing-header-info">
          <h2>{listing.title}</h2>
          <p className="listing-price">R{listing.price}</p>
          <p className="listing-category">{listing.category}</p>
        </div>
      </div>

      <div className="listing-description-section">
        <h3>Description</h3>
        <p className="listing-description">{listing.description}</p>
      </div>

      <div className="contact-actions">
        <h3>Contact Seller</h3>
        <div className="button-group">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={callLink} className="contact-button call">
            <FaPhone /> Call
          </a>
        </div>
      </div>

      <div className="additional-actions">
        <button className="action-button favorite">
          <FaHeart /> Save
        </button>
        <button className="action-button report">
          <FaFlag /> Report
        </button>
      </div>

      <div className="payment-options">
        <h3>Payment Options</h3>
        <div className="button-group">
          <button className="payment-button">
            <FaMoneyBillWave /> EFT
          </button>
          <button className="payment-button">
            <FaMoneyBillWave /> SnapScan
          </button>
        </div>
      </div>

      <div className="chat-section">
        <h3>Message Seller</h3>
        <button className="contact-button chat">
          <FaComment /> Start Chat
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;