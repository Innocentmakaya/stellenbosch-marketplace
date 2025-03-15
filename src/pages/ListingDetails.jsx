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
      <img src={listing.image_url} alt={listing.title} className="listing-detail-image" />

      <div className="listing-info">
        <h2 className="listing-item"><strong>Item:</strong> {listing.title}</h2>
        <p><strong>Description:</strong> {listing.description}</p>
        <p className="listing-price"><strong>Price:</strong> R{listing.price}</p>
        <p className="listing-category"><strong>Category:</strong> {listing.category}</p>
      </div>

      {/* Contact & Actions */}
      <div className="actions-container">
        <h3>Contact Seller</h3>
        <div className="button-group">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
            <FaWhatsapp /> WhatsApp Seller
          </a>
          <a href={callLink} className="contact-button call">
            <FaPhone /> Call Seller
          </a>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="extra-actions">
        <button className="action-button favorite"><FaHeart /> Save for Later</button>
        <button className="action-button report"><FaFlag /> Report Listing</button>
      </div>

      {/* Payment & Chat Options */}
      <div className="payment-section">
        <h3>Payment Options</h3>
        <div className="button-group">
          <button className="payment-button"><FaMoneyBillWave /> Pay via EFT</button>
          <button className="payment-button"><FaMoneyBillWave /> Pay via SnapScan</button>
        </div>
      </div>

      <div className="chat-section">
        <h3>Message Seller</h3>
        <button className="contact-button chat"><FaComment /> Start Chat</button>
      </div>
    </div>
  );
};

export default ListingDetails;