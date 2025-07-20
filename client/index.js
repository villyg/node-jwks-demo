import axios from "axios";

async function runClient() {
  try {
    // Get token from Auth server
    const tokenResponse = await axios.post("http://auth:3001/token");
    const token = tokenResponse.data.token;

    // Use token to access protected API
    const apiResponse = await axios.get("http://api:3002/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("API Response:", apiResponse.data);
  } catch (error) {
    console.error(
      "Client error:",
      error.response ? error.response.data : error.message,
    );
  }
}

runClient();
