import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaHeart, FaFlag, FaMoneyBillWave, FaUser } from "react-icons/fa";

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

  const whatsappLink = `https://wa.me/${listing.contact_number}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${listing.title}`;
  const callLink = `tel:${listing.contact_number}`;

  return (
    <div className="listing-card">
      {/* Image */}
      <div className="image-section">
        <img src={listing.image_url} alt={listing.title} className="listing-image" />
      </div>

      {/* Details Section */}
      <div className="details-section">
        <h2 className="listing-title">{listing.title}</h2>

        <div className="listing-info">
          <p><strong>Price:</strong> R{listing.price}</p>
          <p><strong>Category:</strong> {listing.category}</p>
          <p><strong>Seller:</strong> <FaUser /> {listing.seller_name || "Unknown"}</p>
        </div>

        <p className="listing-description">{listing.description}</p>
      </div>

      {/* Action Buttons */}
      <div className="button-section">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
          <FaWhatsapp /> WhatsApp
        </a>
        <a href={callLink} className="contact-button call">
          <FaPhone /> Call
        </a>
      </div>

      {/* Extra Actions */}
      <div className="extra-actions">
        <button className="action-button favorite"><FaHeart /> Save</button>
        <button className="action-button report"><FaFlag /> Report</button>
      </div>
    </div>
  );
};

export default ListingDetails;
