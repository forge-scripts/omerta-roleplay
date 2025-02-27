// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496'; // Your Discord Client ID
const DISCORD_REDIRECT_URI = window.location.hostname === 'localhost' 
    ? 'http://localhost:5500/whitelist.html'
    : 'https://benjy244.github.io/omerta-roleplay/whitelist.html';
const BOT_ENDPOINT = window.location.hostname === 'localhost'
    ? 'http://localhost:9990'
    : 'http://digi.pylex.xyz:9990'; // Updated to your hosted bot URL
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

// Store user ID when logged in
let currentUserId = null;

// Discord OAuth2 configuration
const config = {
    botApiUrl: 'http://localhost:9990',  // Change this to your bot's URL when deployed
    clientId: '1238809630008938496',
    redirectUri: 'https://benjy244.github.io/omerta-roleplay/whitelist.html',
    scope: 'identify guilds'
};

let userId = null;

// Function to handle Discord login
async function handleLogin() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
        try {
            // Get user info from Discord
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const user = await response.json();
            userId = user.id;
            
            // Show quiz section after successful login
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('quiz-section').style.display = 'block';
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
}

// Function to submit quiz answers
async function submitQuiz() {
    if (!userId) {
        alert('Please login with Discord first');
        return;
    }

    // Calculate score
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= REQUIRED_SCORE;

    try {
        // Call bot API to assign role
        const response = await fetch(`${BOT_ENDPOINT}/assign-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                passed: passed,
                score: score
            })
        });

        const result = await response.json();
        console.log('Role assignment response:', result);

        // Hide quiz section
        document.getElementById('quiz-section').style.display = 'none';

        if (result.success) {
            // Show success message
            document.getElementById('success-section').style.display = 'block';
            document.getElementById('error-section').style.display = 'none';
        } else {
            // Show error message
            document.getElementById('error-section').style.display = 'block';
            document.getElementById('success-section').style.display = 'none';
            document.getElementById('error-message').textContent = result.error || 'Failed to assign role';
        }
    } catch (error) {
        console.error('Error assigning role:', error);
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('error-section').style.display = 'block';
        document.getElementById('success-section').style.display = 'none';
        document.getElementById('error-message').textContent = 'Connection error. Please try again.';
    }
}

// Function to check cooldown
async function checkCooldown() {
    if (!userId) return;

    try {
        const response = await fetch(`${config.botApiUrl}/check-cooldown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        const result = await response.json();
        if (result.onCooldown) {
            document.getElementById('quiz-section').style.display = 'none';
            document.getElementById('cooldown-section').style.display = 'block';
            document.getElementById('cooldown-time').textContent = 
                `${result.remainingTime.hours}h ${result.remainingTime.minutes}m`;
        }
    } catch (error) {
        console.error('Error checking cooldown:', error);
    }
}

// Initialize login handling
window.onload = () => {
    handleLogin();
    
    // Add click handler for login button
    document.getElementById('login-button').addEventListener('click', () => {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'token',
            scope: config.scope
        });
        
        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    });
};

// Update the startQuiz function
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

    // Initialize Lucide icons after adding them to DOM
    lucide.createIcons();
    
    // Enable submit button only when all questions are answered
    const submitBtn = document.getElementById('submitQuiz');
    submitBtn.disabled = true;
}

// Handle Answer Selection
function handleAnswer(questionIndex, answerIndex) {
    userAnswers[questionIndex] = answerIndex;
    
    // Update visual state for all options in the question
    const questionOptions = document.querySelectorAll(`input[name="q${questionIndex}"]`);
    questionOptions.forEach((option, index) => {
        const label = option.closest('.option');
        if (index === answerIndex) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });

    // Enable/disable submit button
    const submitBtn = document.getElementById('submitQuiz');
    submitBtn.disabled = userAnswers.includes(null);
}

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
