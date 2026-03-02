import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add a global error handler for easier debugging
window.onerror = function(message, source, lineno, colno, error) {
  const errorMsg = `Global Error: ${message} at ${source}:${lineno}:${colno}`;
  console.error(errorMsg);
  // Show error on screen if it's a blank page
  if (document.getElementById('root')?.innerHTML === '') {
    document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Critical Startup Error</h2>
      <pre>${errorMsg}</pre>
      <p>Check the browser console for more details.</p>
    </div>`;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  console.log('Mounting React application...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
