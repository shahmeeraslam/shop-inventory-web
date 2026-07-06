// ARCHIVE CENTRAL API LOCATION CONFIGURATOR
// =========================================================================
const HOSTNAME = window.location.hostname;

const IS_LOCAL = HOSTNAME === 'localhost' || HOSTNAME === '127.0.0.1';

export const API_BASE_URL = IS_LOCAL
  ? 'http://localhost:5000/api'
  : 'https://archive-backend-7vya.vercel.app/api'; 

console.log(`🌐 [Archive Runtime] Mapping data pathways to: ${API_BASE_URL}`);