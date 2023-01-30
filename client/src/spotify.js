import axios from 'axios';
// Map for localStorage keys
// LOCALSTORAGE_KEYS map is an easy way for us to refer to the keys we're going to use for each key/value pair in local storage
const LOCALSTORAGE_KEYS = {
    accessToken: 'spotify_access_token',
    refreshToken: 'spotify_refresh_token',
    expireTime: 'spotify_token_expire_time',
    timestamp: 'spotify_token_timestamp',
  }
  
// Map to retrieve localStorage values
// LOCALSTORAGE_VALUES map is an easy way for us to refer to the values currently set in local storage.  Step 8 ends here!
const LOCALSTORAGE_VALUES = {
    accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
    refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
    expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
    timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

//Step 10: Checking if the access token has expired
/**
 * Checks if the amount of time that has elapsed between the timestamp in localStorage
 * and now is greater than the expiration time of 3600 seconds (1 hour).
 * @returns {boolean} Whether or not the access token in localStorage has expired
 */
// This utility function uses the timestamp stored in local storage to check if the amount of time elapsed since the timestamp is greater than the access token's expire time (3600 seconds). If it is, then we can assume the token has expired and we need to fetch a new one.
const hasTokenExpired = () => {
    const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
    if (!accessToken || !timestamp) {
      return false;
    }
    const millisecondsElapsed = Date.now() - Number(timestamp);
    return (millisecondsElapsed / 1000) > Number(expireTime);
};

// Step 11: Refreshing the access token
/**
 * Use the refresh token in localStorage to hit the /refresh_token endpoint
 * in our Node app, then update values in localStorage with data from response.
 * @returns {void}
 */
// AN asynchronous function (due to the API call we make to our /refresh_token endpoint in our Express app)
const refreshToken = async () => {
    try {
      // First, we check to make sure we have a refresh token to use.  If not, we're out of luck and the only thing we can do is log the user out, since our app will be unusable
      // Logout if there's no refresh token stored or we've managed to get into a reload infinite loop
      if (!LOCALSTORAGE_VALUES.refreshToken ||
        LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
        (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
      ) {
        console.error('No refresh token available');
        logout();
      }
      // Otherwise, we await the JSON response from refreshing the token, and then use the response data to update our local storage values.
      // Use `/refresh_token` endpoint from our Node app
      const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);
  
      // Update localStorage values
      window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
      window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
      
      // Once we've retrieved a new token and updated our values in local storage, we need to reload the page so our updates can be reflected
      window.location.reload();
  
    } catch (e) {
      console.error(e);
    }
};

// Step 7: move our query param logic from App.js to the Spotify.js file to keep Spotify-related logic in one place.
// Then, we can refactor our App.js file to import the access token from spotify.js and use the useState hook to keep track of the token. We'll then use the token state variable to conditionally render the login button, or a logged-in state, with a ternary.
// Once we're done modifying our App.js file,  Now, although we're able to let users log in to Spotify and grab the access token from the URL, we still have a problem. Our React app is only aware of the Spotify access token when it's stored as a query parameter on the URL — meaning if we visit http://localhost:3000 again, we'll see the login button, not the logged-in state
// To fix this, we can store our tokens in local storage, a mechanism of the Web Storage API which lets us store key/value pairs in the browser.  Local storage will let us store data in the browser for a particular domain and persist it, even when the user closes the tab or navigates away from our app => Step 8 (index.js)
// Step 9: update the getAccessToken() function to store tokens in local storage the first time a user logs in, as well as to pull the tokens from local storage the next time they are available.
/**
 * Handles logic for retrieving the Spotify access token from localStorage
 * or URL query params
 * @returns {string} A Spotify access token
 */
const getAccessToken = () => {
    // All of our query params logic
    // window.location.search returns the values of everthing after the http://localhost:3000/ on the URL after Step 4 (http://localhost:3000/?access_token=BQBtyTL32CXr.....)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // get the access token and refresh token from urlParams.  Now we're ready to use those tokens to make API calls to the Spotify API -> Step 6
    // const accessToken = urlParams.get('access_token');
    // const refreshToken = urlParams.get('refresh_token');
    
    //using our LOCALSTORAGE_KEYS as a way to accurately grab the values from local storage
    const queryParams = {
        [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
        [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
        [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
    };

    // If there's an error in the query param of our URL OR the token in localStorage has expired, refresh the token
    if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
        refreshToken();
    }

    // If there is a valid access token in localStorage, use that
    if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
        return LOCALSTORAGE_VALUES.accessToken;
    }

    // If there is NO access token in local storage and there is a token in the URL query params, user is logging in for the first time
    if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
        // Store the query params in localStorage
        for (const property in queryParams) {
            window.localStorage.setItem(property, queryParams[property]);
        }
        // Set timestamp
        window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
        // Return access token from query params
        return queryParams[LOCALSTORAGE_KEYS.accessToken];
    }

    // We should never get here! Step 9 ends here!
    return false;
};

export const accessToken = getAccessToken();

