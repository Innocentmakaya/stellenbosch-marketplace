import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaComment, FaTag, FaInfoCircle, FaSearch, FaMoneyBillWave, FaHandshake, FaCalendarAlt, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PayFastTest from "./PayFastTest";  // Import the PayFastTest component

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarItems, setSimilarItems] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'payment'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      let { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
      } else {
        setListing(data);
        console.log("Listing data:", data);
        console.log("Main image URL:", data.image_url);
        console.log("Images URLs (raw):", data.images_urls);
        
        // Process images
        let imagesArray = [];
        
        // Always add the main image first if it exists
        if (data.image_url) {
          imagesArray.push(data.image_url);
        }
        
        // Check if we have multiple images stored as JSON
        if (data.images_urls) {
          try {
            // Try parsing the JSON string
            let parsedImages;
            
            // Handle string or already parsed object
            if (typeof data.images_urls === 'string') {
              console.log("Parsing images_urls as string:", data.images_urls);
              parsedImages = JSON.parse(data.images_urls);
            } else {
              console.log("images_urls is already an object:", data.images_urls);
              parsedImages = data.images_urls;
            }
            
            console.log("Parsed images:", parsedImages);
            
            // Make sure parsedImages is an array
            if (Array.isArray(parsedImages)) {
              // For debugging
              console.log("Successfully parsed images_urls into array with length:", parsedImages.length);
              
              // Check if main image is already in the array to avoid duplicates
              const mainImageIncluded = imagesArray.length > 0 && parsedImages.includes(imagesArray[0]);
              console.log("Main image already included in array:", mainImageIncluded);
              
              if (mainImageIncluded) {
                // If main image is included in the array, use the whole array (it already has proper order)
                imagesArray = [...parsedImages];
              } else {
                // Otherwise filter out any potential duplicates with the main image
                // and add the additional images after the main image
                const additionalImages = parsedImages.filter(
                  (img, index, self) => 
                    (imagesArray.length === 0 || img !== imagesArray[0]) && // Not the main image 
                    self.indexOf(img) === index // Remove duplicates
                );
                
                console.log("Additional images after filtering:", additionalImages);
                imagesArray = [...imagesArray, ...additionalImages];
              }
            }
          } catch (e) {
            console.error("Error parsing images JSON:", e);
            // If there's an error parsing, just use the main image
          }
        }
        
        // If we still have no images, use a placeholder
        if (imagesArray.length === 0) {
          imagesArray.push('https://via.placeholder.com/600x400?text=No+Image+Available');
        }
        
        console.log("Final images array:", imagesArray);
        setAllImages(imagesArray);
        
        // Fetch similar items after getting the main listing
        if (data) {
          await fetchSimilarItems(data.category, data.id);
        }
      }
      setLoading(false);
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, []);

  // Function to fetch similar items in the same category
  const fetchSimilarItems = async (category, currentId) => {
    setLoadingSimilar(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("category", category)
      .neq("id", currentId) // Exclude current listing
      .limit(4) // Limit to 4 similar items
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching similar items:", error);
    } else {
      setSimilarItems(data);
    }
    setLoadingSimilar(false);
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Check if listing is new (less than 3 days old)
  const isNewListing = (dateString) => {
    if (!dateString) return false;
    const listingDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = currentDate - listingDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };
  
  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };
  
  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Function to handle starting a chat
  const handleStartChat = () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/login', { state: { from: `/listing/${id}` } });
      return;
    }
    
    // Check if user is trying to chat with themselves
    if (user.id === listing.user_id) {
      alert("You cannot chat with yourself about your own listing");
      return;
    }

    // For now, just navigate to the chat page
    // In the future, this would create a new chat if one doesn't exist
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading listing details...</p>
      </div>
    );
  }

  if (!listing) {
    return <div className="error-message">This listing could not be found.</div>;
  }

  // Contact & Action Links
  const whatsappLink = `https://wa.me/${listing.contact_number}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${listing.title}`;
  const callLink = `tel:${listing.contact_number}`;

  return (
    <div className="listing-details-container">
      {/* Top Grid Layout with Image and Details side by side */}
      <div className="listing-top-grid">
        {/* Left Column - Image Gallery */}
        <div className="listing-image-column">
          <div className={`section image-section ${allImages.length > 1 ? 'has-multiple-images' : ''}`}>
            {/* Main Image with Navigation Arrows */}
            <div className="image-gallery-main">
              <img 
                src={allImages[currentImageIndex]} 
                alt={listing.title} 
                className="listing-detail-image" 
              />
              
              {/* Always show navigation if we have multiple images */}
              {allImages.length > 1 && (
                <>
                  <button 
                    className="gallery-nav prev" 
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className="gallery-nav next" 
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="gallery-indicators">
                    {allImages.map((_, index) => (
                      <button 
                        key={index} 
                        className={`gallery-indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => selectImage(index)}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <span className="category-badge">{listing.category}</span>
            </div>
            
            {/* Thumbnails if we have multiple images */}
            {allImages.length > 1 && (
              <div className="image-gallery-thumbnails">
                {allImages.map((imgUrl, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => selectImage(index)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="thumbnail-image" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Details */}
        <div className="listing-details-column">
          <div className="section details-section">
            <div className="details-header">
              <h2 className="listing-title">{listing.title}</h2>
              <span className="price-tag">R{listing.price}</span>
            </div>
            
            <div className="detail-badges">
              <span className="detail-badge"><FaTag /> {listing.category}</span>
              <span className="detail-badge"><FaInfoCircle /> Student Market</span>
            </div>
            
            <div className="description-container">
              <h4 className="description-header">Description</h4>
              <p className="description">{listing.description}</p>
            </div>

            {/* Tabbed Interface for Contact and Payment */}
            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  <FaHandshake /> Contact Seller
                </button>
                <button 
                  className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payment')}
                >
                  <FaMoneyBillWave /> Payment
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'contact' ? (
                  <div className="contact-options">
                    <div className="contact-buttons">
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
                        <FaWhatsapp /> <span>WhatsApp</span>
                      </a>
                      <a href={callLink} className="contact-button call">
                        <FaPhone /> <span>Call</span>
                      </a>
                      <button className="contact-button chat" onClick={handleStartChat}>
                        <FaComment /> <span>In-App Chat</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="payment-options-container">
                    <div className="payment-options">
                      <label className="payment-label selected" htmlFor="card-payment">
                        <input 
                          type="radio" 
                          id="card-payment" 
                          name="payment" 
                          value="card" 
                          checked={true}
                          readOnly
                          required 
                        /> 
                        <span className="payment-text">Credit/Debit Card</span>
                      </label>
                    </div>
                    <div className="payment-button-container">
                      <PayFastTest amount={listing.price} itemName={listing.title} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Items Section */}
      <div className="section similar-items-section">
        <h3>Similar Items</h3>
        
        {loadingSimilar ? (
          <div className="similar-items-loading">
            <div className="mini-spinner"></div>
            <p>Loading similar items...</p>
          </div>
        ) : similarItems.length > 0 ? (
          <div className="similar-items-grid">
            {similarItems.map((item, index) => (
              <Link to={`/listing/${item.id}`} key={item.id} className="similar-item-card" style={{"--card-index": index}}>
                {isNewListing(item.created_at) && <div className="new-badge">NEW</div>}
                <div className="similar-item-image-container">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={item.title} 
                    className="similar-item-image" 
                  />
                </div>
                <div className="similar-item-details">
                  <span className="similar-item-category">{item.category}</span>
                  <h4 className="similar-item-title">{item.title}</h4>
                  <div className="similar-item-price">R{Number(item.price).toFixed(2)}</div>
                  <p className="similar-item-description">{item.description}</p>
                  
                  <div className="similar-item-meta">
                    <div className="similar-item-date">
                      <FaCalendarAlt /> {formatDate(item.created_at)}
                    </div>
                    <div className="similar-item-view">
                      View Details <FaArrowRight className="view-details-arrow" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-similar-items">
            <FaSearch className="no-results-icon" />
            <p>No similar items found in this category.</p>
            <Link to="/" className="browse-all-button">Browse All Items</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetails;