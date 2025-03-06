import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nxpdfhhdjxuoosdojvmv.supabase.co"; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cGRmaGhkanh1b29zZG9qdm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTg0ODYsImV4cCI6MjA1NDY5NDQ4Nn0.mXxZwAw7f2oDaRxhKN3Q98HQvwTan86IbzxomUPwtRc"; // Replace with your anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
