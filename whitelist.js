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
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    
    const quizSection = document.getElementById('quiz-section');
    quizSection.innerHTML = `
        <div class="quiz-container">
            <div class="progress-bar">
                <div class="progress-text">0/${questions.length} Questions</div>
                <div class="progress-fill"></div>
            </div>
            ${questions.map((q, i) => `
                <div class="question-card" data-question="${i}">
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
            <button id="submitQuiz" onclick="submitQuiz()" class="cyber-button" disabled>
                <span class="cyber-button-text">PREDAJ TEST</span>
                <div class="cyber-button-glitch"></div>
            </button>
        </div>
    `;

    // Add this CSS to your whitelist-styles.css
    const style = document.createElement('style');
    style.textContent = `
        .quiz-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .progress-bar {
            background: rgba(0, 255, 255, 0.1);
            height: 10px;
            border-radius: 5px;
            margin-bottom: 30px;
            position: relative;
        }

        .progress-fill {
            background: cyan;
            height: 100%;
            width: 0%;
            border-radius: 5px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px cyan;
        }

        .progress-text {
            position: absolute;
            right: 0;
            top: -25px;
            color: cyan;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
        }

        .question-card {
            background: rgba(16, 24, 39, 0.8);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }

        .question-number {
            margin-bottom: 15px;
        }

        .cyber-text {
            color: cyan;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .cyber-question {
            color: white;
            font-size: 20px;
            margin-bottom: 25px;
            line-height: 1.4;
        }

        .options-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .option-card {
            position: relative;
        }

        .option-card input[type="radio"] {
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

        .option-border {
            position: absolute;
            inset: 0;
            border: 1px solid transparent;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .cyber-option:hover .option-border {
            border-color: cyan;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }

        .option-card input[type="radio"]:checked + .cyber-option {
            background: rgba(0, 255, 255, 0.1);
            border-color: cyan;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .option-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .option-number {
            color: cyan;
            font-weight: 600;
            font-size: 16px;
        }

        .option-text {
            color: white;
            font-size: 16px;
        }

        .cyber-button {
            width: 100%;
            padding: 15px 30px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid cyan;
            border-radius: 8px;
            color: cyan;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 2px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            margin-top: 30px;
        }

        .cyber-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .cyber-button:not(:disabled):hover {
            background: rgba(0, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }

        .cyber-button-text {
            position: relative;
            z-index: 1;
        }

        .cyber-button-glitch {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 255, 0.3);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }

        .cyber-button:not(:disabled):hover .cyber-button-glitch {
            transform: translateX(100%);
        }

        @media (max-width: 768px) {
            .options-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

window.handleAnswer = function(questionIndex, answerIndex) {
    userAnswers[questionIndex] = answerIndex;
    
    // Update progress bar
    const answered = userAnswers.filter(answer => answer !== null).length;
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${(answered / questions.length) * 100}%`;
        progressText.textContent = `${answered}/${questions.length} Questions`;
    }

    // Enable submit button if all questions are answered
    const submitButton = document.getElementById('submitQuiz');
    if (submitButton) {
        submitButton.disabled = userAnswers.includes(null);
    }
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
