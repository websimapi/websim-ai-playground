// Global state
const state = {
  iteration: 5,
  elements: [],
  score: 0,
  power: 100,
  combo: 0,
  gameActive: true,
  level: 1,
  achievements: new Set(),
  powerups: [],
  specialEvents: {
    goldRush: false,
    chainReaction: false
  },
  config: {
    colors: ['#ff0066', '#00ff99', '#0066ff', '#ffcc00', '#ff9900', '#9933ff'],
    speed: 1.6,
    complexity: 4,
    shapes: ['circle', 'polygon', 'rect', 'star', 'diamond'],
    maxElements: 12,
    interactions: true,
    pointsPerClick: 10,
    powerDrainRate: 0.5,
    powerRegenRate: 0.2,
    comboTimeout: 2000,
    specialEventChance: 0.005,
    powerupChance: 0.02,
    chainReactionRadius: 100,
    levelUpThreshold: 1000,
    achievementPoints: {
      "First Steps": 100,
      "Combo Master": 500,
      "Power Player": 1000,
      "Shape Shifter": 2000
    },
    frequencyBands: {
      bass: { min: 20, max: 140 },
      mid: { min: 140, max: 2000 },
      treble: { min: 2000, max: 20000 }
    },
    visualEffects: {
      beatIntensity: 0,
      colorShift: 0,
      waveform: []
    }
  },
  audio: {
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    beatDetected: false
  }
};

// Utility functions
function randomPosition() {
  return {
    x: Math.random() * 700 + 50,
    y: Math.random() * 500 + 50
  };
}

function createStarPoints(cx, cy, points = 5, outerRadius = 30, innerRadius = 15) {
  let str = '';
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    str += `${x},${y} `;
  }
  return str.trim();
}

function createDiamondPoints(cx, cy, size = 30) {
  return `${cx},${cy-size} ${cx+size},${cy} ${cx},${cy+size} ${cx-size},${cy}`;
}

// Core shape creation function
function createShape() {
  const shape = state.config.shapes[Math.floor(Math.random() * state.config.shapes.length)];
  const pos = randomPosition();
  const color = state.config.colors[Math.floor(Math.random() * state.config.colors.length)];
  
  const element = document.createElementNS("http://www.w3.org/2000/svg", 
    shape === 'star' || shape === 'diamond' ? 'polygon' : shape);
  
  // Enhanced shape properties with music reactivity
  const musicReactiveScale = 1 + (state.audio.bassLevel * 0.5);
  const size = 30 * musicReactiveScale;
  
  if (shape === 'circle') {
    element.setAttribute("cx", pos.x);
    element.setAttribute("cy", pos.y);
    element.setAttribute("r", size);
  } else if (shape === 'rect') {
    element.setAttribute("x", pos.x - size);
    element.setAttribute("y", pos.y - size);
    element.setAttribute("width", size * 2);
    element.setAttribute("height", size * 2);
  } else if (shape === 'polygon') {
    const points = `${pos.x},${pos.y - size} ${pos.x + size},${pos.y + size} ${pos.x - size},${pos.y + size}`;
    element.setAttribute("points", points);
  } else if (shape === 'star') {
    element.setAttribute("points", createStarPoints(pos.x, pos.y, 5, size, size * 0.5));
  } else if (shape === 'diamond') {
    element.setAttribute("points", createDiamondPoints(pos.x, pos.y, size));
  }
  
  // Music-reactive colors and effects
  const hueRotation = Math.floor(state.audio.midLevel * 360);
  const brightness = 1 + state.audio.trebleLevel;
  element.setAttribute("fill", color);
  element.style.filter = `hue-rotate(${hueRotation}deg) brightness(${brightness})`;
  
  // Enhanced animation system
  const baseSpeed = 2 / state.config.speed;
  const musicSpeed = baseSpeed * (1 - state.audio.bassLevel * 0.5);
  const animations = ['pulse', 'spin', 'bounce', 'wobble', 'shake'];
  const randomAnim = animations[Math.floor(Math.random() * animations.length)];
  element.style.animation = `${randomAnim} ${musicSpeed}s infinite`;
  
  element.addEventListener('click', handleShapeClick);
  element.dataset.points = Math.floor(Math.random() * 30) + 10;
  element.dataset.shape = shape;
  
  if (Math.random() < state.config.powerupChance) {
    element.classList.add('power-up');
    element.dataset.powerup = 'true';
  }
  
  return element;
}

// Game mechanics functions
function handleShapeClick(e) {
  if (!state.gameActive || state.power < 10) return;
  
  if (state.audio.beatDetected) {
    e.target.classList.add('rhythm-perfect');
    state.config.pointsPerClick *= 2;
    setTimeout(() => {
      state.config.pointsPerClick /= 2;
    }, 100);
  }
  
  const element = e.target;
  
  if (element.dataset.powerup === 'true') {
    handlePowerup(element);
  }
  
  const basePoints = parseInt(element.getAttribute('data-points'));
  const comboMultiplier = 1 + (state.combo * 0.1);
  const points = Math.floor(basePoints * comboMultiplier);
  
  state.score += points;
  state.power = Math.max(0, state.power - 10);
  
  // Visual feedback
  const feedback = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const pos = {
    x: element.getAttribute('data-shape') === 'circle' ? parseFloat(element.getAttribute('cx')) : parseFloat(element.getAttribute('x') || element.points[0].x),
    y: element.getAttribute('data-shape') === 'circle' ? parseFloat(element.getAttribute('cy')) : parseFloat(element.getAttribute('y') || element.points[0].y)
  };
  
  feedback.setAttribute("x", pos.x);
  feedback.setAttribute("y", pos.y);
  feedback.setAttribute("fill", state.combo > 1 ? "#ffcc00" : "#00ff99");
  feedback.setAttribute("font-size", state.combo > 1 ? "24" : "20");
  feedback.setAttribute("text-anchor", "middle");
  feedback.textContent = `+${points}${state.combo > 1 ? ` x${state.combo}` : ''}`;
  
  document.getElementById('dynamic-content').appendChild(feedback);
  
  feedback.animate([
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-50px)' }
  ], {
    duration: 1000,
    easing: 'ease-out'
  }).onfinish = () => feedback.remove();
  
  clearTimeout(state.comboTimeout);
  state.combo++;
  state.comboTimeout = setTimeout(() => {
    state.combo = 0;
    updateUI();
  }, state.config.comboTimeout);
  
  element.remove();
  const newShape = createShape();
  document.getElementById('dynamic-content').appendChild(newShape);
  state.elements = state.elements.filter(e => e !== element);
  state.elements.push(newShape);
  
  updateUI();
  
  if (state.score >= state.level * state.config.levelUpThreshold) {
    levelUp();
  }
  
  checkAchievements();
}

function handlePowerup(element) {
  const types = ['timeSlowdown', 'doublePoints', 'powerRefill', 'chainReaction'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch(type) {
    case 'timeSlowdown':
      state.config.speed *= 0.5;
      setTimeout(() => state.config.speed *= 2, 5000);
      break;
    case 'doublePoints':
      state.config.pointsPerClick *= 2;
      setTimeout(() => state.config.pointsPerClick /= 2, 5000);
      break;
    case 'powerRefill':
      state.power = 100;
      break;
    case 'chainReaction':
      triggerChainReaction(element);
      break;
  }
}

function triggerChainReaction(sourceElement) {
  const sourcePos = getElementPosition(sourceElement);
  state.elements.forEach(element => {
    const pos = getElementPosition(element);
    const distance = Math.hypot(pos.x - sourcePos.x, pos.y - sourcePos.y);
    if (distance < state.config.chainReactionRadius && element !== sourceElement) {
      element.classList.add('chain-reaction');
      setTimeout(() => handleShapeClick({ target: element }), 300);
    }
  });
}

function getElementPosition(element) {
  const shape = element.getAttribute('data-shape');
  return {
    x: shape === 'circle' ? parseFloat(element.getAttribute('cx')) : parseFloat(element.getAttribute('x') || element.points[0].x),
    y: shape === 'circle' ? parseFloat(element.getAttribute('cy')) : parseFloat(element.getAttribute('y') || element.points[0].y)
  };
}

function checkAchievements() {
  const achievements = {
    "First Steps": state.score >= 100,
    "Combo Master": state.combo >= 10,
    "Power Player": state.power === 100 && state.score >= 500,
    "Shape Shifter": state.score >= 1000
  };

  Object.entries(achievements).forEach(([name, condition]) => {
    if (condition && !state.achievements.has(name)) {
      state.achievements.add(name);
      showAchievement(name);
    }
  });
}

function showAchievement(name) {
  const achievement = document.createElement('div');
  achievement.className = 'achievement';
  achievement.textContent = `Achievement Unlocked: ${name}`;
  document.body.appendChild(achievement);
  setTimeout(() => achievement.remove(), 3000);
}

// Enhanced game loop with preparation for future features
function gameLoop() {
  if (!state.gameActive) return;
  
  // Power management
  state.power = Math.min(100, state.power + state.config.powerRegenRate);
  updateUI();
  
  // Future: Special event timing system
  const eventTriggerChance = state.config.specialEventChance; // 
  if (Math.random() < eventTriggerChance) {
    // Future: Trigger special events
    console.log('Special event ready to trigger!');
  }
  
  // Future: Power-up spawn system
  const powerupSpawnChance = state.config.powerupChance; // 
  if (Math.random() < powerupSpawnChance) {
    // Future: Spawn power-up
    console.log('Power-up ready to spawn!');
  }
  
  // Random events
  if (Math.random() < 0.1) {
    const randomElement = state.elements[Math.floor(Math.random() * state.elements.length)];
    if (randomElement) {
      randomElement.style.animation = 'none';
      randomElement.offsetHeight; // Trigger reflow
      const animations = ['pulse', 'spin', 'bounce', 'wobble', 'shake'];
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      randomElement.style.animation = `${randomAnim} ${2 / state.config.speed}s infinite`;
    }
  }
  
  requestAnimationFrame(gameLoop);
}

// Update UI elements
function updateUI() {
  const scoreElement = document.querySelector('.score');
  const powerFill = document.querySelector('.power-fill');
  const comboElement = document.querySelector('.combo');
  const levelIndicator = document.querySelector('.level-indicator');
  
  scoreElement.textContent = `Score: ${state.score}`;
  powerFill.style.transform = `scaleX(${state.power / 100})`;
  comboElement.textContent = state.combo > 1 ? `Combo: x${state.combo}` : '';
  comboElement.style.opacity = state.combo > 1 ? '1' : '0';
  levelIndicator.textContent = `Level: ${state.level}`;
  
  // Add audio visualization updates
  const canvas = document.getElementById('canvas');
  canvas.style.filter = `hue-rotate(${state.config.visualEffects.colorShift}deg)`;
  state.config.visualEffects.colorShift = (state.config.visualEffects.colorShift + 1) % 360;
}

// Level up function
function levelUp() {
  state.level++;
  state.config.complexity++;
  state.config.speed *= 1.1;
  
  // Visual feedback
  const feedback = document.createElement('div');
  feedback.textContent = `Level Up! ${state.level}`;
  feedback.className = 'level-up-feedback';
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

// Initialize the playground
async function init() {
  await initAudio();
  
  const levelIndicator = document.createElement('div');
  levelIndicator.className = 'level-indicator';
  document.body.appendChild(levelIndicator);
  
  const content = document.getElementById('dynamic-content');
  const status = document.getElementById('status');
  
  content.innerHTML = '';
  
  for (let i = 0; i < state.config.maxElements; i++) {
    const shape = createShape();
    content.appendChild(shape);
    state.elements.push(shape);
  }
  
  status.textContent = `Game Mode: Click shapes to score points! Power: ${state.power}%`;
  
  // Initialize audio visualizer
  createVisualizer();
  
  // Start the game loop
  gameLoop();
  updateUI();
}

let audioContext;
let analyser;
let audioSource;
let dataArray;
let volumeControl;
let lastBeatTime = 0;
const beatThreshold = 0.5;
const beatCooldown = 200; // ms between beats

async function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const response = await fetch('Retro Bass Dreamscape - Track 2 - Sonauto.wav');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    
    const gainNode = audioContext.createGain();
    volumeControl = document.getElementById('volume');
    volumeControl.addEventListener('input', () => {
      gainNode.gain.value = volumeControl.value;
    });
    
    audioSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    audioSource.loop = true;
    audioSource.start(0);
    
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    requestAnimationFrame(updateAudio);
  } catch (error) {
    console.error('Audio initialization failed:', error);
  }
}

// Enhanced audio processing
function updateAudio() {
  if (!audioContext || !state.gameActive) return;
  
  analyser.getByteFrequencyData(dataArray);
  
  // More precise frequency analysis
  const bassSum = sumFrequencyRange(state.config.frequencyBands.bass.min, state.config.frequencyBands.bass.max);
  const midSum = sumFrequencyRange(state.config.frequencyBands.mid.min, state.config.frequencyBands.mid.max);
  const trebleSum = sumFrequencyRange(state.config.frequencyBands.treble.min, state.config.frequencyBands.treble.max);
  
  state.audio.bassLevel = bassSum / 255;
  state.audio.midLevel = midSum / 255;
  state.audio.trebleLevel = trebleSum / 255;
  
  // Enhanced beat detection
  const currentTime = Date.now();
  const beatThreshold = 0.6 + (state.level * 0.05); // Dynamic threshold based on level
  
  if (state.audio.bassLevel > beatThreshold && currentTime - lastBeatTime > beatCooldown) {
    state.audio.beatDetected = true;
    state.config.visualEffects.beatIntensity = state.audio.bassLevel;
    lastBeatTime = currentTime;
    onBeat();
  } else {
    state.audio.beatDetected = false;
    state.config.visualEffects.beatIntensity *= 0.95; // Smooth decay
  }
  
  // Update wave visualization
  updateWaveform();
  updateVisualizer();
  
  requestAnimationFrame(updateAudio);
}

function sumFrequencyRange(minFreq, maxFreq) {
  const nyquist = audioContext.sampleRate / 2;
  const minIndex = Math.floor((minFreq / nyquist) * dataArray.length);
  const maxIndex = Math.floor((maxFreq / nyquist) * dataArray.length);
  
  let sum = 0;
  for (let i = minIndex; i <= maxIndex; i++) {
    sum += dataArray[i];
  }
  return sum / (maxIndex - minIndex + 1);
}

function updateWaveform() {
  const bufferLength = analyser.frequencyBinCount;
  const waveformData = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(waveformData);
  state.config.visualEffects.waveform = Array.from(waveformData);
}

function updateVisualizer() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const waveformData = state.config.visualEffects.waveform;
  ctx.beginPath();
  for (let i = 0; i < waveformData.length; i++) {
    const x = i * canvas.width / waveformData.length;
    const y = canvas.height / 2 + waveformData[i] * canvas.height / 256;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

function onBeat() {
  document.getElementById('canvas').classList.add('beat-active');
  setTimeout(() => document.getElementById('canvas').classList.remove('beat-active'), 100);
  
  state.elements.forEach(element => {
    if (Math.random() < 0.3) {
      element.classList.add('bass-boost');
      setTimeout(() => element.classList.remove('bass-boost'), 300);
    }
  });
  
  // Dynamic gameplay adjustments
  state.config.speed = 1.6 + (state.audio.bassLevel * 0.8);
  state.config.pointsPerClick = 10 + Math.floor(state.audio.midLevel * 30);
  state.config.powerRegenRate = 0.2 + (state.audio.trebleLevel * 0.3);
  
  if (state.audio.bassLevel > 0.8) {
    triggerBassEffect();
  }
}

function triggerBassEffect() {
  const elements = state.elements;
  elements.forEach(element => {
    element.style.filter = `hue-rotate(${Math随机() * 360}deg)`;
    setTimeout(() => element.style.filter = '', 300);
  });
}

// Animation keyframes
const originalStyle = document.createElement('style');
originalStyle.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes wobble {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-10px); }
  }
`;
document.head.appendChild(originalStyle);

init();

window.createShape = createShape;
window.init = init;
window.playgroundState = state;