const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const playerHand = document.getElementById('player-hand');

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
let timeLeft = 20;
let gameInterval;
let spawnInterval;
let slideInterval; // New interval for slides
let isGameActive = false;

// Config
const SPAWN_RATE = 400; // ms between spawns
const GAME_DURATION = 20; // seconds

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
    timeLeft = GAME_DURATION;
    isGameActive = true;
    
    // Update UI
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    gameOverModal.classList.add('hidden');
    
    // Clear existing envelopes
    const envelopes = document.querySelectorAll('.envelope');
    envelopes.forEach(e => e.remove());
    
    // Start timers
    gameInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnEnvelope, SPAWN_RATE);
}

function updateTimer() {
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function spawnEnvelope() {
    if (!isGameActive) return;

    const envelope = document.createElement('div');
    envelope.classList.add('envelope');
    envelope.textContent = '🧧';
    
    // Random position
    const x = Math.random() * (window.innerWidth - 60); // Subtract width of envelope
    envelope.style.left = `${x}px`;
    
    // Random fall speed (between 2s and 5s)
    const duration = Math.random() * 3 + 2;
    envelope.style.animationDuration = `${duration}s`;
    
    // Click handler
    envelope.addEventListener('mousedown', (e) => handleEnvelopeClick(e, envelope));
    envelope.addEventListener('touchstart', (e) => handleEnvelopeClick(e, envelope)); // Mobile support

    // Remove when animation ends (to keep DOM clean)
    envelope.addEventListener('animationend', () => {
        if (envelope.parentNode) {
            envelope.remove();
        }
    });
    
    gameContainer.appendChild(envelope);
}

function handleEnvelopeClick(e, envelope) {
    if (!isGameActive) return;
    e.preventDefault(); // Prevent double firing on touch devices

    // Visual feedback
    score++;
    scoreEl.textContent = score;
    
    // Show +1 effect
    showScorePopup(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    
    // Move hand to click position
    moveHand(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);

    // Remove envelope
    envelope.remove();
}

function moveHand(x, y) {
    playerHand.style.left = `${x}px`;
    playerHand.style.top = `${y}px`;
    playerHand.style.bottom = 'auto'; // Override initial css
    playerHand.style.transform = 'translate(-50%, -20%)'; // Adjust so finger tip is near click
    
    // Trigger animation
    playerHand.classList.remove('hand-grab');
    void playerHand.offsetWidth; // Trigger reflow
    playerHand.classList.add('hand-grab');
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
