/**
 * Utility functions for handling ride notifications
 */

/**
 * Broadcast a new ride created event that the Navbar can listen for
 * @param {Object} ride The newly created ride
 */
export const broadcastNewRide = (ride) => {
  // Create a custom event with the ride data
  const newRideEvent = new CustomEvent('newRideCreated', {
    detail: { ride }
  });
  
  // Dispatch the event globally so Navbar can listen for it
  window.dispatchEvent(newRideEvent);
};

/**
 * Get the count of new rides since last check
 * @returns {Promise<number>} The number of new rides
 */
export const getNewRidesCount = async (supabase, userId) => {
  try {
    // Get the last time rides were checked from localStorage
    const lastChecked = localStorage.getItem('lastRidesCheck') || '2000-01-01T00:00:00Z';
    
    // Get rides created after the last check
    const { data: rides, error } = await supabase
      .from('rides')
      .select('id, created_at, user_id')
      .gt('created_at', lastChecked)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching new rides:', error);
      return 0;
    }
    
    // Don't count the user's own rides as "new"
    const otherUserRides = rides.filter(ride => ride.user_id !== userId);
    
    return otherUserRides.length;
  } catch (error) {
    console.error('Error checking for new rides:', error);
    return 0;
  }
};

/**
 * Update the last checked timestamp
 */
export const updateLastCheckedTimestamp = () => {
  localStorage.setItem('lastRidesCheck', new Date().toISOString());
};

export default {
  broadcastNewRide,
  getNewRidesCount,
  updateLastCheckedTimestamp
}; 