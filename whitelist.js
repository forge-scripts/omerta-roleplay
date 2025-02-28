function loginWithDiscord() {
    alert('Button clicked!');
const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const API_ENDPOINT = 'http://digi.pylex.xyz:9990';

// Make sure this function is available in the global scope
function loginWithDiscord() {
    console.log('Login button clicked'); // Debug log
    
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify',
        prompt: 'consent'
    });

    const authUrl = 'https://discord.com/oauth2/authorize?' + params.toString();
    console.log('Auth URL:', authUrl); // Debug log
    window.location.href = authUrl;
}

// Rest of your code...
// Simplified Discord login function
window.loginWithDiscord = function() {
    const params = {
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify',
        prompt: 'consent'
    };
    
    const url = `https://discord.com/api/oauth2/authorize?${new URLSearchParams(params)}`;
    window.location.href = url;
};

// Function to show error message
function showError(message) {
    console.log('Error:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.whitelist-box').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Check authentication on page load
window.addEventListener('load', async () => {
    console.log('Page loaded');
    
    // Get the hash fragment
    const hash = window.location.hash.substring(1);
    if (!hash) {
        document.getElementById('login-section').classList.add('active');
        return;
    }

    // Parse the hash fragment
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (!accessToken) {
        document.getElementById('login-section').classList.add('active');
        return;
    }

    try {
        // Get user data from Discord
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user data');
        }

        const userData = await response.json();
        currentUserId = userData.id;
        console.log('Logged in as:', userData.username);
        
        // Start the quiz
        startQuiz();
        
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Failed to authenticate. Please try again.');
        document.getElementById('login-section').classList.add('active');
    }
});

// Function to start quiz
function startQuiz() {
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
    
    document.getElementById('submitQuiz').disabled = true;
}

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
    
    document.getElementById('quiz-section').classList.remove('active');
    document.getElementById('result-section').classList.add('active');
    
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
