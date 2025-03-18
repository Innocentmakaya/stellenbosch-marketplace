import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaComment, FaMoneyBillWave } from "react-icons/fa";

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("");

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
      {/* Item Details */}
      <img src={listing.image_url} alt={listing.title} className="listing-detail-image" />
      <div className="listing-info">
        <h2 className="listing-item"><strong>Item:</strong> {listing.title}</h2>
        <p><strong>Description:</strong> {listing.description}</p>
        <p className="listing-price"><strong>Price:</strong> R{listing.price}</p>
        <p className="listing-category"><strong>Category:</strong> {listing.category}</p>
      </div>

      {/* Contact Seller Section */}
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

      {/* Payment Options Section */}
      <div className="payment-section">
        <h3>Payment Options</h3>
        <div className="payment-options">
          <label>
            <input
              type="radio"
              name="payment"
              value="EFT"
              checked={selectedPayment === "EFT"}
              onChange={() => setSelectedPayment("EFT")}
            />
            Pay via EFT
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              value="SnapScan"
              checked={selectedPayment === "SnapScan"}
              onChange={() => setSelectedPayment("SnapScan")}
            />
            Pay via SnapScan
          </label>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
