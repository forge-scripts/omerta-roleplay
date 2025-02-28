const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const API_ENDPOINT = 'http://digi.pylex.xyz:9990';

const questions = [
    {
        question: "Što je RDM (Random Death Match)?",
        options: [
            "Ubijanje igrača bez RP razloga",
            "Roleplay borba",
            "Natjecanje u vožnji",
            "Prijateljski meč"
        ],
        correct: 0
    },
    {
        question: "Što je metagaming?",
        options: [
            "Korištenje in-game informacija",
            "Korištenje informacija izvan igre u igri",
            "Igranje mini-igara",
            "Razgovor s drugim igračima"
        ],
        correct: 1
    },
    {
        question: "Kako se trebate ponašati prema drugim igračima?",
        options: [
            "Agresivno",
            "Ignorirati ih",
            "S poštovanjem i u skladu s RP-om",
            "Natjecateljski"
        ],
        correct: 2
    },
    {
        question: "Što trebate napraviti prije započinjanja sukoba?",
        options: [
            "Odmah napasti",
            "Stvoriti RP razlog i situaciju",
            "Ignorirati druge igrače",
            "Napustiti server"
        ],
        correct: 1
    },
    {
        question: "Što je powergaming?",
        options: [
            "Igranje sa prijateljima",
            "Korištenje admin komandi",
            "Forsiranje radnji koje nisu realne",
            "Vježbanje vještina"
        ],
        correct: 2
    },
    {
        question: "Kako reagirati na RP situaciju koju ne želite?",
        options: [
            "Izaći iz igre",
            "Ignorirati situaciju",
            "Ostati u karakteru i pokušati riješiti situaciju RP-om",
            "Vrijeđati druge igrače"
        ],
        correct: 2
    },
    {
        question: "Što je VDM (Vehicle Death Match)?",
        options: [
            "Vožnja automobila",
            "Korištenje vozila kao oružja bez RP razloga",
            "Utrke automobila",
            "Popravljanje vozila"
        ],
        correct: 1
    },
    {
        question: "Kako prijaviti igrača koji krši pravila?",
        options: [
            "Vrijeđati ga u chatu",
            "Napasti ga u igri",
            "Prijaviti adminu s dokazima",
            "Ignorirati kršenje pravila"
        ],
        correct: 2
    },
    {
        question: "Što učiniti ako vidite bug u igri?",
        options: [
            "Iskoristiti ga za prednost",
            "Reći svima kako ga iskoristiti",
            "Prijaviti adminima i ne koristiti ga",
            "Ignorirati bug"
        ],
        correct: 2
    },
    {
        question: "Koja je svrha roleplay-a?",
        options: [
            "Pobjeđivanje drugih igrača",
            "Stvaranje priče i atmosfere kroz igranje uloge",
            "Skupljanje što više novca",
            "Pokazivanje vještina u igri"
        ],
        correct: 1
    }
];

const REQUIRED_SCORE = 8; // Minimum 8 correct answers to pass
let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

window.loginWithDiscord = function() {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify guilds.join'
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
};

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.whitelist-box').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

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

// Check for authentication response on page load
window.addEventListener('load', async () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    
    if (accessToken) {
        try {
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to get user info');
            }

            const userData = await userResponse.json();
            currentUserId = userData.id;

            // Check for cooldown
            const cooldownCheck = await fetch(`${API_ENDPOINT}/check-cooldown/${currentUserId}`);
            const cooldownData = await cooldownCheck.json();

            if (!cooldownData.canAttempt) {
                showCooldown(cooldownData.remainingTime);
            } else {
                startQuiz();
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to authenticate with Discord. Please try again.');
            document.getElementById('login-section').classList.add('active');
        }
    } else {
        document.getElementById('login-section').classList.add('active');
    }
});

function showCooldown(remainingTime) {
    document.getElementById('quiz-section').classList.remove('active');
    document.getElementById('cooldown-section').classList.add('active');
    
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('cooldown-timer').textContent = 
        `${hours}h ${minutes}m`;
}

document.getElementById('submitQuiz')?.addEventListener('click', async () => {
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= REQUIRED_SCORE;
    
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
        
        try {
            await fetch(`${API_ENDPOINT}/assign-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    passed: false
                })
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
});