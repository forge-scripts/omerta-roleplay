// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const API_ENDPOINT = 'http://digi.pylex.xyz:9990';

// Quiz Questions array stays the same...
let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

window.loginWithDiscord = function() {
    console.log('Login button clicked');
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify guilds.join',
        prompt: 'consent' // Add this to force consent screen
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
};

// Function to show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.whitelist-box').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Check for authentication response on page load
window.addEventListener('load', async () => {
    console.log('Page loaded, checking auth...');
    
    // Clear any existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Check for Discord authentication response
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    const error = fragment.get('error');
    
    if (error) {
        console.error('Auth error:', error);
        showError('Authentication failed. Please try again.');
        document.getElementById('login-section').classList.add('active');
        return;
    }
    
    if (accessToken) {
        console.log('Access token found, fetching user data...');
        try {
            // Get user info from Discord
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error(`Failed to get user info: ${userResponse.status}`);
            }

            const userData = await userResponse.json();
            console.log('User data received:', userData.id);
            currentUserId = userData.id;

            // Check for cooldown
            try {
                const cooldownCheck = await fetch(`${API_ENDPOINT}/check-cooldown/${currentUserId}`);
                if (!cooldownCheck.ok) {
                    throw new Error('Failed to check cooldown');
                }
                const cooldownData = await cooldownCheck.json();

                if (!cooldownData.canAttempt) {
                    showCooldown(cooldownData.remainingTime);
                } else {
                    startQuiz();
                }
            } catch (cooldownError) {
                console.error('Cooldown check error:', cooldownError);
                showError('Failed to check cooldown status. Please try again.');
            }
        } catch (error) {
            console.error('Auth error:', error);
            showError('Failed to authenticate with Discord. Please try again.');
            document.getElementById('login-section').classList.add('active');
        }
    } else {
        console.log('No access token, showing login');
        document.getElementById('login-section').classList.add('active');
    }
});

// Rest of your existing code...
