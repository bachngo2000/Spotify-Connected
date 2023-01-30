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

// Step 7: move our query param logic from App.js to the Spotify.js file to keep Spotify-related logic in one place.
// Then, we can refactor our App.js file to import the access token from spotify.js and use the useState hook to keep track of the token. We'll then use the token state variable to conditionally render the login button, or a logged-in state, with a ternary.
// Once we're done modifying our App.js file,  Now, although we're able to let users log in to Spotify and grab the access token from the URL, we still have a problem. Our React app is only aware of the Spotify access token when it's stored as a query parameter on the URL — meaning if we visit http://localhost:3000 again, we'll see the login button, not the logged-in state
// To fix this, we can store our tokens in local storage, a mechanism of the Web Storage API which lets us store key/value pairs in the browser.  Local storage will let us store data in the browser for a particular domain and persist it, even when the user closes the tab or navigates away from our app => Step 8 (index.js)
// Step 9: update the getAccessToken() function to store tokens in local storage the first time a user logs in, as well as to pull the tokens from local storage the next time they are available.
const getAccessToken = () => {
    // window.location.search returns the values of everthing after the http://localhost:3000/ on the URL after Step 4 (http://localhost:3000/?access_token=BQBtyTL32CXr.....)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // get the access token and refresh token from urlParams.  Now we're ready to use those tokens to make API calls to the Spotify API -> Step 6
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    return accessToken;
};

export const accessToken = getAccessToken();

