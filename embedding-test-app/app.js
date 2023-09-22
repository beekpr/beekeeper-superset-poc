import { embedDashboard } from "@superset-ui/embedded-sdk";
import axios, * as others from 'axios';


console.log(embedDashboard);
embedDashboard({
  id: "73c6772f-5034-43b6-b2c0-aabfe9592e5d", // given by the Superset embedding UI
  supersetDomain: "http://localhost:8088",
  mountPoint: document.getElementById("my-superset-container"), // any html element that can contain an iframe
  fetchGuestToken: () => fetchGuestTokenFromBackend(),
  dashboardUiConfig: { // dashboard UI config: hideTitle, hideTab, hideChartControls, filters.visible, filters.expanded (optional)
    hideTitle: true,
    filters: {
      expanded: true,
    }
  },
});

async function fetchGuestTokenFromBackend() {
   try {
     const options = {
       method: 'POST',
       url: 'http://localhost:8088/api/v1/security/login',
       headers: {
         'Content-Type': 'application/json',
       },
       data: {username: 'admin', password: 'admin', provider: 'db', refresh: true}
     };

     const loginResponse = await  axios.request(options)
     const adminToken = loginResponse.data.access_token

     const embedOptions = {
        method: 'POST',
        url: 'http://localhost:8088/api/v1/security/guest_token',
        headers: {
          'Authorization':  'Bearer ' + adminToken,
          'Content-Type': 'application/json',
        },
       data: {
         "user": {
           "username": "test",
           "first_name": "test",
           "last_name": "test"
         },
         "resources": [{
           "type": "dashboard",
           "id": "73c6772f-5034-43b6-b2c0-aabfe9592e5d"
         }],
         "rls": [
           { "clause": "tenant_id = 626" }
         ]
       }
     }

    const response = await axios.request(embedOptions);

    // Check if the response status is OK (200)
    if (response.status === 200) {
      // Parse the response data and return the token or relevant information
      return response.data.token; // Adjust this based on the actual response structure
    } else {
      throw new Error(`Request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching guest token:', error);
    throw error; // Propagate the error to the caller if needed
  }
}
