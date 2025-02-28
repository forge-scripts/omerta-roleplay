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
        <div class="cyber-container">
            <div class="cyber-progress">
                <div class="progress-text">0/${questions.length} Pitanja</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
            ${questions.map((q, i) => `
                <div class="cyber-card" data-question="${i}">
                    <div class="card-header">
                        <div class="question-number">
                            <div class="cyber-line"></div>
                            <span class="cyber-text">PITANJE ${(i + 1).toString().padStart(2, '0')}</span>
                        </div>
                        <div class="cyber-decoration">
                            <div class="cyber-circle"></div>
                            <div class="cyber-line"></div>
                        </div>
                    </div>
                    <div class="question-content">
                        <h3 class="cyber-question">${q.question}</h3>
                        <div class="cyber-grid">
                            ${q.options.map((opt, j) => `
                                <div class="option-wrapper">
                                    <input type="radio" id="q${i}a${j}" name="q${i}" value="${j}" onchange="handleAnswer(${i}, ${j})">
                                    <label for="q${i}a${j}" class="cyber-option">
                                        <div class="option-content">
                                            <span class="option-marker">${String.fromCharCode(65 + j)}</span>
                                            <span class="option-text">${opt}</span>
                                        </div>
                                        <div class="cyber-glitch"></div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
            <button onclick="submitQuiz()" id="submitQuiz" class="cyber-submit" disabled>
                <span class="button-text">PREDAJ TEST</span>
                <div class="button-glitch"></div>
            </button>
        </div>
    `;

    // Add the new cyberpunk styles
    const style = document.createElement('style');
    style.textContent = `
        .cyber-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 15px;
        }

        .cyber-progress {
            margin-bottom: 30px;
            position: relative;
        }

        .progress-text {
            color: #0ff;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .progress-bar {
            height: 4px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: #0ff;
            box-shadow: 0 0 10px #0ff;
            transition: width 0.3s ease;
        }

        .cyber-card {
            background: rgba(16, 24, 39, 0.9);
            border: 1px solid rgba(0, 255, 255, 0.1);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }

        .cyber-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #0ff, transparent);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .question-number {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .cyber-text {
            color: #0ff;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 2px;
            text-shadow: 0 0 5px #0ff;
        }

        .cyber-decoration {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .cyber-circle {
            width: 8px;
            height: 8px;
            background: #0ff;
            border-radius: 50%;
            box-shadow: 0 0 5px #0ff;
        }

        .cyber-line {
            width: 30px;
            height: 2px;
            background: #0ff;
            box-shadow: 0 0 5px #0ff;
        }

        .cyber-question {
            color: white;
            font-size: 20px;
            margin-bottom: 25px;
            line-height: 1.4;
            text-shadow: 0 0 2px white;
        }

        .cyber-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .option-wrapper {
            position: relative;
        }

        .option-wrapper input[type="radio"] {
            display: none;
        }

        .cyber-option {
            display: block;
            padding: 15px;
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .cyber-option:hover {
            background: rgba(0, 255, 255, 0.1);
            border-color: #0ff;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }

        .option-wrapper input[type="radio"]:checked + .cyber-option {
            background: rgba(0, 255, 255, 0.15);
            border-color: #0ff;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }

        .option-content {
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
            z-index: 1;
        }

        .option-marker {
            color: #0ff;
            font-weight: 600;
            font-size: 18px;
            text-shadow: 0 0 5px #0ff;
        }

        .option-text {
            color: white;
            font-size: 16px;
        }

        .cyber-submit {
            width: 100%;
            padding: 20px;
            background: rgba(0, 255, 255, 0.1);
            border: 2px solid #0ff;
            border-radius: 8px;
            color: #0ff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 3px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }

        .cyber-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .cyber-submit:not(:disabled):hover {
            background: rgba(0, 255, 255, 0.2);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
        }

        .button-text {
            position: relative;
            z-index: 1;
        }

        .button-glitch {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 255, 0.3);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }

        .cyber-submit:not(:disabled):hover .button-glitch {
            transform: translateX(100%);
        }

        @media (max-width: 768px) {
            .cyber-grid {
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
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= REQUIRED_SCORE;
    
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    
    if (passed) {
        document.getElementById('success-result').style.display = 'block';
        document.getElementById('fail-result').style.display = 'none';
        
        try {
            // Send request to your backend to assign the role
            const response = await fetch('http://digi.pylex.xyz:9990/assign-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUserId,
                    roleId: DISCORD_ROLE_ID,
                    passed: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to assign role');
            }
        } catch (error) {
            console.error('Error:', error);
            // Still show success but note the role assignment issue
            showError('Quiz passed but role assignment failed. Please contact an administrator.');
        }
    } else {
        document.getElementById('success-result').style.display = 'none';
        document.getElementById('fail-result').style.display = 'block';
    }
}

// Make functions available globally
window.loginWithDiscord = loginWithDiscord;
window.handleAnswer = handleAnswer;
window.submitQuiz = submitQuiz;
