import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./ListingDetails.css";
import { FaWhatsapp, FaPhone, FaComment, FaTag, FaInfoCircle, FaSearch, FaMoneyBillWave, FaHandshake, FaCalendarAlt, FaArrowRight, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";
import PayFastTest from "./PayFastTest";  // Import the PayFastTest component
import LocationShare from "../components/LocationShare";

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
  const [showLocationShare, setShowLocationShare] = useState(false);

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
  const handleStartChat = async () => {
    // Check if user is logged in
    if (!user) {
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    
    // // Check if user is trying to chat with themselves (commented out for testing)
    // if (user.id === listing.user_id) {
    //   alert("You cannot chat with yourself about your own listing");
    //   return;
    // }

    try {
      console.log("Starting chat process...");
      console.log("Current user:", user.id);
      console.log("Listing seller:", listing.user_id);
      console.log("Listing ID:", listing.id);
      
      // Check if a chat already exists between these users for this listing
      const { data: existingChats, error: searchError } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', listing.user_id);
      
      if (searchError) {
        console.error("Error checking for existing chat:", searchError);
        throw searchError;
      }
      
      console.log("Existing chats:", existingChats);
      
      let chatId;
      
      if (existingChats && existingChats.length > 0) {
        // Chat exists, use the existing chat
        chatId = existingChats[0].id;
        console.log("Using existing chat:", chatId);
      } else {
        // Create a new chat
        console.log("Creating new chat...");
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            listing_id: listing.id,
            buyer_id: user.id,
            seller_id: listing.user_id,
            last_message: `Chat about: ${listing.title}`,
            last_message_time: new Date().toISOString()
          })
          .select();
          
        if (createError) {
          console.error("Error creating new chat:", createError);
          throw createError;
        }
        
        console.log("New chat created:", newChat);
        chatId = newChat[0].id;
      }
      
      // Create initial message
      console.log("Creating initial message...");
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message: `Hi! I'm interested in ${listing.title}`,
          read: false
        });
        
      if (messageError) {
        console.error("Error creating initial message:", messageError);
        // Continue anyway - we don't want to block navigation just because the message failed
      }
      
      // Navigate to the chat page with the chat ID
      console.log("Navigating to chat:", chatId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again later.");
    }
  };

  // Function to handle sending a location in a new chat
  const handleShareLocation = async (locationData) => {
    // First check if user is logged in
    if (!user) {
      navigate('/login', { state: { from: `/listing/${id}` } });
      return;
    }
    
    try {
      // Check if a chat already exists
      const { data: existingChats, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('listing_id', id)
        .eq('buyer_id', user.id)
        .limit(1);
      
      if (chatError) {
        console.error("Error checking existing chats:", chatError);
        alert("Failed to check for existing conversations. Please try again.");
        return;
      }
      
      let chatId;
      
      // If chat exists, use it
      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        // Create a new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            listing_id: id,
            buyer_id: user.id,
            seller_id: listing.user_id,
            last_message: "Started a conversation",
            last_message_time: new Date().toISOString()
          })
          .select('id');
        
        if (createError) {
          console.error("Error creating chat:", createError);
          alert("Failed to create conversation. Please try again.");
          return;
        }
        
        chatId = newChat[0].id;
      }
      
      // Format location message
      const locationMessage = JSON.stringify({
        type: 'location',
        data: locationData
      });
      
      // Send the location as a message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message: locationMessage,
          read: false
        });
      
      if (messageError) {
        console.error("Error sending location message:", messageError);
        // We can still navigate to the chat even if the message failed
      }
      
      // Update last message in chat
      await supabase
        .from('chats')
        .update({
          last_message: "Shared a location",
          last_message_time: new Date().toISOString()
        })
        .eq('id', chatId);
      
      // Navigate to the chat
      navigate(`/chat/${chatId}`);
      
    } catch (error) {
      console.error("Error sharing location:", error);
      alert("Failed to share location. Please try again.");
    }
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
                  <FaHandshake /> Connect
                </button>
                <button 
                  className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payment')}
                >
                  <FaMoneyBillWave /> Exchange
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'contact' ? (
                  <div className="contact-options">
                    <div className="contact-message">
                      <p className="contact-tagline">Chat directly with the seller or use other contact methods</p>
                    </div>
                    <div className="contact-buttons">
                      <button className="contact-button chat primary-option" onClick={handleStartChat}>
                        <FaComment className="contact-icon" /> 
                        <div className="contact-button-content">
                          <span className="contact-button-title">In-App Chat</span>
                          <span className="contact-button-desc">Chat securely within the app</span>
                        </div>
                      </button>
                      
                      <div className="alternative-contacts">
                        <p className="alternative-heading">Alternative Contact Methods</p>
                        <div className="alternative-buttons">
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">
                            <FaWhatsapp /> <span>WhatsApp</span>
                          </a>
                          <a href={callLink} className="contact-button call">
                            <FaPhone /> <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="payment-options-container">
                    <div className="payment-header">
                      <h3 className="payment-title">
                        <span className="emphasis">Safe Exchange </span> 
                        <span className="normal">Recommendations</span>
                      </h3>
                    </div>
                    
                    <div className="exchange-options">
                      <div className="exchange-option">
                        <div className="option-header">
                          <div className="option-number">1</div>
                          <h4>Arrange Meeting</h4>
                        </div>
                        <p>Use the in-app chat to arrange a meeting in a safe, public location on campus</p>
                        <div className="option-buttons">
                          <button 
                            className="action-button chat-action" 
                            onClick={handleStartChat}
                          >
                            <FaComment /> Start Chat
                          </button>
                          <button 
                            className="action-button location-action" 
                            onClick={() => setShowLocationShare(true)}
                          >
                            <FaMapMarkerAlt /> Share Meeting Location
                          </button>
                        </div>
                      </div>
                      
                      <div className="exchange-option">
                        <div className="option-header">
                          <div className="option-number">2</div>
                          <h4>Inspect Item</h4>
                        </div>
                        <p>Always examine the item carefully before making any payment</p>
                      </div>
                      
                      <div className="exchange-option">
                        <div className="option-header">
                          <div className="option-number">3</div>
                          <h4>Payment Methods</h4>
                        </div>
                        <p>Recommended payment options:</p>
                        <div className="payment-methods">
                          <div className="payment-method">
                            <FaMoneyBillWave className="method-icon cash" />
                            <span>Cash</span>
                          </div>
                          <div className="payment-method">
                            <img src="/snapscan-icon.png" alt="SnapScan" className="method-icon snapscan" onError={(e) => e.target.src = 'https://www.snapscan.co.za/images/logo/icon.svg'} />
                            <span>SnapScan</span>
                          </div>
                          <div className="payment-method">
                            <svg className="method-icon eft" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M4,8H8V4H20V16H16V20H4V8M16,8V14H18V6H10V8H16M6,12V18H14V12H6Z" />
                            </svg>
                            <span>EFT</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="safety-notice">
                        <FaInfoCircle className="safety-icon" />
                        <p>For your safety, all transactions should be completed in person. Never send money in advance.</p>
                      </div>
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

      {/* Location Share Modal */}
      {showLocationShare && (
        <>
          <div className="location-share-overlay" onClick={() => setShowLocationShare(false)} />
          <LocationShare 
            onSelectLocation={handleShareLocation}
            onClose={() => setShowLocationShare(false)}
          />
        </>
      )}
    </div>
  );
};

export default ListingDetails;