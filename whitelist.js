// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = window.location.hostname === 'localhost' 
    ? 'http://localhost:5500/whitelist.html'
    : 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const BOT_ENDPOINT = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'http://digi.pylex.xyz:9990';

// Quiz Questions array stays the same...

let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

// Make loginWithDiscord function global
window.loginWithDiscord = function() {
    console.log('Login button clicked');
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify guilds.join'
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
};

// Function to show error message
function showError(message) {
    console.log('Showing error:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Function to start quiz
function startQuiz() {
    console.log('Starting quiz');
    document.getElementById('login-section').classList.remove('active');
    document.getElementById('quiz-section').classList.add('active');
    
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = questions.map((q, i) => `
        <div class="question-box">
            <h4>Pitanje ${i + 1}</h4>
            <p>${q.question}</p>
            <div class="options">
                ${q.options.map((opt, j) => `
                    <label class="option">
                        <input type="radio" name="q${i}" value="${j}" onchange="handleAnswer(${i}, ${j})">
                        <div class="option-content">
                            <i data-lucide="circle" class="unchecked-icon"></i>
                            <i data-lucide="check-circle" class="checked-icon"></i>
                            <span>${opt}</span>
                        </div>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    lucide.createIcons();
    
    const submitBtn = document.getElementById('submitQuiz');
    submitBtn.disabled = true;
}

// Make handleAnswer function global
window.handleAnswer = function(questionIndex, answerIndex) {
    userAnswers[questionIndex] = answerIndex;
    
    const questionOptions = document.querySelectorAll(`input[name="q${questionIndex}"]`);
    questionOptions.forEach((option, index) => {
        const label = option.closest('.option');
        if (index === answerIndex) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });

    const submitBtn = document.getElementById('submitQuiz');
    submitBtn.disabled = userAnswers.includes(null);
};

// Check for authentication response on page load
window.addEventListener('load', async () => {
    console.log('Page loaded');
    
    // Check for Discord authentication response
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    
    if (accessToken) {
        console.log('Access token found');
        try {
            // Get user info from Discord
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to get user info');
            }

            const userData = await userResponse.json();
            console.log('User data received:', userData.id);
            currentUserId = userData.id;
            startQuiz();
        } catch (error) {
            console.error('Error during authentication:', error);
            showError('Failed to authenticate with Discord. Please try again.');
            document.getElementById('login-section').classList.add('active');
        }
    } else {
        console.log('No access token, showing login');
        document.getElementById('login-section').classList.add('active');
    }
});

// Handle quiz submission
document.getElementById('submitQuiz')?.addEventListener('click', async () => {
    console.log('Quiz submitted');
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    console.log('Score:', score);
    const passed = score >= REQUIRED_SCORE;
    
    document.getElementById('quiz-section').classList.remove('active');
    document.getElementById('result-section').classList.add('active');
    
    if (passed) {
        console.log('Quiz passed, assigning role');
        document.getElementById('success-result').style.display = 'block';
        document.getElementById('fail-result').style.display = 'none';
        
        try {
            const response = await fetch(`${BOT_ENDPOINT}/assign-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    passed: true
                })
            });

            console.log('Role assignment response:', response.status);

            if (!response.ok) {
                throw new Error('Failed to assign role');
            }

            const result = await response.json();
            if (result.success) {
                document.getElementById('success-result').innerHTML = `
                    <i data-lucide="check-circle"></i>
                    <h3>Čestitamo!</h3>
                    <p>Uspješno ste prošli whitelist. Uloga će vam biti dodijeljena automatski.</p>
                `;
            } else {
                throw new Error('Role assignment failed');
            }
        } catch (error) {
            console.error('Error assigning role:', error);
            document.getElementById('success-result').innerHTML = `
                <i data-lucide="check-circle"></i>
                <h3>Čestitamo!</h3>
                <p>Uspješno ste prošli whitelist, ali došlo je do greške pri dodjeljivanju uloge.</p>
                <p class="error-message">Molimo kontaktirajte administratora za dodjelu uloge.</p>
            `;
        }
    } else {
        console.log('Quiz failed');
        document.getElementById('success-result').style.display = 'none';
        document.getElementById('fail-result').style.display = 'block';
    }
    
    lucide.createIcons();
});
