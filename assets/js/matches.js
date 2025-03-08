var score = 0;
var count = 0;
var flag = 0;
var images = [];
var tiles = document.querySelectorAll(".thumbnail");
var scoreDisplay = document.querySelector("#score");
var finScore = document.querySelector("#final");
var timerDisplay = document.querySelector("#timer");
var selectedBorderStyle = "1px solid black";
var gameStartTime;
var timerInterval;
var baseScore = { match: 25, mismatch: -5 };
var isLocked = false;
var openedTiles = []; // Array for storing opened tiles
var bgMusic = document.getElementById('bgMusic');
var victorySound = document.getElementById('victorySound');
var openCardSound = document.getElementById('openCardSound');
var matchSound = document.getElementById('matchSound');
var dismatchSound = document.getElementById('dismatchSound');
var musicBtn = document.getElementById('musicBtn');
var isMusicPlaying = false;

// Initialize tiles
function initializeTiles() {
	tiles.forEach(function (tile) {
		tile.style.backgroundColor = "black";
		tile.style.backgroundImage = "none";
		tile.style.opacity = "1";
		tile.style.border = "";
		tile.style.backgroundSize = "cover";
		tile.style.backgroundPosition = "center";
	});
	openedTiles = [];
}

initializeTiles();
driver();

function startTimer() {
	clearInterval(timerInterval);
	gameStartTime = Date.now();
	timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
	clearInterval(timerInterval);
}

function updateTimer() {
	const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
	const minutes = Math.floor(elapsedTime / 60);
	const seconds = elapsedTime % 60;
	timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function calculateTimeBonus() {
	const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
	const maxBonus = 2.0; // Maximum multiplier for fast play
	const minBonus = 0.5; // Minimum multiplier for slow play
	const optimalTime = 60; // Optimal time in seconds
	const timeBonus = Math.max(minBonus, Math.min(maxBonus, 
		optimalTime / Math.max(elapsedSeconds, optimalTime/maxBonus)));
	return timeBonus;
}

function updateScore() {
	let scoreStr = Math.abs(score).toString().padStart(3, '0');
	if (score < 0) {
		scoreStr = '-' + scoreStr;
	}
	scoreDisplay.textContent = scoreStr;
}

function resetTile(tile) {
	tile.style.backgroundColor = "black";
	tile.style.backgroundImage = "none";
	tile.style.opacity = "1";
	tile.style.border = "";
	tile.style.backgroundSize = "cover";
	tile.style.backgroundPosition = "center";
}

function driver() {
	images = generateRandImages(8);
	score = 0;
	updateScore();
	count1 = 0;
	let isFirstClick = true; // Flag to track first click
	initializeTiles();
	
	// Remove old event listeners
	tiles.forEach(tile => {
		const newTile = tile.cloneNode(true);
		tile.parentNode.replaceChild(newTile, tile);
	});
	
	// Update tile references after cloning
	tiles = document.querySelectorAll(".thumbnail");
	
	// Add event listeners
	tiles.forEach(function (tile, index) {
		tile.addEventListener("click", function () {
			if (isLocked) return;
			if (tile.style.opacity === "0.5") return; // Skip already matched pairs
			if (openedTiles.includes(tile)) return; // Skip already opened card
			
			// Start timer on first click
			if (isFirstClick) {
				startTimer();
				startBackgroundMusic(); // Start background music
				isFirstClick = false;
			}
			
			// Open card
			tile.style.backgroundImage = images[index];
			tile.style.backgroundColor = "transparent";
			tile.style.border = selectedBorderStyle;
			openedTiles.push(tile);
			
			// Play card open sound
			openCardSound.currentTime = 0;
			openCardSound.volume = 0.3;
			openCardSound.play();
			
			// If two cards are opened
			if (openedTiles.length === 2) {
				isLocked = true;
				
				setTimeout(function () {
					const timeBonus = calculateTimeBonus();
					const [firstTile, secondTile] = openedTiles;
					
					if (firstTile.style.backgroundImage === secondTile.style.backgroundImage) {
						// Match
						firstTile.style.opacity = "0.5";
						secondTile.style.opacity = "0.5";
						firstTile.style.border = "1px solid rgba(255, 255, 255, 0.3)";
						secondTile.style.border = "1px solid rgba(255, 255, 255, 0.3)";
						score += Math.round(baseScore.match * timeBonus);
						count1++;
						
						// Play match sound
						matchSound.currentTime = 0;
						matchSound.volume = 0.4;
						matchSound.play();
					} else {
						// Mismatch
						resetTile(firstTile);
						resetTile(secondTile);
						score += Math.round(baseScore.mismatch * timeBonus);
						
						// Play mismatch sound
						dismatchSound.currentTime = 0;
						dismatchSound.volume = 0.3;
						dismatchSound.play();
					}
					
					updateScore();
					if (count1 === 8) {
						stopTimer();
						finScore.textContent = score;
						playVictorySound();
						$("#congrat").modal();
					}
					
					openedTiles = [];
					isLocked = false;
				}, 1000);
			}
		});
	});
}

function win() {
	flag = 0;
	for (i = 0; i < 16; i++) {
		if (tiles[i].style.backgroundImage !== "none") {
			flag = 1;
		}
	}
	return flag;
}

// Make array of random images
function generateRandImages(num) {
	var arr = [];
	for (var i = 0; i < num; i++) {
		arr.push(`url('assets/images/image_${i + 1}.jpg')`);
	}
	var uniques = chance.unique(chance.natural, 8, { min: 0, max: 7 });
	for (i = 0; i < 8; i++) {
		arr.push(arr[uniques[i]]);
	}
	var as = [];
	var uniques = chance.unique(chance.natural, 16, { min: 0, max: 15 });
	for (var i = 0; i < 16; i++) {
		as.push(arr[uniques[i]]);
	}
	return as;
}

// Init function
function init() {
	stopTimer();
	timerDisplay.textContent = "00:00"; // Reset timer display
	score = 0;
	count = 0;
	count1 = 0;
	isLocked = false;
	driver();
}

function shareOnX() {
	const score = document.getElementById('final').textContent;
	const text = `HEY @SuccinctLabs I JUST DID ${score} IN GUESS PROOVE GAME, TRY THIS OUT HERE https://proof-of-match.vercel.app/ MADE BY @0xlowadka `;
	const url = `https://x.com/compose/post?text=${encodeURIComponent(text)}`;
	window.open(url, '_blank');
}

function toggleMusic() {
	if (isMusicPlaying) {
		bgMusic.pause();
		musicBtn.classList.add('muted');
		isMusicPlaying = false;
	} else {
		bgMusic.volume = 0.25; // Set volume to 25%
		bgMusic.play();
		musicBtn.classList.remove('muted');
		isMusicPlaying = true;
	}
}

// Automatically start background music on first card click
function startBackgroundMusic() {
	if (!isMusicPlaying) {
		toggleMusic();
	}
}

function playVictorySound() {
	// Lower background music volume
	if (isMusicPlaying) {
		bgMusic.volume = 0.05; // Reduce to 5% during victory sound
	}
	
	// Play victory sound
	victorySound.volume = 1.0;
	victorySound.play();
	
	// Restore background music volume after 4 seconds
	setTimeout(() => {
		if (isMusicPlaying) {
			bgMusic.volume = 0.25; // Return to 25%
		}
	}, 4000);
}
