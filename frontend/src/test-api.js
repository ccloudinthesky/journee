// Test Google Maps API Key
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

console.log('API Key:', API_KEY ? 'Set' : 'Not set');
console.log('API Key length:', API_KEY?.length || 0);

// Test if we can access Google Maps
if (typeof google !== 'undefined') {
  console.log('Google Maps loaded successfully');
} else {
  console.log('Google Maps not loaded');
}
