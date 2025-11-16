// API Configuration
// For iOS simulator and Android emulator, use localhost (they run on the same machine)
// For physical devices, you may need to change this to your machine's IP address
// To find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const API_BASE_URL = 'http://localhost:3000';

// Uncomment and update IP for physical device testing:
// const API_BASE_URL = 'http://192.168.100.43:3000';

export default API_BASE_URL;


