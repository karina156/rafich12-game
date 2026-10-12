import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/anonymous-pro/400.css';
import '@fontsource/anonymous-pro/700.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/scenes.css';
import './styles/games.css';
import App from './App';
import { initUiSkin } from './utils/uiSkin';

initUiSkin();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
