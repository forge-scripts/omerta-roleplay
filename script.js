// Initialize Lucide icons
lucide.createIcons();

// Server Configuration
const SERVER_CONFIG = {
    ip: 'connect.omertarp.com:30120',
    discord: 'https://discord.gg/your-discord',
    maxPlayers: 64
};

// Translations
const TRANSLATIONS = {
    ipCopied: 'IP Kopiran!',
    loading: 'Učitavanje...',
    connect: '<i data-lucide="power"></i><span>Pridruži se</span><span class="server-status">Igrači: <span id="playerCount">0</span>/64</span>'
};

// DOM Elements
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const connectButton = document.getElementById('connectButton');
const discordButton = document.getElementById('discordButton');
const playerCount = document.getElementById('playerCount');
const discordMembers = document.getElementById('discordMembers');
const serverStatus = document.getElementById('serverStatus');
const serverPing = document.getElementById('serverPing');

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;

    // Add background blur on scroll
    if (currentScroll > 50) {
        navbar.style.background = 'var(--nav-bg)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
});

// Active Section Highlighting
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Feature Cards Animation with Enhanced Hover
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const featureCards = document.querySelectorAll('.feature-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

featureCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Connect Button Functionality
connectButton.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Copy IP to clipboard
    try {
        await navigator.clipboard.writeText(SERVER_CONFIG.ip);
        const originalText = connectButton.innerHTML;
        connectButton.innerHTML = `<i data-lucide="check"></i><span>${TRANSLATIONS.ipCopied}</span>`;
        lucide.createIcons();
        
        // Reset button after 2 seconds
        setTimeout(() => {
            connectButton.innerHTML = TRANSLATIONS.connect;
            lucide.createIcons();
        }, 2000);
    } catch (err) {
        console.error('Failed to copy IP:', err);
    }

    // Launch FiveM
    setTimeout(() => {
        window.location.href = `fivem://connect/${SERVER_CONFIG.ip}`;
    }, 500);
});

// Enhanced Button Animations
const addButtonHoverEffect = (button) => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 10px 20px rgba(56, 189, 248, 0.2)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
};

// Apply hover effects to buttons
addButtonHoverEffect(connectButton);
addButtonHoverEffect(discordButton);

// Simulate Server Status Updates
function updateServerStatus() {
    // Simulate player count (replace with actual API call)
    const currentPlayers = Math.floor(Math.random() * SERVER_CONFIG.maxPlayers);
    playerCount.textContent = `${currentPlayers}`;
    
    // Simulate Discord members (replace with actual API call)
    const discordCount = Math.floor(Math.random() * 1000) + 500;
    discordMembers.textContent = discordCount.toLocaleString();
    
    // Simulate server ping (replace with actual API call)
    const ping = Math.floor(Math.random() * 30) + 10;
    serverPing.textContent = `${ping}ms`;
}

// Update status every 30 seconds
updateServerStatus();
setInterval(updateServerStatus, 30000);

// Enhanced Parallax Effect
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const parallaxSpeed = 0.5;
    hero.style.backgroundPositionY = `${scroll * parallaxSpeed}px`;
});

// Glitch effect for title
const glitchText = document.querySelector('.glitch');
if (glitchText) {
    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchText.style.textShadow = `
                ${Math.random() * 10}px ${Math.random() * 10}px ${Math.random() * 10}px rgba(0, 255, 242, 0.8),
                ${Math.random() * -10}px ${Math.random() * 10}px ${Math.random() * 10}px rgba(255, 0, 0, 0.8),
                ${Math.random() * 10}px ${Math.random() * -10}px ${Math.random() * 10}px rgba(0, 0, 255, 0.8)
            `;
            setTimeout(() => {
                glitchText.style.textShadow = 'var(--neon-glow)';
            }, 50);
        }
    }, 50);
}

// Cyber lines animation
const cyberLines = document.querySelector('.cyber-lines');
if (cyberLines) {
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        cyberLines.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    });
} 