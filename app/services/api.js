// 🛑 NUCLEAR FIX: HARDCODED IP
const BASE_URL = 'http://172.20.10.8/capstone';

export const apiRequest = async (endpoint, method = 'GET', body) => {
  // ... rest of the code stays the same ...
  try {
    console.log(`[API] Sending ${method} to ${BASE_URL}/${endpoint}`);

    const config = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    };
    
    // 🚀 The Fetch Call
    const response = await fetch(`${BASE_URL}/${endpoint}`, config);
    const text = await response.text(); 

    console.log("[API] Response:", text); 

    try {
        return JSON.parse(text);
    } catch (e) {
        console.log("Server Error (Not JSON):", text);
        return { success: false, message: "Server returned junk data" };
    }

  } catch (error) {
    console.error("Network Error Details:", error);
    return { success: false, message: `Connection Failed: ${error.message}` };
  }
};