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
