import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./EditListing.css";

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
        setError("Failed to fetch listing.");
      } else {
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category);
        setImageUrl(data.image_url);
      }
    };

    fetchListing();
  }, [id]);

  const handleImageUpload = async () => {
    if (!newImage) return null;

    const fileExt = newImage.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `listing-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, newImage, { upsert: true });

    if (error) {
      console.error("Image upload error:", error);
      setError("Failed to upload image.");
      return null;
    }

    // ✅ Correctly retrieve the public URL
    const { data: publicUrlData } = await supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("Failed to get public URL");
      setError("Failed to retrieve uploaded image URL.");
      return null;
    }

    return publicUrlData.publicUrl;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let updatedImageUrl = imageUrl;
    if (newImage) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl) {
        updatedImageUrl = uploadedUrl;
        setImageUrl(uploadedUrl); // 🔥 Force re-render with new image
      }
    }

    const { error } = await supabase
      .from("listings")
      .update({
        title,
        description,
        price,
        category,
        image_url: updatedImageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      setError("Failed to update listing.");
    } else {
      alert("Listing updated successfully!");
      navigate("/my-listings");
    }

    setLoading(false);
  };

  return (
    <div className="edit-container">
      <h2>Edit Listing</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdate}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (R)" required />
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />

        <label>Current Image:</label>
        <img src={imageUrl} alt="Current listing" className="preview-image" onError={(e) => (e.target.style.display = "none")} />

        <label>Upload New Image:</label>
        <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />

        <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Listing"}</button>
      </form>
    </div>
  );
}

export default EditListing;
