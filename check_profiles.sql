-- Check the structure of the profiles table
\d public.profiles;

-- Sample data from profiles
SELECT * FROM public.profiles LIMIT 5;

-- Check if the profiles table has first_name and last_name columns
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  ordinal_position; 