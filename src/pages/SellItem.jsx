import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./SellItem.css";

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Furniture",
  "Accessories",
  "Sports",
  "Other",
];

const SellItem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        navigate("/login");
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

  if (!user) return null;

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description || !price || !category || !image) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}_${image.name}`;
    const { data: imageData, error: imageError } = await supabase.storage
      .from("listing-images")
      .upload(fileName, image);

    if (imageError) {
      console.error("Error uploading image:", imageError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Add listing to the Supabase database
    const { error } = await supabase.from("listings").insert([
      {
        title,
        description,
        price,
        category,
        image_url: imageUrl,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error adding listing:", error);
      return;
    }

    alert("Listing added successfully!");
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory(categories[0]);
    setImage(null);

    // Fetch all user FCM tokens
    const { data: users, error: fetchError } = await supabase
      .from("profiles")
      .select("fcm_token")
      .neq("fcm_token", null);

    if (fetchError) {
      console.error("Error fetching tokens:", fetchError.message);
      return;
    }

    const tokens = users.map((user) => user.fcm_token);

    // Call the Vercel serverless function to send notifications
    try {
      const response = await fetch("/api/sendNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price, tokens }),
      });

      if (!response.ok) {
        console.error("Failed to send notifications:", await response.text());
      } else {
        console.log("Notifications sent successfully!");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
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
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price (in ZAR)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
