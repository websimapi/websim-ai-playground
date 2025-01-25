// State management
const state = {
  iteration: 0,
  elements: [],
  config: {
    // AI can modify these values in future iterations
    colors: ['#ff0066', '#00ff99', '#0066ff', '#ffcc00'],
    speed: 1,
    complexity: 1
  }
};

// Initialize the playground
function init() {
  const canvas = document.getElementById('canvas');
  const content = document.getElementById('dynamic-content');
  
  // Clear previous content
  content.innerHTML = '';
  
  // Add initial shape
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "400");
  circle.setAttribute("cy", "300");
  circle.setAttribute("r", "50");
  circle.setAttribute("fill", state.config.colors[0]);
  
  content.appendChild(circle);
  
  // Add basic animation
  circle.style.animation = "pulse 2s infinite";
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Initialize the playground
init();

// Export state for future iterations
window.playgroundState = state;