-- Add the images_urls column to the listings table
ALTER TABLE listings 
ADD COLUMN images_urls TEXT;

-- Comment describing the column
COMMENT ON COLUMN listings.images_urls IS 'JSON array of image URLs for multiple images'; 