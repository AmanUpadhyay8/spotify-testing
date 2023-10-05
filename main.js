// const CLIENT_ID = '75e990ef57704218959169b860fd21c5';
// const REDIRECT_URI = 'https://spotify-matching-tester.netlify.app/index.html'; // Must match your app's settings
// const SCOPES = ['user-top-read', 'user-follow-read'];
// const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}&response_type=token`;
const clientId = "75e990ef57704218959169b860fd21c5";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");


// const loginButton = document.getElementById('login');
// const getTopTracksButton = document.getElementById('getTopTracks');
// const getFollowedArtistsButton = document.getElementById('getFollowedArtists');
// const dataDiv = document.getElementById('data');

// let accessToken = null;

// // Function to handle user login
// loginButton.addEventListener('click', () => {
//     window.location = AUTH_URL;
// });

// // Function to handle redirect from Spotify
// window.addEventListener('load', () => {
//     const hash = window.location.hash.substring(1).split('&');
//     for (const param of hash) {
//         const [key, value] = param.split('=');
//         if (key === 'access_token') {
//             accessToken = value;
//             loginButton.style.display = 'none';
//             break;
//         }
//     }
// });

// // Function to make API requests
// async function fetchData(endpoint) {
//     try {
//         const response = await fetch(`https://api.spotify.com/v1/me/${endpoint}`, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//             },
//         });
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error:', error);
//         return null;
//     }
// }

// // Get the user's top tracks
// getTopTracksButton.addEventListener('click', async () => {
//     const topTracks = await fetchData('top/tracks?limit=10');
//     if (topTracks) {
//         dataDiv.textContent = JSON.stringify(topTracks, null, 2);
//     }
// });

// // Get the user's followed artists
// getFollowedArtistsButton.addEventListener('click', async () => {
//     const followedArtists = await fetchData('following?type=artist&limit=10');
//     if (followedArtists) {
//         dataDiv.textContent = JSON.stringify(followedArtists, null, 2);
//     }
// });


if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  populateUI(profile);
}

export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[0]) {
      const profileImage = new Image(200, 200);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar").appendChild(profileImage);
      document.getElementById("imgUrl").innerText = profile.images[0].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
}