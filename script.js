const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const timerEl = document.getElementById('timer');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const finalCoinsEl = document.getElementById('final-coins');
const restartBtn = document.getElementById('restart-btn');
// const sosEl = document.getElementById('sos-warning'); // Removed

// Background Slideshow Config
const bgSlideshow = document.getElementById('bg-slideshow');
// Add your photo filenames here
const bgImages = [
    'background.jpg',
    'photo1.jpg',
    'photo2.jpg',
    'photo3.jpg',
    'photo4.jpg',
    'photo5.jpg',
    'photo6.jpg',
    'photo7.jpg',
    'photo8.jpg',
    'photo9.jpg'
]; 
let currentSlide = 0;

let score = 0;
let coinScore = 0;
let timeLeft = 20;
let gameInterval;
let spawnInterval;
let bombInterval;
let slideInterval; // New interval for slides
let isGameActive = false;

// Config
const SPAWN_RATE = 400; // ms between spawns
const GAME_DURATION = 30; // Increased duration for bomb fun
const BOMB_CHANCE = 0.15; // Chance for bomb cycle
const ENVELOPE_TYPES = ['🧧', '💰', '🎁', '🏮', '🐯']; // Richer patterns

function init() {
    initSlideshow();
    restartBtn.addEventListener('click', startGame);
    startGame();
}

function initSlideshow() {
    bgSlideshow.innerHTML = '';
    
    // Create slide elements
    bgImages.forEach((src, index) => {
        const div = document.createElement('div');
        div.classList.add('bg-slide');
        div.style.backgroundImage = `url('${src}')`;
        if (index === 0) div.classList.add('active');
        bgSlideshow.appendChild(div);
    });

    // Start cycling if we have multiple images
    if (bgImages.length > 1) {
        // Clear any existing interval to prevent duplicates
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000); // Change every 3 seconds
    }
}

function nextSlide() {
    const slides = document.querySelectorAll('.bg-slide');
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

function startGame() {
    // Reset state
    score = 0;
    coinScore = 0;
    timeLeft = GAME_DURATION;
    isGameActive = true;
    
    // Update UI
    scoreEl.textContent = score;
    coinsEl.textContent = coinScore;
    timerEl.textContent = timeLeft;
    gameOverModal.classList.add('hidden');
    // sosEl.classList.add('hidden'); // Removed
    
    // Clear existing envelopes
    const envelopes = document.querySelectorAll('.envelope');
    envelopes.forEach(e => e.remove());
    
    // Start timers
    gameInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnEnvelope, SPAWN_RATE);
    // Removed scheduleNextBomb();
}

// Removed scheduleNextBomb and triggerBombSequence

function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function spawnEnvelope() {
    if (!isGameActive) return;

    // Small chance to spawn a bomb instead of an envelope (15%)
    if (Math.random() < 0.15) {
        spawnBomb();
        return;
    }

    const envelope = document.createElement('div');
    envelope.classList.add('envelope');
    
    // Richer patterns
    const pattern = ENVELOPE_TYPES[Math.floor(Math.random() * ENVELOPE_TYPES.length)];
    envelope.textContent = pattern;
    
    // 80% chance to have a coin
    if (Math.random() < 0.8) {
        envelope.dataset.hasCoin = 'true';
        // Random coin value 1-5
        envelope.dataset.coinValue = Math.floor(Math.random() * 5) + 1;
    }

    // Random position
    const x = Math.random() * (window.innerWidth - 80); // Subtract width of envelope
    envelope.style.left = `${x}px`;
    
    // Explicitly append to body to avoid container clipping
    document.body.appendChild(envelope);
    
    // Random fall speed class
    const speeds = ['fall-fast', 'fall-medium', 'fall-slow'];
    envelope.classList.add(speeds[Math.floor(Math.random() * speeds.length)]);
    
    // Click handler
    envelope.addEventListener('mousedown', (e) => handleEnvelopeClick(e, envelope));
    envelope.addEventListener('touchstart', (e) => handleEnvelopeClick(e, envelope)); // Mobile support

    // Remove when animation ends (to keep DOM clean)
    envelope.addEventListener('animationend', () => {
        if (envelope.parentNode) {
            envelope.remove();
        }
    });
    
    // gameContainer.appendChild(envelope); // Removed
}

function spawnBomb() {
    const bomb = document.createElement('div');
    bomb.classList.add('envelope', 'bomb'); // Reuse envelope physics but add bomb style
    bomb.textContent = '💣';
    
    const x = Math.random() * (window.innerWidth - 80);
    bomb.style.left = `${x}px`;
    
    // Explicitly append to body
    document.body.appendChild(bomb);
    
    // Random fall speed class
    const speeds = ['fall-fast', 'fall-medium', 'fall-slow'];
    bomb.classList.add(speeds[Math.floor(Math.random() * speeds.length)]);
    
    bomb.addEventListener('mousedown', (e) => handleBombClick(e, bomb));
    bomb.addEventListener('touchstart', (e) => handleBombClick(e, bomb));
    
    bomb.addEventListener('animationend', () => {
        if (bomb.parentNode) bomb.remove();
    });
    
    // gameContainer.appendChild(bomb); // Removed
}

function handleBombClick(e, bomb) {
    if (!isGameActive) return;
    e.preventDefault();
    
    // Reset scores
    score = 0;
    coinScore = 0;
    scoreEl.textContent = 0;
    coinsEl.textContent = 0;
    
    // Boom effect
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    
    showBoomEffect(x, y);
    bomb.remove();
}

function showBoomEffect(x, y) {
    const boom = document.createElement('div');
    boom.textContent = '💥 BOOM!';
    boom.style.position = 'absolute';
    boom.style.left = `${x}px`;
    boom.style.top = `${y}px`;
    boom.style.transform = 'translate(-50%, -50%)';
    boom.style.fontSize = '80px';
    boom.style.color = 'red';
    boom.style.fontWeight = 'bold';
    boom.style.zIndex = '100';
    boom.style.textShadow = '0 0 10px yellow';
    boom.style.pointerEvents = 'none';
    
    // Simple fade out
    boom.animate([
        { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
    
    gameContainer.appendChild(boom);
    setTimeout(() => boom.remove(), 500);
}

function handleEnvelopeClick(e, envelope) {
    if (!isGameActive) return;
    e.preventDefault(); // Prevent double firing on touch devices

    // Visual feedback
    score++;
    scoreEl.textContent = score;

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    // Check for coin
    if (envelope.dataset.hasCoin === 'true') {
        const val = parseInt(envelope.dataset.coinValue);
        coinScore += val;
        coinsEl.textContent = coinScore;
        showCoinPopup(clientX, clientY, val);
    }

    // Show +1 effect for just score
    showScorePopup(clientX, clientY);
    
    // Move hand to click position (Removed)
    // moveHand(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);

    // Remove envelope
    envelope.remove();
}

// Removed moveHand function

function showCoinPopup(x, y, val) {
    const popup = document.createElement('div');
    popup.classList.add('coin-popup');
    popup.textContent = `🪙 +${val}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    gameContainer.appendChild(popup);
    
    popup.addEventListener('animationend', () => {
        popup.remove();
    });
}

function showScorePopup(x, y) {
    const popup = document.createElement('div');
    popup.classList.add('score-popup');
    popup.textContent = '+1';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    gameContainer.appendChild(popup);
    
    popup.addEventListener('animationend', () => {
        popup.remove();
    });
}

function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    if (bombInterval) clearTimeout(bombInterval);
    // sosEl.classList.add('hidden'); // Removed
    
    finalScoreEl.textContent = score;
    finalCoinsEl.textContent = coinScore;
    gameOverModal.classList.remove('hidden');
    
    // Trigger confetti
    createConfetti();
}

function createConfetti() {
    const container = document.getElementById('congrats-anim');
    container.innerHTML = ''; // Clear previous
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 1}s`;
        container.appendChild(confetti);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    // Optional: adjust active envelopes if needed
});

// Start the game on load
init();
