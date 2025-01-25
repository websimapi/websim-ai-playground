// State management
const state = {
  iteration: 5,
  elements: [],
  score: 0,
  power: 100,
  combo: 0,
  gameActive: true,
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
    comboTimeout: 2000
  }
};

/*
Future Gameplay Enhancement Ideas:
1. Power-ups that randomly spawn:
   - Time slowdown
   - Double points
   - Instant power refill
   - Shape multiplication

2. Special Events:
   - "Gold Rush" - All shapes turn gold for bonus points
   - "Chain Reaction" - Clicking one shape triggers nearby shapes
   - "Shape Storm" - Rapid spawn of many shapes
   - "Boss Battle" - Large complex shape that requires multiple clicks

3. Progression System:
   - Level system with increasing difficulty
   - Unlock new shape types and colors
   - Special abilities that charge up over time
   - Achievements and challenges

4. Multiplayer Features:
   - Competitive mode with split screen
   - Cooperative mode where players share power
   - Global leaderboard
   - Daily challenges

5. Advanced Mechanics:
   - Shape fusion - combine similar shapes
   - Color matching bonuses
   - Pattern recognition challenges
   - Physics-based interactions between shapes
*/

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
  
  return element;
}

function handleShapeClick(e) {
  if (!state.gameActive || state.power < 10) return;
  
  const element = e.target;
  const shape = element.getAttribute('data-shape');
  const basePoints = parseInt(element.getAttribute('data-points'));
  
  // Update combo system
  clearTimeout(state.comboTimeout);
  state.combo++;
  state.comboTimeout = setTimeout(() => {
    state.combo = 0;
    updateUI();
  }, state.config.comboTimeout);
  
  const comboMultiplier = 1 + (state.combo * 0.1);
  const points = Math.floor(basePoints * comboMultiplier);
  
  state.score += points;
  state.power = Math.max(0, state.power - 10);
  
  // Future: Check for special properties and apply effects
  const specialProperties = JSON.parse(e.target.dataset.specialProperties || '{}');
  if (specialProperties.isPowerup) {
    // Future: Implement power-up effects
    console.log('Power-up clicked! Effects coming soon...');
  }
  
  // Visual feedback
  const feedback = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const pos = {
    x: shape === 'circle' ? parseFloat(element.getAttribute('cx')) : parseFloat(element.getAttribute('x') || element.points[0].x),
    y: shape === 'circle' ? parseFloat(element.getAttribute('cy')) : parseFloat(element.getAttribute('y') || element.points[0].y)
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
  
  // Replace clicked shape
  element.remove();
  const newShape = createShape();
  document.getElementById('dynamic-content').appendChild(newShape);
  state.elements = state.elements.filter(e => e !== element);
  state.elements.push(newShape);
  
  updateUI();
}

// Enhanced game loop with preparation for future features
function gameLoop() {
  if (!state.gameActive) return;
  
  // Power management
  state.power = Math.min(100, state.power + state.config.powerRegenRate);
  updateUI();
  
  // Future: Special event timing system
  const eventTriggerChance = 0.001; // 0.1% chance per frame
  if (Math.random() < eventTriggerChance) {
    // Future: Trigger special events
    console.log('Special event ready to trigger!');
  }
  
  // Future: Power-up spawn system
  const powerupSpawnChance = 0.0005; // 0.05% chance per frame
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
  
  scoreElement.textContent = `Score: ${state.score}`;
  powerFill.style.transform = `scaleX(${state.power / 100})`;
  comboElement.textContent = state.combo > 1 ? `Combo: x${state.combo}` : '';
  comboElement.style.opacity = state.combo > 1 ? '1' : '0';
}

// Initialize the playground
function init() {
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