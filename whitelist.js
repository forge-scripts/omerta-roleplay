const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URL = 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const DISCORD_ROLE_ID = '1344671671377858590';
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
        <div class="neo-container">
            <div class="neo-header">
                <div class="neo-title">WHITELIST TEST</div>
                <div class="neo-progress">
                    <div class="progress-line">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">0/${questions.length} PITANJA</div>
                </div>
            </div>
            ${questions.map((q, i) => `
                <div class="neo-card">
                    <div class="neo-card-header">
                        <div class="neo-question-number">
                            <span class="number">${(i + 1).toString().padStart(2, '0')}</span>
                            <div class="header-line"></div>
                        </div>
                    </div>
                    <div class="neo-question">
                        <h3>${q.question}</h3>
                        <div class="neo-options">
                            ${q.options.map((opt, j) => `
                                <div class="neo-option">
                                    <input type="radio" id="q${i}a${j}" name="q${i}" value="${j}" onchange="handleAnswer(${i}, ${j})">
                                    <label for="q${i}a${j}">
                                        <span class="option-marker">${String.fromCharCode(65 + j)}</span>
                                        <span class="option-text">${opt}</span>
                                        <div class="option-border"></div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
            <button id="submitQuiz" onclick="submitQuiz()" class="neo-button" disabled>
                <span class="button-content">PREDAJ TEST</span>
                <div class="button-border"></div>
            </button>
        </div>
    `;

    // Update the results section HTML
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
        <div class="neo-result-container">
            <div id="success-result" class="neo-result success">
                <div class="result-icon">✓</div>
                <h2>TEST USPJEŠNO POLOŽEN</h2>
                <p>Čestitamo! Uspješno ste položili whitelist test.</p>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">STATUS</span>
                        <span class="detail-value">VERIFIED</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">ULOGA</span>
                        <span class="detail-value">DODIJELJENA</span>
                    </div>
                </div>
                <div class="result-message">
                    Možete pristupiti serveru!
                </div>
            </div>
            
            <div id="fail-result" class="neo-result fail">
                <div class="result-icon">×</div>
                <h2>TEST NIJE POLOŽEN</h2>
                <p>Nažalost, niste položili whitelist test.</p>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">STATUS</span>
                        <span class="detail-value">FAILED</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">POTREBNO</span>
                        <span class="detail-value">${REQUIRED_SCORE} TOČNIH</span>
                    </div>
                </div>
                <div class="result-message">
                    Proučite pravila i pokušajte ponovno!
                </div>
                <button onclick="location.reload()" class="neo-retry-button">
                    <span class="button-content">POKUŠAJ PONOVNO</span>
                    <div class="button-border"></div>
                </button>
            </div>
        </div>
    `;

    // Add the new cyberpunk styles
    const style = document.createElement('style');
    style.textContent = `
        .neo-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
            background: rgba(13, 17, 23, 0.95);
            border-radius: 20px;
            box-shadow: 0 0 40px rgba(0, 255, 255, 0.1);
        }

        .neo-header {
            margin-bottom: 40px;
        }

        .neo-title {
            color: #0ff;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 4px;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .neo-progress {
            position: relative;
        }

        .progress-line {
            height: 4px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #0ff, #00ffaa);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            transition: width 0.3s ease;
        }

        .progress-text {
            position: absolute;
            right: 0;
            top: -25px;
            color: #0ff;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
        }

        .neo-card {
            background: rgba(16, 24, 39, 0.95);
            border: 1px solid rgba(0, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }

        .neo-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #0ff, transparent);
        }

        .neo-question-number {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .neo-question-number .number {
            color: #0ff;
            font-size: 20px;
            font-weight: 700;
            margin-right: 15px;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .header-line {
            flex-grow: 1;
            height: 2px;
            background: linear-gradient(90deg, #0ff, transparent);
        }

        .neo-question h3 {
            color: white;
            font-size: 20px;
            margin-bottom: 30px;
            line-height: 1.4;
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
        }

        .neo-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .neo-option input[type="radio"] {
            display: none;
        }

        .neo-option label {
            display: flex;
            align-items: center;
            padding: 20px;
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.1);
            border-radius: 10px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .neo-option label:hover {
            background: rgba(0, 255, 255, 0.1);
            border-color: #0ff;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .neo-option input[type="radio"]:checked + label {
            background: rgba(0, 255, 255, 0.15);
            border-color: #0ff;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
        }

        .option-marker {
            color: #0ff;
            font-size: 18px;
            font-weight: 700;
            margin-right: 15px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }

        .option-text {
            color: white;
            font-size: 16px;
        }

        .neo-button, .neo-retry-button {
            width: 100%;
            padding: 20px;
            background: rgba(0, 255, 255, 0.1);
            border: none;
            border-radius: 10px;
            color: #0ff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 3px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .neo-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .neo-button:not(:disabled):hover,
        .neo-retry-button:hover {
            background: rgba(0, 255, 255, 0.2);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
        }

        .button-content {
            position: relative;
            z-index: 1;
        }

        .button-border {
            position: absolute;
            inset: 0;
            border: 2px solid #0ff;
            border-radius: 10px;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }

        /* Result Styles */
        .neo-result-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
        }

        .neo-result {
            background: rgba(16, 24, 39, 0.95);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .neo-result::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
        }

        .success::before {
            background: linear-gradient(90deg, transparent, #00ff00, transparent);
        }

        .fail::before {
            background: linear-gradient(90deg, transparent, #ff0000, transparent);
        }

        .result-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .success .result-icon {
            color: #00ff00;
            text-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        }

        .fail .result-icon {
            color: #ff0000;
            text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }

        .neo-result h2 {
            color: white;
            font-size: 28px;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }

        .neo-result p {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 30px;
        }

        .result-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .detail-label {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            letter-spacing: 1px;
        }

        .detail-value {
            color: #0ff;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .result-message {
            color: white;
            font-size: 20px;
            margin: 30px 0;
            padding: 20px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 10px;
        }

        @media (max-width: 768px) {
            .neo-options {
                grid-template-columns: 1fr;
            }
            
            .result-details {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
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

async function submitQuiz() {
    const score = calculateScore(); // Your existing score calculation
    const passingScore = questions.length * 0.8; // 80% passing threshold

    if (score >= passingScore) {
        try {
            // Get the user's Discord ID from localStorage or wherever you store it
            const userId = localStorage.getItem('discord_user_id');
            
            const response = await fetch('https://digi.pylex.xyz:9990:9990/add-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });

            const data = await response.json();

            if (data.success) {
                displayMessage('Congratulations! You passed the test and received the role!', 'success');
            } else {
                throw new Error(data.error || 'Failed to assign role');
            }
        } catch (error) {
            console.error('Error:', error);
            displayMessage('Test je položen, ali došlo je do greške pri dodjeljivanju uloge.\n\nGreška: ' + error.message + '\n\nMolimo kontaktirajte administratora.', 'error');
        }
    } else {
        displayMessage('You did not pass the test. Please try again.', 'error');
    }
}

function displayMessage(message, type) {
    const resultDiv = document.getElementById('quiz-results');
    resultDiv.textContent = message;
    resultDiv.className = type;
    resultDiv.style.display = 'block';
}

// Add some CSS for better error display
const style = document.createElement('style');
style.textContent = `
    .error-box {
        margin-top: 20px;
        padding: 15px;
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid rgba(255, 0, 0, 0.3);
        border-radius: 8px;
    }

    .error-content {
        color: #ff6b6b;
        text-align: center;
    }

    .error-content p {
        margin: 5px 0;
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.loginWithDiscord = loginWithDiscord;
window.handleAnswer = handleAnswer;
window.submitQuiz = submitQuiz;
