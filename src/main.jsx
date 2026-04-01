import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// This connects the React app to the <div id="root"> in your index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Critical Error: Could not find the 'root' element in index.html. Check your HTML file.");
}