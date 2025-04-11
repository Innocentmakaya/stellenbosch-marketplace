import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt, FaCrosshairs, FaTimes, FaLink, FaMapPin, FaCheckCircle, FaCopy } from 'react-icons/fa';
import './LocationShare.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle location selection on map
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position ? (
    <Marker position={position} icon={customIcon}>
      <Popup>Meeting location selected</Popup>
    </Marker>
  ) : null;
}

// Predefined campus locations
const campusLocations = [
  { name: "Neelsie Student Center", lat: -33.932288, lng: 18.866325 },
  { name: "Main Library", lat: -33.930968, lng: 18.865187 },
  { name: "Engineering Building", lat: -33.927708, lng: 18.865374 },
  { name: "Student Union", lat: -33.931885, lng: 18.866695 },
  { name: "Arts Building", lat: -33.929970, lng: 18.867651 },
];

const LocationShare = ({ onSelectLocation, onClose, presetLocation = null }) => {
  // Default to Stellenbosch University campus center if no location provided
  const [position, setPosition] = useState(presetLocation || { lat: -33.930490, lng: 18.865124 });
  const [showMap, setShowMap] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [copied, setCopied] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (presetLocation) {
      setPosition(presetLocation);
      // Try to find a name for the preset location
      const foundLocation = campusLocations.find(
        loc => Math.abs(loc.lat - presetLocation.lat) < 0.001 && 
              Math.abs(loc.lng - presetLocation.lng) < 0.001
      );
      if (foundLocation) {
        setLocationName(foundLocation.name);
      }
    }
  }, [presetLocation]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo(newPos, 16);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Couldn't get your current location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Select a predefined location
  const selectPredefinedLocation = (location) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setLocationName(location.name);
    if (mapRef.current) {
      mapRef.current.flyTo([location.lat, location.lng], 16);
    }
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Share the selected location
  const shareLocation = () => {
    const locationData = {
      position,
      name: locationName || `Selected Location (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`,
      timestamp: new Date().toISOString(),
    };
    
    if (onSelectLocation) {
      onSelectLocation(locationData);
    }
    
    setLocationShared(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  // Copy location link to clipboard
  const copyLocationLink = () => {
    const locationUrl = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
    navigator.clipboard.writeText(locationUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        alert("Failed to copy location link");
      }
    );
  };

  return (
    <div className="location-share-modal">
      <div className="location-modal-header">
        <h3><FaMapMarkerAlt /> Share Meeting Location</h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="location-content">
        <div className="location-actions">
          <button className="location-button current-location" onClick={getCurrentLocation}>
            <FaCrosshairs /> Use My Current Location
          </button>
          <button className="location-button toggle-map" onClick={toggleMap}>
            <FaMapPin /> {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {showMap && (
          <div className="map-container">
            <MapContainer 
              center={[position.lat, position.lng]} 
              zoom={15} 
              style={{ height: '300px', width: '100%', borderRadius: '8px' }}
              whenCreated={mapInstance => {
                mapRef.current = mapInstance;
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
            <div className="map-instructions">
              <p>Click on the map to select a meeting location</p>
            </div>
          </div>
        )}

        <div className="location-name-input">
          <label htmlFor="location-name">Location Name (optional)</label>
          <input
            type="text"
            id="location-name"
            placeholder="e.g., Neelsie Student Center"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>

        <div className="predefined-locations">
          <h4>Common Campus Locations</h4>
          <div className="location-pills">
            {campusLocations.map((location, index) => (
              <button
                key={index}
                className={`location-pill ${locationName === location.name ? 'active' : ''}`}
                onClick={() => selectPredefinedLocation(location)}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        <div className="location-coordinates">
          <p>
            <strong>Coordinates:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`} 
              onClick={copyLocationLink}
              title="Copy Google Maps link"
            >
              {copied ? <FaCheckCircle /> : <FaLink />}
            </button>
          </p>
        </div>

        <div className="location-actions">
          <button 
            className="location-button cancel" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={`location-button share ${locationShared ? 'shared' : ''}`} 
            onClick={shareLocation}
            disabled={locationShared}
          >
            {locationShared ? (
              <>
                <FaCheckCircle /> Location Shared
              </>
            ) : (
              <>
                <FaMapPin /> Share Location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationShare; 