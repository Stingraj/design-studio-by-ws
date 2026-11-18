import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { RouterProvider } from './lib/router';
import './styles.css';
import './styles/system.css';
import './styles/animations.css';
import './styles/pages.css';
import './styles/home.css';
import './styles/project.css';
import './styles/editorial.css';
import './styles/dashboard.css';
import './styles/film.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>
);
