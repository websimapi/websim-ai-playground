// State management
const state = {
  iteration: 1, 
  elements: [],
  config: {
    colors: ['#ff0066', '#00ff99', '#0066ff', '#ffcc00'],
    speed: 1.2, 
    complexity: 2, 
    shapes: ['circle', 'polygon', 'rect'],
    maxElements: 5
  }
};

// Generate random position within SVG bounds
function randomPosition() {
  return {
    x: Math.random() * 700 + 50,
    y: Math.random() * 500 + 50
  };
}

// Create a random shape
function createShape() {
  const shape = state.config.shapes[Math.floor(Math.random() * state.config.shapes.length)];
  const color = state.config.colors[Math.floor(Math.random() * state.config.colors.length)];
  const pos = randomPosition();
  
  const element = document.createElementNS("http://www.w3.org/2000/svg", shape);
  
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
  }
  
  element.setAttribute("fill", color);
  element.style.animation = `${Math.random() > 0.5 ? 'pulse' : 'spin'} ${2 / state.config.speed}s infinite`;
  
  return element;
}

// Initialize the playground
function init() {
  const content = document.getElementById('dynamic-content');
  const status = document.getElementById('status');
  
  // Clear previous content
  content.innerHTML = '';
  
  // Add multiple shapes
  for (let i = 0; i < state.config.maxElements; i++) {
    const shape = createShape();
    content.appendChild(shape);
    state.elements.push(shape);
  }
  
  status.textContent = `Iteration ${state.iteration}: Added ${state.config.maxElements} animated shapes...`;
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
`;
document.head.appendChild(style);

// Initialize the playground
init();

// Export state for future iterations
window.playgroundState = state;