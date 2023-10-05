const CLIENT_ID = '75e990ef57704218959169b860fd21c5';
const REDIRECT_URI = 'https://spotify-matching-tester.netlify.app/index.html'; // Must match your app's settings
const SCOPES = ['user-top-read', 'user-follow-read'];
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}&response_type=token`;

const loginButton = document.getElementById('login');
const getTopTracksButton = document.getElementById('getTopTracks');
const getFollowedArtistsButton = document.getElementById('getFollowedArtists');
const dataDiv = document.getElementById('data');

let accessToken = null;

// Function to handle user login
loginButton.addEventListener('click', () => {
    window.location = AUTH_URL;
});

// Function to handle redirect from Spotify
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1).split('&');
    for (const param of hash) {
        const [key, value] = param.split('=');
        if (key === 'access_token') {
            accessToken = value;
            loginButton.style.display = 'none';
            break;
        }
    }
});

// Function to make API requests
async function fetchData(endpoint) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Get the user's top tracks
getTopTracksButton.addEventListener('click', async () => {
    const topTracks = await fetchData('top/tracks?limit=10');
    if (topTracks) {
        dataDiv.textContent = JSON.stringify(topTracks, null, 2);
    }
});

// Get the user's followed artists
getFollowedArtistsButton.addEventListener('click', async () => {
    const followedArtists = await fetchData('following?type=artist&limit=10');
    if (followedArtists) {
        dataDiv.textContent = JSON.stringify(followedArtists, null, 2);
    }
});
