import {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  // Step 5: add a simple useEffect hook that stores the values of the access_token and refresh_token into variables

  // We also use the built-in URLSearchParams web API to expose convenient utility methods (i.e. .get()) to work with the query strings.
  useEffect(() => {
    // window.location.search returns the values of everthing after the http://localhost:3000/ on the URL after Step 4 (http://localhost:3000/?access_token=BQBtyTL32CXr.....)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // get the access token and refresh token from urlParams.  Now we're ready to use those tokens to make API calls to the Spotify API -> Step 6
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    console.log(accessToken);
    console.log(refreshToken);

    // Step 6: Optimizing client/server development workflow
    // What if we wanted to make an HTTP request from our React app to one of our Express app's endpoints? such as when our access token expires, and we need to get a new one with the /refresh_token endpoint we set up.
    // If we tried to send a simple GET request to our http://localhost:8888/refresh_token endpoint from http://localhost:3000, we would run into CORS issues.
    // To tell the development server to proxy any unknown requests to our API server in development, we must set up a proxy in our React app's package.json file.
    // Once we add add a proxy of '"proxy": "http://localhost:8888"' (where our Express app runs) in client/package.json, it will work.
    if (refreshToken) {
      // fetch(`http://localhost:8888/refresh_token?refresh_token=${refreshToken}`)
      // Now, if we set up a request to our Express app's /refresh_token endpoint (without the http://localhost:8888 like the commented out fetch request above) using fetch() in our App.js, we should see some JSON data in addition to the tokens printed in our console.
      fetch(`/refresh_token?refresh_token=${refreshToken}`)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          // replace the Learn React link with a Log in to Spotify link that hits the /login route we set up in our Express app
          href="http://localhost:8888/login"
        > 
          Log into Spotify
        </a>
      </header>
    </div>
  );
}

export default App;
