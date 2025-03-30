import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./SellItem.css";
import { FaSpinner, FaPlus, FaTimes } from "react-icons/fa";

const categories = ["Electronics", "Clothing", "Books", "Furniture", "Accessories", "Sports", "Other"];

const SellItem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [images, setImages] = useState([null, null, null]); // Array for multiple images
  const [imagePreviewUrls, setImagePreviewUrls] = useState([null, null, null]); // Preview URLs
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        navigate("/login"); // Redirect to login if not logged in
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      }
      if (event === "SIGNED_IN") {
        setUser(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  if (!user) return null; // Prevent rendering until authentication is checked

  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Update the images array
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
    
    // Create and set preview URL
    const previewUrl = URL.createObjectURL(file);
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls[index] = previewUrl;
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviewUrls = [...imagePreviewUrls];
    
    newImages[index] = null;
    
    // Revoke the object URL to avoid memory leaks
    if (newPreviewUrls[index]) {
      URL.revokeObjectURL(newPreviewUrls[index]);
    }
    newPreviewUrls[index] = null;
    
    setImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
    
    // Reset the file input
    const fileInput = document.getElementById(`image-input-${index}`);
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true); // Set submitting state to true

    // Check if at least one image is selected
    const hasAtLeastOneImage = images.some(img => img !== null);
    
    if (!title || !description || !price || !category || !hasAtLeastOneImage) {
      alert("Please fill in all fields and select at least one image.");
      setIsSubmitting(false);
      return;
    }

    try {
      const validImages = images.filter(img => img !== null);
      const imageUrls = [];
      
      // Upload each selected image
      for (const image of validImages) {
        const fileName = `${Date.now()}_${image.name}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, image);

        if (imageError) {
          console.error("Error uploading image:", imageError);
          continue; // Skip this image if upload fails
        }

        const { data: publicUrlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }
      
      if (imageUrls.length === 0) {
        alert("Failed to upload images. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // First try with the images_urls column (may fail if column doesn't exist yet)
      let { error } = await supabase.from("listings").insert([
        {
          title,
          description,
          price,
          category,
          image_url: imageUrls[0], // Set first image as main image
          images_urls: JSON.stringify(imageUrls), // Store all images as JSON array
          user_id: user.id,
        },
      ]);

      // If error is about missing images_urls column, try again without that field
      if (error && error.message && error.message.includes("images_urls")) {
        console.warn("images_urls column not found, falling back to single image mode");
        
        // Retry without the images_urls field
        const { error: retryError } = await supabase.from("listings").insert([
          {
            title,
            description,
            price,
            category,
            image_url: imageUrls[0], // Only use the first image
            user_id: user.id,
          },
        ]);
        
        if (retryError) {
          console.error("Error adding listing (retry):", retryError);
          alert("Error adding listing. Please try again.");
          setIsSubmitting(false);
          return;
        }
        
        // If we get here, the fallback succeeded
        alert("Listing added successfully! Note: Only the main image was saved. Ask your admin to add the 'images_urls' column to enable multiple images.");
      } else if (error) {
        console.error("Error adding listing:", error);
        alert("Error adding listing. Please try again.");
        setIsSubmitting(false);
        return;
      } else {
        alert("Listing added successfully!");
      }
      
      // Reset form fields
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory(categories[0]);
      setImages([null, null, null]);
      
      // Revoke all object URLs to avoid memory leaks
      imagePreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setImagePreviewUrls([null, null, null]);

      // Reset all file inputs
      for (let i = 0; i < 3; i++) {
        const fileInput = document.getElementById(`image-input-${i}`);
        if (fileInput) fileInput.value = '';
      }

      // 🔔 Send a push notification via the serverless function
      try {
        const response = await fetch("/api/sendNotification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, category }),
        });

        const result = await response.json();
        console.log("Notification sent:", result);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false); // Set submitting state back to false
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-card">
        <h2>Sell an Item</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <input
            type="number"
            placeholder="Price (in ZAR)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={isSubmitting}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          
          <div className="image-upload-section">
            <h3>Upload Images (up to 3)</h3>
            <p className="image-upload-hint">First image will be the main display image</p>
            
            <div className="image-upload-container">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="image-upload-item">
                  <div 
                    className={`image-upload-box ${imagePreviewUrls[index] ? 'has-image' : ''}`}
                    onClick={() => document.getElementById(`image-input-${index}`).click()}
                  >
                    {imagePreviewUrls[index] ? (
                      <>
                        <img 
                          src={imagePreviewUrls[index]} 
                          alt={`Preview ${index + 1}`} 
                          className="image-preview" 
                        />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="upload-placeholder">
                        <FaPlus />
                        <span>Add Image {index + 1}</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id={`image-input-${index}`}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, index)}
                    disabled={isSubmitting}
                    style={{ display: 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className={isSubmitting ? "submit-button loading" : "submit-button"}
            disabled={isSubmitting || !images.some(img => img !== null)}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner-icon" /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellItem;