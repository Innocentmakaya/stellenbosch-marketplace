# Fix for Multi-Image Upload Feature

The multi-image upload feature requires the `images_urls` column to be added to the `listings` table in your Supabase database. 

## Error

If you see this error when trying to add a listing:
```
Error adding listing: 
{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'images_urls' column of 'listings' in the schema cache"}
```

It means the `images_urls` column doesn't exist in your database yet.

## How to Fix

### Option 1: Use Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the following SQL command:

```sql
ALTER TABLE listings 
ADD COLUMN images_urls TEXT;

-- Add a helpful comment (optional)
COMMENT ON COLUMN listings.images_urls IS 'JSON array of image URLs for multiple images';
```

### Option 2: Use Supabase CLI (for developers)

1. Install the Supabase CLI if you haven't already
2. Run: `npx supabase login`
3. Run this SQL command with your project reference:
   ```
   npx supabase db execute --project-ref YOUR_PROJECT_REF "ALTER TABLE listings ADD COLUMN images_urls TEXT;"
   ```

## Verify the Fix

After adding the column, try uploading a listing with multiple images again. The error should be resolved and all images should be saved properly.

## Temporary Workaround

The application has been updated to gracefully handle the missing column. It will still allow you to add listings with a single image (the first image you upload) even if the column is missing, but you'll get a message indicating that only the main image was saved.

For the full multi-image functionality, please add the column as instructed above. 