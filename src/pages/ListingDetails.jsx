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
      {/* Image Section */}
      <div className="image-section">
        <img src={listing.image_url} alt={listing.title} className="listing-image" />
      </div>

      {/* Details Section */}
      <div className="details-section">
        <h1 className="listing-title">{listing.title}</h1>
        <p className="listing-price">R{listing.price}</p>
        <p className="listing-description">{listing.description}</p>
        <p className="listing-category"><span>Category:</span> {listing.category}</p>
      </div>

      {/* Contact & Actions */}
      <div className="actions-section">
        <h3>Contact Seller</h3>
        <div className="button-group">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="action-button whatsapp">
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={callLink} className="action-button call">
            <FaPhone /> Call
          </a>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="extra-actions">
        <button className="action-button favorite">
          <FaHeart /> Save
        </button>
        <button className="action-button report">
          <FaFlag /> Report
        </button>
      </div>

      {/* Payment Options */}
      <div className="payment-section">
        <h3>Payment Options</h3>
        <div className="button-group">
          <button className="action-button payment">
            <FaMoneyBillWave /> EFT
          </button>
          <button className="action-button payment">
            <FaMoneyBillWave /> SnapScan
          </button>
        </div>
      </div>

      {/* Chat Option */}
      <div className="chat-section">
        <button className="action-button chat">
          <FaComment /> Message Seller
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;