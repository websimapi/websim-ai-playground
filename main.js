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
    }
  }
};

// Generate random position within SVG bounds
function randomPosition() {
  return {
    x: Math.random() * 700 + 50,
    y: Math.random() * 500 + 50
  };
}

// Create a star shape points
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

// Create diamond points
function createDiamondPoints(cx, cy, size = 30) {
  return `${cx},${cy-size} ${cx+size},${cy} ${cx},${cy+size} ${cx-size},${cy}`;
}

// Create a random shape with game mechanics
function createShape() {
  // Enhanced shape creation with preparation for future features
  const shape = state.config.shapes[Math.floor(Math.random() * state.config.shapes.length)];
  const color = state.config.colors[Math.floor(Math.random() * state.config.colors.length)];
  const pos = randomPosition();
  const points = Math.floor(Math.random() * 30) + 10;
  
  // Future: Add special properties for power-ups and events
  const specialProperties = {
    isPowerup: Math.random() < 0.05, // 5% chance for future power-up implementation
    specialEffect: null,
    durability: 1, // Future: Some shapes might require multiple clicks
    chainReaction: false,
    pointMultiplier: 1
  };
  
  const element = document.createElementNS("http://www.w3.org/2000/svg", shape === 'star' || shape === 'diamond' ? 'polygon' : shape);
  
  if (shape === 'circle') {
    element.setAttribute("cx", pos.x);
    element.setAttribute("cy", pos.y);
    element.setAttribute("r", "30");
  } else if (shape === 'rect') {
    element.setAttribute("x", pos.x);
    element.setAttribute("y", pos.y);
    element.setAttribute("width", "60");
    element.setAttribute("height", "60");
  } else if (shape === 'polygon') {
    const points = `${pos.x},${pos.y - 30} ${pos.x + 26},${pos.y + 15} ${pos.x - 26},${pos.y + 15}`;
    element.setAttribute("points", points);
  } else if (shape === 'star') {
    element.setAttribute("points", createStarPoints(pos.x, pos.y));
  } else if (shape === 'diamond') {
    element.setAttribute("points", createDiamondPoints(pos.x, pos.y));
  }
  
  element.setAttribute("fill", color);
  element.setAttribute("data-shape", shape);
  element.setAttribute("data-points", points);
  
  const animations = ['pulse', 'spin', 'bounce', 'wobble', 'shake'];
  const randomAnim = animations[Math.floor(Math.random() * animations.length)];
  element.style.animation = `${randomAnim} ${2 / state.config.speed}s infinite`;
  
  if (state.config.interactions) {
    element.addEventListener('click', handleShapeClick);
  }
  
  // Store special properties for future use
  element.dataset.specialProperties = JSON.stringify(specialProperties);
  
  if (Math.random() < state.config.powerupChance) {
    element.classList.add('power-up');
    element.dataset.powerup = 'true';
  }
  
  return element;
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

function handleShapeClick(e) {
  if (!state.gameActive || state.power < 10) return;
  
  const element = e.target;
  
  if (element.dataset.powerup === 'true') {
    handlePowerup(element);
  }
  
  // Original click handling
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
  
  // Animate and remove feedback
  feedback.animate([
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-50px)' }
  ], {
    duration: 1000,
    easing: 'ease-out'
  }).onfinish = () => feedback.remove();
  
  // Update combo system
  clearTimeout(state.comboTimeout);
  state.combo++;
  state.comboTimeout = setTimeout(() => {
    state.combo = 0;
    updateUI();
  }, state.config.comboTimeout);
  
  // Replace clicked shape
  element.remove();
  const newShape = createShape();
  document.getElementById('dynamic-content').appendChild(newShape);
  state.elements = state.elements.filter(e => e !== element);
  state.elements.push(newShape);
  
  updateUI();
  
  // Check for level up
  if (state.score >= state.level * state.config.levelUpThreshold) {
    levelUp();
  }
  
  checkAchievements();
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
function init() {
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
  
  gameLoop();
  updateUI();
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

init();

window.playgroundState = state;