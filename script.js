// Game Configuration
const CONFIG = {
    GAME_DURATION: 10,
    SPAWN_RATE: 400,
    BOMB_CHANCE: 0.15, // 15% chance for bomb
    COIN_CHANCE: 0.8, // 80% chance for coin in envelope
    ENVELOPE_TYPES: ['🧧', '💰', '🎁', '🏮', '🐯']
};

// DOM Elements
const bgSlideshow = document.getElementById('bg-slideshow');
const sosWarning = document.getElementById('sos-warning');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const finalCoinsEl = document.getElementById('final-coins');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameState = {
    isActive: false,
    score: 0,
    coins: 0,
    timeLeft: CONFIG.GAME_DURATION,
    intervals: {
        game: null,
        spawn: null,
        slide: null,
        bombCheck: null
    }
};

// Background Images
const bgImages = ['background.jpg', 'photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
let currentSlide = 0;

// Initialization
function init() {
    initSlideshow();
    restartBtn.addEventListener('click', startGame);
    startGame();
}

// Slideshow Logic
function initSlideshow() {
    bgSlideshow.innerHTML = '';
    bgImages.forEach((src, index) => {
        const div = document.createElement('div');
        div.classList.add('bg-slide');
        div.style.backgroundImage = `url('${src}')`;
        if (index === 0) div.classList.add('active');
        bgSlideshow.appendChild(div);
    });

    if (gameState.intervals.slide) clearInterval(gameState.intervals.slide);
    gameState.intervals.slide = setInterval(nextSlide, 3000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.bg-slide');
    if (slides.length < 2) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Game Logic
function startGame() {
    // Reset State
    gameState.isActive = true;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.timeLeft = CONFIG.GAME_DURATION;
    
    // Reset UI
    scoreEl.textContent = '0';
    coinsEl.textContent = '0';
    timerEl.textContent = gameState.timeLeft;
    gameOverModal.classList.add('hidden');
    sosWarning.classList.add('hidden');
    
    // Clear existing elements
    document.querySelectorAll('.envelope, .bomb, .popup').forEach(el => el.remove());

    // Start Loops
    if (gameState.intervals.game) clearInterval(gameState.intervals.game);
    if (gameState.intervals.spawn) clearInterval(gameState.intervals.spawn);
    
    gameState.intervals.game = setInterval(updateTimer, 1000);
    gameState.intervals.spawn = setInterval(spawnItem, CONFIG.SPAWN_RATE);
}

function updateTimer() {
    gameState.timeLeft--;
    timerEl.textContent = gameState.timeLeft;
    if (gameState.timeLeft <= 0) endGame();
}

function spawnItem() {
    if (!gameState.isActive) return;

    // Decide what to spawn
    const isBomb = Math.random() < CONFIG.BOMB_CHANCE;
    
    if (isBomb) {
        createBomb();
    } else {
        createEnvelope();
    }
}

function createEnvelope() {
    const el = document.createElement('div');
    el.classList.add('envelope');
    
    // Content
    const pattern = CONFIG.ENVELOPE_TYPES[Math.floor(Math.random() * CONFIG.ENVELOPE_TYPES.length)];
    el.textContent = pattern;
    
    // Coin Data
    if (Math.random() < CONFIG.COIN_CHANCE) {
        el.dataset.coinValue = Math.floor(Math.random() * 5) + 1; // 1-5 coins
    }
    
    setupFallingElement(el);
    
    // Interaction
    const clickHandler = (e) => {
        e.preventDefault();
        if (!gameState.isActive) return;
        
        // Update Score
        gameState.score++;
        scoreEl.textContent = gameState.score;
        showPopup(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, '+1', 'score-popup');

        // Update Coins
        if (el.dataset.coinValue) {
            const val = parseInt(el.dataset.coinValue);
            gameState.coins += val;
            coinsEl.textContent = gameState.coins;
            showPopup(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, `🪙 +${val}`, 'coin-popup');
        }

        el.remove();
    };
    
    el.addEventListener('mousedown', clickHandler);
    el.addEventListener('touchstart', clickHandler);
}

function createBomb() {
    const el = document.createElement('div');
    el.classList.add('bomb');
    el.textContent = '💣';
    
    setupFallingElement(el);
    
    // Interaction
    const clickHandler = (e) => {
        e.preventDefault();
        if (!gameState.isActive) return;
        
        // Punishment
        gameState.score = 0;
        gameState.coins = 0;
        scoreEl.textContent = '0';
        coinsEl.textContent = '0';
        
        // Effect
        showPopup(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, '💥 BOOM!', 'boom-popup');
        sosWarning.classList.remove('hidden');
        setTimeout(() => sosWarning.classList.add('hidden'), 1000); // Quick flash

        el.remove();
    };
    
    el.addEventListener('mousedown', clickHandler);
    el.addEventListener('touchstart', clickHandler);
}

function setupFallingElement(el) {
    // Position
    const x = Math.random() * (window.innerWidth - 80);
    el.style.left = `${x}px`;
    
    // Animation Speed
    const speeds = ['fall-fast', 'fall-medium', 'fall-slow'];
    el.classList.add(speeds[Math.floor(Math.random() * speeds.length)]);
    
    // Append to Body (Crucial for visibility)
    document.body.appendChild(el);
    
    // Cleanup
    el.addEventListener('animationend', () => el.remove());
}

function showPopup(x, y, text, className) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}

function endGame() {
    gameState.isActive = false;
    clearInterval(gameState.intervals.game);
    clearInterval(gameState.intervals.spawn);
    
    finalScoreEl.textContent = gameState.score;
    finalCoinsEl.textContent = gameState.coins;
    gameOverModal.classList.remove('hidden');
    
    // Confetti
    // Simple implementation for now, could be enhanced
}

// Start
init();
