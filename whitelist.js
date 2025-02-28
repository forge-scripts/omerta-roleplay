const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URL = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const API_ENDPOINT = 'https://digi.pylex.xyz:9990';

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

const REQUIRED_SCORE = 8;
let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

// Simplified login function
function loginWithDiscord() {
    console.log('Login attempt started'); // Debug log
    
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URL, // Note: using DISCORD_REDIRECT_URL here
        response_type: 'token',
        scope: 'identify',
        prompt: 'consent'
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    console.log('Auth URL:', authUrl); // Debug log
    window.location.href = authUrl;
}

// Simplified authentication check
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
            console.log('Auth successful:', userData.username);
            startQuiz();
        } catch (error) {
            console.error('Auth error:', error);
            document.getElementById('login-section').style.display = 'block';
        }
    } else {
        document.getElementById('login-section').style.display = 'block';
    }
});

function startQuiz() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    
    const quizSection = document.getElementById('quiz-section');
    quizSection.innerHTML = `
        <div class="quiz-container">
            <div class="progress-bar">
                <div class="progress-text">0/${questions.length} Pitanja</div>
                <div class="progress-fill"></div>
            </div>
            ${questions.map((q, i) => `
                <div class="question-card">
                    <div class="question-number">
                        <span class="cyber-text">#${(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div class="question-content">
                        <h3 class="cyber-question">${q.question}</h3>
                        <div class="options-grid">
                            ${q.options.map((opt, j) => `
                                <div class="option-card">
                                    <input type="radio" id="q${i}a${j}" name="q${i}" value="${j}" onchange="handleAnswer(${i}, ${j})">
                                    <label for="q${i}a${j}" class="cyber-option">
                                        <div class="option-border"></div>
                                        <div class="option-content">
                                            <span class="option-number">${String.fromCharCode(65 + j)}</span>
                                            <span class="option-text">${opt}</span>
                                        </div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
            <button onclick="submitQuiz()" id="submitQuiz" class="cyber-button" disabled>
                <span class="cyber-button-text">PREDAJ TEST</span>
                <div class="cyber-button-glitch"></div>
            </button>
        </div>
    `;
}

function handleAnswer(questionIndex, answerIndex) {
    userAnswers[questionIndex] = answerIndex;
    
    const answered = userAnswers.filter(answer => answer !== null).length;
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${(answered / questions.length) * 100}%`;
        progressText.textContent = `${answered}/${questions.length} Pitanja`;
    }

    document.getElementById('submitQuiz').disabled = userAnswers.includes(null);
}

function submitQuiz() {
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= REQUIRED_SCORE;
    
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    
    if (passed) {
        document.getElementById('success-result').style.display = 'block';
        document.getElementById('fail-result').style.display = 'none';
    } else {
        document.getElementById('success-result').style.display = 'none';
        document.getElementById('fail-result').style.display = 'block';
    }
}

// Make functions available globally
window.loginWithDiscord = loginWithDiscord;
window.handleAnswer = handleAnswer;
window.submitQuiz = submitQuiz;
