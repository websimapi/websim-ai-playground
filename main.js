// State management
const state = {
  iteration: 3,
  elements: [],
  score: 0,
  power: 100,
  gameActive: true,
  config: {
    colors: ['#ff0066', '#00ff99', '#0066ff', '#ffcc00', '#ff9900', '#9933ff'],
    speed: 1.6,
    complexity: 4,
    shapes: ['circle', 'polygon', 'rect', 'star'],
    maxElements: 10,
    interactions: true,
    pointsPerClick: 10,
    powerDrainRate: 0.5,
    powerRegenRate: 0.2
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

// Create a random shape with game mechanics
function createShape() {
  const shape = state.config.shapes[Math.floor(Math.random() * state.config.shapes.length)];
  const color = state.config.colors[Math.floor(Math.random() * state.config.colors.length)];
  const pos = randomPosition();
  
  const element = document.createElementNS("http://www.w3.org/2000/svg", shape === 'star' ? 'polygon' : shape);
  
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
  }
  
  element.setAttribute("fill", color);
  element.setAttribute("data-shape", shape);
  
  const animations = ['pulse', 'spin', 'bounce', 'wobble'];
  const randomAnim = animations[Math.floor(Math.random() * animations.length)];
  element.style.animation = `${randomAnim} ${2 / state.config.speed}s infinite`;
  
  if (state.config.interactions) {
    element.addEventListener('click', (e) => {
      if (!state.gameActive || state.power < 10) return;
      
      const points = Math.floor(Math.random() * state.config.pointsPerClick) + 1;
      state.score += points;
      state.power = Math.max(0, state.power - 10);
      
      // Visual feedback
      const feedback = document.createElementNS("http://www.w3.org/2000/svg", "text");
      feedback.setAttribute("x", pos.x);
      feedback.setAttribute("y", pos.y);
      feedback.setAttribute("fill", "#00ff99");
      feedback.setAttribute("font-size", "20");
      feedback.setAttribute("text-anchor", "middle");
      feedback.textContent = `+${points}`;
      
      document.getElementById('dynamic-content').appendChild(feedback);
      
      // Animate and remove feedback
      feedback.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-50px)' }
      ], {
        duration: 1000,
        easing: 'ease-out'
      }).onfinish = () => feedback.remove();
      
      updateUI();
    });
  }
  
  return element;
}

// Game loop
function gameLoop() {
  if (!state.gameActive) return;
  
  // Power management
  state.power = Math.min(100, state.power + state.config.powerRegenRate);
  updateUI();
  
  // Random events
  if (Math.random() < 0.1) {
    const randomElement = state.elements[Math.floor(Math.random() * state.elements.length)];
    if (randomElement) {
      randomElement.style.animation = 'none';
      randomElement.offsetHeight; // Trigger reflow
      const animations = ['pulse', 'spin', 'bounce', 'wobble'];
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
  
  scoreElement.textContent = `Score: ${state.score}`;
  powerFill.style.transform = `scaleX(${state.power / 100})`;
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
`;
document.head.appendChild(style);

init();

window.playgroundState = state;