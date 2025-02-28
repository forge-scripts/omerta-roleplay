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
let currentQuestion = 0;

function calculateScore() {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].correct) {
            score++;
        }
    }
    return score;
}

function selectAnswer(answerIndex) {
    userAnswers[currentQuestion] = answerIndex;
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(button => button.classList.remove('selected'));
    buttons[answerIndex].classList.add('selected');
}

function showQuestion() {
    const questionContainer = document.getElementById('question-container');
    const currentQ = questions[currentQuestion];
    
    let html = `
        <h3>${currentQ.question}</h3>
        <div class="answers">
    `;
    
    currentQ.options.forEach((answer, index) => {
        html += `
            <button class="answer-btn ${userAnswers[currentQuestion] === index ? 'selected' : ''}" 
                    onclick="selectAnswer(${index})">${answer}</button>
        `;
    });
    
    html += `</div>
        <button onclick="submitQuiz()" ${currentQuestion === questions.length - 1 ? '' : 'style="display:none;"'}>Submit Quiz</button>
        <button onclick="nextQuestion()" ${currentQuestion === questions.length - 1 ? 'style="display:none;"' : ''}>Next Question</button>
    `;
    
    questionContainer.innerHTML = html;
}

function nextQuestion() {
    if (userAnswers[currentQuestion] === undefined) {
        alert('Please select an answer before continuing.');
        return;
    }
    currentQuestion++;
    showQuestion();
}

async function submitQuiz() {
    if (userAnswers[currentQuestion] === undefined) {
        alert('Please select an answer before submitting.');
        return;
    }

    const score = calculateScore();
    const passingScore = Math.floor(questions.length * 0.8); // 80% passing threshold

    if (score >= passingScore) {
        try {
            const userId = localStorage.getItem('discord_user_id');
            if (!userId) {
                throw new Error('User ID not found. Please log in again.');
            }

            const response = await fetch('http://localhost:9990/add-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });

            const data = await response.json();

            if (data.success) {
                displayMessage(`Congratulations! You passed the test (${score}/${questions.length}) and received the role!`, 'success');
            } else {
                throw new Error(data.error || 'Failed to assign role');
            }
        } catch (error) {
            console.error('Error:', error);
            displayMessage(`Test je položen (${score}/${questions.length}), ali došlo je do greške pri dodjeljivanju uloge.\n\nGreška: ${error.message}\n\nMolimo kontaktirajte administratora.`, 'error');
        }
    } else {
        displayMessage(`You did not pass the test. Score: ${score}/${questions.length}. You need ${passingScore} correct answers to pass.`, 'error');
    }
}

function displayMessage(message, type) {
    const resultDiv = document.getElementById('quiz-results');
    if (!resultDiv) {
        const newDiv = document.createElement('div');
        newDiv.id = 'quiz-results';
        document.body.appendChild(newDiv);
    }
    const messageDiv = document.getElementById('quiz-results');
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
}

// Start the quiz when the page loads
function startQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    showQuestion();
}

// Make sure to call startQuiz when the page loads
window.onload = function() {
    if (document.getElementById('question-container')) {
        startQuiz();
    }
};

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
window.handleAnswer = selectAnswer;
window.submitQuiz = submitQuiz;
