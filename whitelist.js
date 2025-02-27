// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1238809630008938496'; // Your Discord Client ID
const DISCORD_REDIRECT_URI = 'https://benjy244.github.io/omerta-roleplay/whitelist.html'; // Production URL
// If using Live Server in VS Code, it typically uses port 5500
// If using a different port, adjust accordingly
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
const REQUIRED_SCORE = 6; // Out of 7 questions

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

// Function to handle Discord login
function loginWithDiscord() {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'token',
        scope: 'identify',
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// Wait for DOM to load and add click event listener
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('discordLoginBtn');
    if (loginButton) {
        loginButton.onclick = loginWithDiscord; // Direct assignment of function
        console.log('Discord login button initialized'); // Debug log
    } else {
        console.error('Login button not found'); // Debug log
    }
});

// Add this function to check cooldown before starting quiz
async function checkCooldown() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    
    try {
        // First get user info from Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const userData = await userResponse.json();
        currentUserId = userData.id;

        // Then check cooldown
        const cooldownResponse = await fetch('http://localhost:3001/check-cooldown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUserId })
        });
        const cooldownData = await cooldownResponse.json();

        if (cooldownData.onCooldown) {
            // Hide other sections
            document.getElementById('login-section').classList.remove('active');
            document.getElementById('quiz-section').classList.remove('active');
            
            // Show cooldown section
            document.getElementById('cooldown-section').classList.add('active');
            
            // Update cooldown timer text
            const { hours, minutes } = cooldownData.remainingTime;
            document.getElementById('cooldown-timer').textContent = 
                `Preostalo vrijeme: ${hours} sati i ${minutes} minuta`;
            
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking cooldown:', error);
        return false;
    }
}

// Modify your existing login handler
window.addEventListener('load', async () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    
    if (accessToken) {
        try {
            const canStart = await checkCooldown();
            if (canStart) {
                startQuiz();
            } else {
                // Show cooldown message in UI
                document.getElementById('login-section').classList.remove('active');
                document.getElementById('cooldown-section').classList.add('active');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

// Generate Quiz UI
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

// Update your submit quiz handler
document.getElementById('submitQuiz')?.addEventListener('click', async () => {
    const score = userAnswers.reduce((acc, answer, index) => 
        answer === questions[index].correct ? acc + 1 : acc, 0);
    
    const passed = score >= REQUIRED_SCORE;
    
    try {
        const response = await fetch('https://your-api-domain.com/assign-role', {  // Replace with your actual API domain
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUserId,
                passed: passed,
                score: score
            })
        });

        const data = await response.json();
        
        document.getElementById('quiz-section').classList.remove('active');
        document.getElementById('result-section').classList.add('active');
        
        if (passed) {
            document.getElementById('success-result').style.display = 'block';
            document.getElementById('fail-result').style.display = 'none';
        } else {
            document.getElementById('success-result').style.display = 'none';
            document.getElementById('fail-result').style.display = 'block';
            // Update fail message to include cooldown
            document.getElementById('fail-result').innerHTML = `
                <i data-lucide="x-circle"></i>
                <h3>Pokušajte Ponovno</h3>
                <p>Niste prošli whitelist. Molimo proučite pravila i pokušajte ponovno za 24 sata.</p>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error. Please try again.');
    }
});

// Initialize Lucide icons
lucide.createIcons();

function handleError(error) {
    console.error('Error:', error);
    // Add error handling UI if needed
}

// Example using Discord.js
const correctAnswers = new Map(); // Track user answers

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if answer is correct
    if (isCorrectAnswer(message.content)) {
        // Store correct answer for user
        if (!correctAnswers.has(message.author.id)) {
            correctAnswers.set(message.author.id, new Set());
        }
        correctAnswers.get(message.author.id).add(getCurrentQuestionNumber());
        
        // Check if all questions are answered
        if (hasAnsweredAllQuestions(message.author.id)) {
            try {
                // Get the role using the specific ID
                const role = message.guild.roles.cache.get('1344671671377858590');
                
                if (!role) {
                    console.error('Role not found');
                    return;
                }
                
                // Add the role to the user
                await message.member.roles.add(role);
                await message.reply('Congratulations! You\'ve completed all questions and received your new role!');
            } catch (error) {
                console.error('Error assigning role:', error);
                await message.reply('There was an error assigning your role. Please contact an administrator.');
            }
        }
    }
});

function isCorrectAnswer(answer) {
    // Your logic to check if answer is correct
    return true; // Replace with actual check
}

function getCurrentQuestionNumber() {
    // Your logic to get current question number
    return 1; // Replace with actual question number
}

function hasAnsweredAllQuestions(userId) {
    const userAnswers = correctAnswers.get(userId);
    const requiredQuestions = 5; // Set this to your total number of questions
    return userAnswers && userAnswers.size >= requiredQuestions;
} 
