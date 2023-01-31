// The .env file is where we store sensitive information (CLIENT_ID and CLIENT_SECRET) and other environment variables for our app. To ensure our .env is kept private, we will add it to our .gitignore file.
// Since our .env file should be kept secret (and not checked into source control), we add an example .env file to our codebase for others to reference
// Now that we've stored our app's client ID and secret in a .env file, we need a way to make our code aware of them. To do that, we'll be using an npm module called dotenv, which lets us load environment variables from a .env file into process.env, an object containing the user environment.
// Once we installed, the following line requires and configures 'dotenv' 
require('dotenv').config();

//import (with require()) the Express module and instantiate the Express app
const express = require('express');

// querystring is a built-in Node module that lets us parse and stringify query strings and refactor our existing code to make handling query params easier and less error-prone.
const querystring = require('querystring');
const app = express();
//require the axios library to help create a POST request in our /callback route handler to send the authorization code back to the Spotify server to exchange for the access token
const axios = require('axios');
// const port = 8888;
const path = require('path');

// The last thing we need to do to prepare our environment is set up our redirect URI. The redirect URI is a route of our app that we want the Spotify Accounts Service to redirect the user to once they've authorized our app (i.e. successfully logged into Spotify).
//In our case, the redirect URI will be the /callback route (http://localhost:8888/callback). We'll set up this route handler later.
//Now that we have our CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI environment variables all set up, let's store those as constants using process.env, an object containing the user environment.
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = process.env.PORT || 8888;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, './client/build')));

// Route handler when a user first clicks on http://localhost:8888
app.get('/', (req, res) => {
    const data = {
      name: 'Bach',
      isAwesome: true,
    };
  
    res.json(data);
});

// Step 1: Request authorization from Spotify
// Part I: The first step in Spotify's Authorization Code Flow is having our app request authorization from the Spotify Accounts Service. In code terms, this means sending a GET request to the Spotify Accounts Service /authorize endpoint: GET https://accounts.spotify.com/authorize
// Set up a route handler for the '/login' endpoint (http://localhost:8888/login).  We want to set up our /login route to hit the Spotify Accounts Service https://accounts.spotify.com/authorize endpoint.  To do that, we'll use res.redirect(). The /authorize endpoint has required 
// several query parameters which we have to include: client_id, response_type, and redirect_uri.  There are also other optional query params for things such as authorization scopes and security that we'll eventually include.  We also update our route handler to use 'querystring'.
// querystring.stringify() takes an object with keys and values and serializes them into a query string so we dont have to keep track of ampersands and equal signs anymore.  So instead of 'res.redirect(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);'.
// we can do 'res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);' now.
// Here, queryParams evaluates to 'client_id=abc123&response_type=code&redirect_uri=http://localhost:8888/callback'. Then, all we have to do is append ?${queryParams} to the end of the /authorize endpoint template string.
// Part 2: Now that we have an easier way of handling query params in our HTTP requests using querystrings, we can add the optional 'state' and 'scope' query params on the /authorize endpoint that we didn't include before.
// First, above the login handler, we add a utility function generateRandomString,  Then we add a stateKey variable.  Lastly, we modify our login handler to work with the new optional query params.

/** Part 2: Add state and scope query params
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  
const stateKey = 'spotify_auth_state';

// Part I: Define a route handler for the '/login' endpoint
// We also update the /login handler to use the generateRandomString() utility function defined abobe to generate a random string for the 'state' query param and cookie. The 'state' query param is kind of a security measure — it protects against attacks such as cross-site request forgery.
// We also add the 'scope' query param, which is a space-separated list of Spotify's pre-defined authorization scopes. Let's pass two scopes for now: user-read-private and user-read-email. These scopes will let us access details about the currently logged-in user's account and their email.
app.get('/login', (req, res) => {

    //generate a random string of length 16
    const state = generateRandomString(16);

    //setting a cookie with this stateKey and random string 'state'
    res.cookie(stateKey, state);

    const scope = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
    ].join(' ');

    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        //add that state and scope query params to our object.  The 2 scopes in the scope variable (user-read-email and 'user-read-private) wil let us access details the currently log-ined user's account and their email.
        state: state,
        scope: scope,
      });

    // res.redirect(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);

});

// Step 2:  Use authorization code to request access token
// Currently, once the user logs into Spotify and gets redirected back to our app, they hit an error page. This is because we haven't set up our /callback route handler yet.
// Part 1: Set up the /callback route handler".  If the user accepted our request, then our app is ready to exchange the authorization code for an Access Token. It can do this by making a POST request to the /api/token endpoint. To exchange the authorization code for an access token, we need this route handler to send a POST request to the Spotify Accounts Service /api/token endpoint at 'POST https://accounts.spotify.com/api/token'
// Similar to the /authorize endpoint, the /api/token endpoint has required body parameters. The three params required for the /api/token endpoint are grant_type, code, and redirect_uri. When sent along in the body of the POST request, they need to be encoded in the application/x-www-form-urlencoded format.
// grant_type:   authorization_code
// code: The authorization code (the code query param on the /callback URL)
// redirect_uri: The REDIRECT_URI (http://localhost:8888/callback)
// The token endpoint also has a required Authorization header, which needs to be a base 64 encoded string in this format: Authorization: Basic <base 64 encoded client_id:client_secret>.
// Next, we'll create our POST request in our /callback route handler to send the authorization code back to the Spotify server to exchange for the access token using the Axios library, which provides a simpler API than Node's built-in modules (Node-Fetch). Other than being easy to use, Axios also works both client-side (in the browser) and server-side (in our Express app).
// Now, we''ll update our /callback route handler and set up the POST request to https://accounts.spotify.com/api/token with the axios() method in our /callback route handler.
app.get('/callback', (req, res) => {

    // res.send('Callback');

    // First, we store the value of our 'authorization code', which we got from the 'code' query param in the const 'code' variable. In Express, req.query is an object containing a property for each query string parameter in a route. 
    // For example, if the route was /callback?code=abc123&state=xyz789, req.query.code would be abc123 and req.query.state would be xyz789. If for some reason the route doesn't have a code query param, we set null as a fallback.
    const code = req.query.code || null;

    // Second, we set up the POST request to https://accounts.spotify.com/api/token by passing a config object to the axios() method, which will send the request when invoked.
    // In the 'data' object, we use querystring.stringify() to format the three required body params. The code variable we declared above is passed as one of the params here.
    // We also set two request header params in the headers object: a content-type header and an Authorization header.
    // Now that our axios method is complete, once we visit the http://localhost:8888/login endpoint again, we should see the JSON data returned by Spotify's /api/token endpoint, which includes the special access_token we've been waiting for!
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })  // Since Axios is a promised-based library, then, we chain a .then() and a .catch() callback functions to handle resolving the promise the axios() method returns. If our request is successful (i.e. returns with a 200 status code with the response), the .then() callback will be invoked, where we return the stringified response.data object from the Axios response. (It's important to note here that Axios stores the data returned by requests in the data property of the response object, not the response object itself.)
      .then(response => {
        // if (response.status === 200) {
        //   /* Our use of the JSON.stringify() method (<pre>${JSON.stringify(response.data, null, 2)}</pre>) is a just a handy way to format JSON nicely in the browser. Simply returning response.data would also work, but the JSON displayed in the browser wouldn't be formatted.*/
        //   res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
        // } else {
        //   res.send(response);
        // }

        /* Step 3: Use access token to request data from the Spotify API */
        // Now that we finally have an access token, we can test out requesting some user data from the Spotify API. We'll modify the .then() callback function to send a GET request to the https://api.spotify.com/v1/me endpoint, which will return detailed profile information about the current user.
        // We use destructuring to store the access_token and token_type as variables to pass into the Authorization header.  Now, when we visit our /login route again, our /callback route will display the user profile JSON data returned from Spotify's /me endpoint.
        // But we're not done yet, if we take another look at the data returned by Spotify's /api/token endpoint, we'll see that in addition to the access_token, there are also a token_type, scope, expires_in, and refresh_token value.
        // The expires_in value is the number of seconds that the access_token is valid. This means after 3600 seconds, or 60 minutes, our access_token will expire.
        // Once the token is expired, there are two things that could happen: 1) we force the user to log in again, or 2) we use the refresh_token to retrieve another access token behind the scenes, not requiring the user log in again. The better user experience is definitely the latter, so let's make sure our app has a way to handle that by setting up the  a route handler to handle requesting a new access token with our refresh token (Step 4).
        // if (response.status === 200) {

        //     const { access_token, token_type } = response.data;
      
        //     // axios.get('https://api.spotify.com/v1/me', {
        //     //   headers: {
        //     //     Authorization: `${token_type} ${access_token}`
        //     //   }
        //     // })
        //     //   .then(response => {
        //     //     res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
        //     //   })
        //     //   .catch(error => {
        //     //     res.send(error);
        //     //   });

        //     /* To test the route handler, we'll have to go through the login flow again. For testing purposes, let's replace the GET request we made to the https://api.spotify.com/v1/me endpoint in the /callback route handler with a GET request to our local /refresh_token endpoint (http://localhost:8888/refresh_token).*/
        //     const { refresh_token } = response.data;

        //     axios.get(`http://localhost:8888/refresh_token?refresh_token=${refresh_token}`)
        //       .then(response => {
        //         res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
        //       })
        //       .catch(error => {
        //         res.send(error);
        //       });
      
        // } else {
        //     res.send(response);
        // }

        // Step 5: What we really want our /callback route handler to do, once our app has been authorized and the user has successfully logged in to Spotify, is to redirect the user to our React app with the access and refresh tokens we received from the Spotify Accounts Service.
        // We can pass the tokens along to our React app with query params, so we will update our route handler to do that and comment out the previous code above
        // Here, once the user successfully logged in to Spotify, we use the res.redirect() Express method to redirect the user to http://localhost:3000 (our React app), and querystring.stringify() the tokens.
        // Now, when we hit the Log in to Spotify link, the URL will be updated to include the access_token and refresh_token query params
        // Oce we're done with this step, when the user logs in with our link, if we look at the url in the address bar, we'll see that it's not just plain 'http://localhost:3000' anymore, there are also access token and refresh token query params on that url.
        // Now that we have those 2 tokens in the URL, we can store them in our React app using useEffect hook -> Step 5 (App.js)
        // Step 8: update the /callback route handler in our Express app to also include the expires_in value in the query params of the redirect URL so we work with it in our React app.
      if (response.status === 200) {
          const { access_token, refresh_token, expires_in  } = response.data;
  
          const queryParams = querystring.stringify({
            access_token,
            refresh_token,
            expires_in
          });
          
          // redirect to react app at http://localhost:3000
          res.redirect(`${FRONTEND_URI}?${queryParams}`);
          
        } 
        // if the respose is not 200, we will redirect with a error query param instead
        else {
          res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
        }
      }) // On the other hand, if our request fails, the error will be caught in the .catch() callback, in which case we just return the error message.
      .catch(error => {
        res.send(error);
      });
});


// Step 4: Set up the /refresh_token route handler
// a route handler to handle requesting a new access token with our refresh token. Here, we use axios() again to send a POST request to the https://accounts.spotify.com/api/token endpoint that we did in our /callback handler.
// This route handler is almost the same as the /callback handler, except for a few small differences. 
// The grant_type is refresh_token instead of authorization_code, and we're sending along a refresh_token instead of an authorization code.
app.get('/refresh_token', (req, res) => {
    const { refresh_token } = req.query;
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        res.send(error);
      });
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, () => {''
    console.log(`Express app listening at http://localhost:${PORT}`);
});