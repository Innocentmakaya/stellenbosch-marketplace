# Ride Sharing Feature - Matie Market

## Overview

The ride sharing feature allows Stellenbosch University students to find or offer rides, making travel more affordable and eco-friendly. Students can:

- Browse available rides
- Offer rides to others and earn money
- Book seats on rides
- Cancel bookings
- Filter and search for specific rides

## Database Setup

1. Login to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `ridesSetup.sql` into the SQL Editor
4. Run the SQL script to create the necessary tables and security policies

## Feature Components

The ride sharing feature consists of the following components:

- **Rides.jsx**: Main page for browsing available rides
- **RideCard.jsx**: Card component for displaying individual ride information
- **OfferRide.jsx**: Form for offering a new ride
- **RideDetails.jsx**: Page for viewing ride details and booking seats

## Usage Instructions

### For Students Looking for Rides

1. Navigate to the Rides page
2. Use filters to find rides matching your requirements (destination, date, etc.)
3. Click on a ride to view details
4. Book available seats

### For Students Offering Rides

1. Navigate to the Rides page
2. Click "Offer a Ride" button
3. Fill out the ride details form (departure location, destination, date, time, seats, price)
4. Submit the form to create your ride listing

## Security Features

- Only authenticated users can create, update or delete rides
- Users can only modify their own rides
- Row Level Security enforces these permissions at the database level
- Trigger ensures bookings can't exceed available seats

## Technical Details

The ride sharing feature uses:

- Supabase for data storage and authentication
- React for the user interface
- React Router for navigation
- CSS modules for styling
- FontAwesome icons for visual elements

## Need Help?

If you have any issues with the ride sharing feature, please contact the development team at support@matiemarket.com.

---

Happy ride sharing! 