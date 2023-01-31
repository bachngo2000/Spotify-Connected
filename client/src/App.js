import {useEffect, useState} from 'react';
import { accessToken, logout, getCurrentUserProfile } from './spotify';
import { catchErrors } from './utils';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import { GlobalStyle } from './styles';

import styled from 'styled-components/macro';

import { Login, Profile, TopArtists } from './pages';

// const StyledLoginButton = styled.a`
//   background-color: var(--green);;
//   color: var(--white);;
//   padding: 10px 20px;
//   margin: 20px auto;
//   border-radius: 30px;
//   display: inline-block;
// `;
const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0,0,0,.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

// Scroll to top of page when changing routes
// https://reactrouter.com/web/guides/scroll-restoration/scroll-to-top
// Create the <ScrollToTop> React component above our App function.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  const [token, setToken] = useState(null);

  // Step 13: after importing the getCurrentUserProfile() function from our spotify.js file, we add another useState hook to keep track of the data it returns
  const [profile, setProfile] = useState(null);

  // Step 5: add a simple useEffect hook that stores the values of the access_token and refresh_token into variables

  // We also use the built-in URLSearchParams web API to expose convenient utility methods (i.e. .get()) to work with the query strings.
  useEffect(() => {
    // window.location.search returns the values of everthing after the http://localhost:3000/ on the URL after Step 4 (http://localhost:3000/?access_token=BQBtyTL32CXr.....)
    // Step 7: we'll move our query param logic from App.js to the Spotify.js file to keep Spotify-related logic in one place. We don't want our App.js file to store any query param-related logic — all it needs to know about is whether there's a valid token or not.
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // // get the access token and refresh token from urlParams.  Now we're ready to use those tokens to make API calls to the Spotify API -> Step 6
    // const accessToken = urlParams.get('access_token');
    // const refreshToken = urlParams.get('refresh_token');

    // console.log(accessToken);
    // console.log(refreshToken);

    // Step 6: Optimizing client/server development workflow
    // What if we wanted to make an HTTP request from our React app to one of our Express app's endpoints? such as when our access token expires, and we need to get a new one with the /refresh_token endpoint we set up.
    // If we tried to send a simple GET request to our http://localhost:8888/refresh_token endpoint from http://localhost:3000, we would run into CORS issues.
    // To tell the development server to proxy any unknown requests to our API server in development, we must set up a proxy in our React app's package.json file.
    // Once we add add a proxy of '"proxy": "http://localhost:8888"' (where our Express app runs) in client/package.json, it will work.
  //   if (refreshToken) {
  //     // fetch(`http://localhost:8888/refresh_token?refresh_token=${refreshToken}`)
  //     // Now, if we set up a request to our Express app's /refresh_token endpoint (without the http://localhost:8888 like the commented out fetch request above) using fetch() in our App.js, we should see some JSON data in addition to the tokens printed in our console.
  //     fetch(`/refresh_token?refresh_token=${refreshToken}`)
  //       .then(res => res.json())
  //       .then(data => console.log(data))
  //       .catch(err => console.error(err));
  //   }

    setToken(accessToken);

    // Step 14: Since getCurrentUserProfile() returns a promise, we need to wait for the promise to be resolved using await. 
    // Since the await operator can only be used inside async functions, we handle this by creating an async function called fetchData() within our useEffect hook and invoking it
    // In fetchData(), all we need to do is await the response of getCurrentUserProfile(), and use setProfile to set the state variable. We're using destructuring to access the data property of the axios response.
    // Step 16: Using higher order function
    // We've been wrapping our async/await code in try/catch blocks to make sure we handle our errors gracefully. We could improve this code a bit with a higher-order function.
    // In our case, our higher-order function 'catchErrors' in util.js will take our async function, fetchData(), as an argument, and wrap our asynchronous code in a try/catch for us.
    // So, in our App.js file, we will import the catchErrors() function and wrap it around our invocation of fetchData() (our async function). Once we do that, we can safely remove the try/catch block.
    const fetchData = async () => {
      // await the getCurrentUserProfile() function
      // try {
      //   // Since we're using axios, the json data that is returned from the Spotify API endpoint is a property called 'data' on the response object, we could just destructure it here
      //   const { data } = await getCurrentUserProfile();
      //   setProfile(data);

      //   console.log(data);

      // } catch(e) {
      //   console.error(e);
      // }

      const { data } = await getCurrentUserProfile();
      setProfile(data);

    };

    catchErrors(fetchData());

  }, []);

  // Now, we're gonna add a logout button! We'll import the logout function from our spotify.js file and then add a <button> with a click handler that calls the logout function.
  // When we click the logout button, the page will reload and the 'Log in to Spotify' link will be rendered, since there's no longer an access token in local storage (it's been cleared)
  // Step 15: Now that we've stored the API response in the 'profile' state variable, we can use that to add some JSX to display the data!
  // So once the 'profile; state variable is not null, we will render what's in the <div>..</div> section
  // Step 16: Setting React Router
  // We'll use React Router to set up routing for these pages: Profile page (/), Top Artists page (/top-artists), Top Tracks page (/top-tracks), Playlists page (/playlists), Playlist details page (/playlists/:id)
  // After importing react-router-dom, we'll set up our routes and replace the else block of our ternary to use the <Router> component.
  // Each route (page) is wrapped in a <Route> component, and we declare the path we want that route to use with the path prop. Something important to note here is the order of the routes.
  // According to the React Router documentation, when a <Routes> is rendered, it searches through its children <Route> elements to find one whose path matches the current URL. When it finds one, it renders that <Route> and ignores all others. This means that you should put <Route>s with more specific (typically longer) paths before less-specific ones.
  // So in our case, we need to declare the /playlists/:id route before the /playlists route. If we don't, navigating to a URL like /playlists/abc123 will render the /playlists route since it's technically a match.
  //  add the <ScrollToTop> component inside our <Router> but above our <Routes>.
  return (
    <div className="App">
      <GlobalStyle />
      <header className="App-header">
        {!token ? (
          //replace our <StyledLoginButton>...</StyledLoginButton> with <Login /> page component
          <Login />
          // <StyledLoginButton 
          //   href="http://localhost:8888/login"
          // >
          //   Log in to Spotify
          // </StyledLoginButton>
        ) : (
          // <>
          //   <h1>Logged in!</h1>
          //   <button onClick={logout}>Log Out</button>
          //   {profile && (
          //     <div>
          //       <h1>{profile.display_name}</h1>
          //       <p>{profile.followers.total} Followers</p>
          //       {profile.images.length && profile.images[0].url && (
          //         <img src={profile.images[0].url} alt="Avatar"/>
          //       )}
          //     </div>
          //   )}
          // </>
          <>
          <StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>

          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/top-artists" element={<TopArtists />}>
              </Route>
              <Route path="/top-tracks" element={<h1>Top Tracks</h1>}>
              </Route>
              <Route path="/playlists/:id" element={<h1>Playlist</h1>}>
              </Route>
              <Route path="/playlists" element={<h1>Playlists</h1>}>
              </Route>
              <Route path="/" element={
                // <>
                //   <button onClick={logout}>Log Out</button>
                //   {profile && (
                //     <div>
                //       <h1>{profile.display_name}</h1>
                //       <p>{profile.followers.total} Followers</p>
                //       {profile.images.length && profile.images[0].url && (
                //         <img src={profile.images[0].url} alt="Avatar"/>
                //       )}
                //     </div>
                //   )}
                // </>
                <Profile />
              }>
              </Route>
            </Routes>
          </Router>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
