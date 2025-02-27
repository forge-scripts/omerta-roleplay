// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496';
const DISCORD_REDIRECT_URI = window.location.hostname === 'localhost' 
    ? 'http://localhost:5500/whitelist.html'
    : 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const BOT_ENDPOINT = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'http://localhost:3001'; // When you host the bot, replace this with your hosted bot URL
const REQUIRED_SCORE = 6; // Out of 7 questions
const WHITELIST_ROLE_ID = '1344671671377858590';

// Quiz Questions
const questions = [
    {
        question: "Tijekom pljačke banke, vaš prijatelj iz stvarnog života je policajac koji vas lovi. Što ćete učiniti?",
        options: [
            "Reći mu preko Discord-a da vas pusti",
            "Ponašati se kao da ga ne poznajete i nastaviti roleplay",
            "Namjerno mu se predati jer je prijatelj",
            "Izbjegavati interakciju s njim"
        ],
        correct: 1
    },
    {
        question: "Što je pravilna reakcija kada vas netko upuca?",
        options: [
            "Odmah se ustati i nastaviti borbu",
            "Zvati admina da kazni igrača",
            "Roleplayati ozljede, tražiti medicinsku pomoć i zapamtiti detalje napadača",
            "Napustiti server u ljutnji"
        ],
        correct: 2
    },
    {
        question: "Pronašli ste bug koji vam omogućuje dupliciranje novca. Što je ispravno učiniti?",
        options: [
            "Iskoristiti bug ali samo malo",
            "Reći prijateljima da i oni iskoriste bug",
            "Prijaviti bug adminima s detaljnim opisom kako se reproducira",
            "Prodavati informaciju o bugu drugim igračima"
        ],
        correct: 2
    },
    {
        question: "Kako postupiti u situaciji kada vidite igrača koji koristi meta-gaming?",
        options: [
            "Snimiti dokaze i prijaviti staff timu bez konfrontacije",
            "Javno ga prozvati u chat-u",
            "Ignorirati situaciju",
            "Također početi koristiti meta-gaming"
        ],
        correct: 0
    },
    {
        question: "Što je pravilno raditi tijekom 'New Life Rule' nakon smrti karaktera?",
        options: [
            "Vratiti se odmah na mjesto smrti po svoje stvari",
            "Kontaktirati ubojicu i tražiti osvetu",
            "Zaboraviti sve okolnosti smrti i početi iznova",
            "Zvati prijatelje da se osvete ubojici"
        ],
        correct: 2
    },
    {
        question: "Tijekom pljačke, civil vam prilazi i snima mobitelom. Kako reagirate?",
        options: [
            "Upucate ga jer vam smeta",
            "Roleplayate prijetnju i tražite da prestane snimati",
            "Ignorirate ga jer je to samo igra",
            "Vrijeđate ga u chat-u"
        ],
        correct: 1
    },
    {
        question: "Što je pravilno činiti s 'Out Of Character' (OOC) informacijama?",
        options: [
            "Koristiti ih samo kad nam trebaju",
            "Nikada ih ne koristiti u IC situacijama",
            "Dijeliti ih s članovima bande",
            "Koristiti ih za prednost u igri"
        ],
        correct: 1
    }
];

let userAnswers = new Array(questions.length).fill(null);
let currentUserId = null;

// Function to handle Discord login
function loginWithDiscord() {
    console.log('Login button clicked'); // Debug log
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify guilds.join'
    });

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    console.log('Auth URL:', authUrl); // Debug log
    window.location.href = authUrl;
}

// Function to show error message
function showError(message) {
    console.log('Showing error:', message); // Debug log
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Function to start quiz
function startQuiz() {
    console.log('Starting quiz'); // Debug log
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

// Handle answer selection
function handleAnswer(questionIndex, answerIndex) {
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
}

// Main initialization
window.addEventListener('load', async () => {
    console.log('Page loaded'); // Debug log
    
    // Set up login button
    const loginButton = document.getElementById('discordLoginBtn');
    if (loginButton) {
        console.log('Login button found'); // Debug log
        loginButton.addEventListener('click', loginWithDiscord);
    } else {
        console.log('Login button not found'); // Debug log
    }

    // Check for Discord authentication response
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    
    if (accessToken) {
        console.log('Access token found'); // Debug log
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
            console.log('User data received:', userData.id); // Debug log
            currentUserId = userData.id;
            startQuiz();
        } catch (error) {
            console.error('Error during authentication:', error);
            showError('Failed to authenticate with Discord. Please try again.');
            document.getElementById('login-section').classList.add('active');
        }
    } else {
        console.log('No access token, showing login'); // Debug log
        document.getElementById('login-section').classList.add('active');
    }
});

// Handle quiz submission
document.getElementById('submitQuiz')?.addEventListener('click', async () => {
    console.log('Quiz submitted'); // Debug log
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    console.log('Score:', score); // Debug log
    const passed = score >= REQUIRED_SCORE;
    
    document.getElementById('quiz-section').classList.remove('active');
    document.getElementById('result-section').classList.add('active');
    
    if (passed) {
        console.log('Quiz passed, assigning role'); // Debug log
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

            console.log('Role assignment response:', response.status); // Debug log

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
        console.log('Quiz failed'); // Debug log
        document.getElementById('success-result').style.display = 'none';
        document.getElementById('fail-result').style.display = 'block';
    }
    
    lucide.createIcons();
});

// Initialize Lucide icons
lucide.createIcons();

function handleError(error) {
    console.error('Error:', error);
    // Add error handling UI if needed
}

// Add click event listener for login button
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('discordLoginBtn');
    if (loginButton) {
        loginButton.onclick = loginWithDiscord;
    }
}); 
