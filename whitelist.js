// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const API_ENDPOINT = 'http://digi.pylex.xyz:9990';

let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

// Hide all sections except login initially
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
});

function loginWithDiscord() {
    console.log('Login button clicked');
    
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify guilds.join',
        prompt: 'consent'
    });

    const authUrl = 'https://discord.com/oauth2/authorize?' + params.toString();
    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
}

// Function to show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    document.querySelector('.whitelist-box').appendChild(errorDiv);
}

// Function to start quiz
function startQuiz() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    document.getElementById('result-section').style.display = 'none';
    
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
    document.getElementById('submitQuiz').disabled = true;
}

// Check for authentication on page load
window.addEventListener('load', async () => {
    console.log('Page loaded');
    
    // Hide quiz and result sections initially
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    const error = fragment.get('error');

    if (error) {
        console.error('Auth error:', error);
        showError('Failed to authenticate with Discord. Please try again.');
        document.getElementById('login-section').style.display = 'block';
        return;
    }

    if (!accessToken) {
        console.log('No access token found, showing login');
        document.getElementById('login-section').style.display = 'block';
        return;
    }

    try {
        console.log('Verifying access token...');
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to verify token');
        }

        const userData = await response.json();
        currentUserId = userData.id;
        console.log('Authenticated as:', userData.username);
        
        // Only start quiz if authentication was successful
        startQuiz();
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Failed to authenticate with Discord. Please try again.');
        document.getElementById('login-section').style.display = 'block');
    }
});

// Handle answer selection
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

    document.getElementById('submitQuiz').disabled = userAnswers.includes(null);
};

// Handle quiz submission
document.getElementById('submitQuiz')?.addEventListener('click', async () => {
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= 8; // Need 8 correct answers to pass
    
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    
    if (passed) {
        document.getElementById('success-result').style.display = 'block';
        document.getElementById('fail-result').style.display = 'none';
        
        try {
            const response = await fetch(`${API_ENDPOINT}/assign-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    passed: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to assign role');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to assign role. Please contact an administrator.');
        }
    } else {
        document.getElementById('success-result').style.display = 'none';
        document.getElementById('fail-result').style.display = 'block';
    }
});
