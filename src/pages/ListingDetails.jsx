import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaComment, FaMoneyBillWave } from "react-icons/fa";

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
      {/* Item Image */}
      <img src={listing.image_url} alt={listing.title} className="listing-detail-image" />

      {/* Item Details */}
      <div className="section">
        <h2 className="listing-item"><strong>Item:</strong> {listing.title}</h2>
        <p><strong>Description:</strong> {listing.description}</p>
        <p className="listing-price"><strong>Price:</strong> R{listing.price}</p>
        <p className="listing-category"><strong>Category:</strong> {listing.category}</p>
      </div>

      {/* Contact Seller Section */}
      <div className="section contact-section">
        <h3>Contact Seller</h3>
        <div className="button-group">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={callLink} className="contact-button call">
            <FaPhone /> Call
          </a>
          <button className="contact-button chat">
            <FaComment /> In-App Chat
          </button>
        </div>
      </div>

      {/* Payment Section */}
      <div className="section payment-section">
        <h3>Payment Options</h3>
        <div className="payment-options">
          <label className="payment-label">
            <input type="radio" name="payment" value="card" required /> Credit/Debit Card
          </label>
          <label className="payment-label">
            <input type="radio" name="payment" value="eft" /> EFT
          </label>
          <label className="payment-label">
            <input type="radio" name="payment" value="snapscan" /> SnapScan
          </label>
        </div>
        <button className="proceed-payment-button">
          <FaMoneyBillWave /> Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;
