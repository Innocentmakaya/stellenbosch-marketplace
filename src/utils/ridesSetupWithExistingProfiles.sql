-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  departure_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  total_seats INTEGER NOT NULL,
  booked_seats INTEGER DEFAULT 0,
  price_per_seat DECIMAL(10, 2) NOT NULL,
  car_model TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ride bookings table
CREATE TABLE IF NOT EXISTS ride_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  seats_booked INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (ride_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_bookings ENABLE ROW LEVEL SECURITY;

-- Security policies for rides table
CREATE POLICY "Anyone can view rides" 
ON rides FOR SELECT 
USING (true);

CREATE POLICY "Users can create rides" 
ON rides FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rides" 
ON rides FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rides" 
ON rides FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Security policies for ride_bookings table
CREATE POLICY "Anyone can view bookings" 
ON ride_bookings FOR SELECT 
USING (true);

CREATE POLICY "Users can create bookings" 
ON ride_bookings FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON ride_bookings FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
ON ride_bookings FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rides_timestamp
BEFORE UPDATE ON rides
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ride_bookings_timestamp
BEFORE UPDATE ON ride_bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS rides_user_id_idx ON rides(user_id);
CREATE INDEX IF NOT EXISTS rides_departure_date_idx ON rides(departure_date);
CREATE INDEX IF NOT EXISTS ride_bookings_ride_id_idx ON ride_bookings(ride_id);
CREATE INDEX IF NOT EXISTS ride_bookings_user_id_idx ON ride_bookings(user_id);

-- Add function to check available seats before booking
CREATE OR REPLACE FUNCTION check_seats_available()
RETURNS TRIGGER AS $$
DECLARE
  available_seats INTEGER;
BEGIN
  -- Get available seats for the ride
  SELECT (total_seats - booked_seats) INTO available_seats
  FROM rides
  WHERE id = NEW.ride_id;
  
  -- Check if enough seats are available
  IF available_seats < NEW.seats_booked THEN
    RAISE EXCEPTION 'Not enough seats available. Only % seats left.', available_seats;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to check seats before booking
CREATE TRIGGER check_seats_before_booking
BEFORE INSERT ON ride_bookings
FOR EACH ROW
EXECUTE FUNCTION check_seats_available(); 