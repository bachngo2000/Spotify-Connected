
// Step 7: move our query param logic from App.js to the Spotify.js file to keep Spotify-related logic in one place.
// Then, we can refactor our App.js file to import the access token from spotify.js and use the useState hook to keep track of the token. We'll then use the token state variable to conditionally render the login button, or a logged-in state, with a ternary.
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

