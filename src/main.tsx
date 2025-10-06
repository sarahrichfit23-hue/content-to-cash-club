import { createRoot } from 'react-dom/client'
import App from './App.tsx'
https://chatgpt.com/c/68e215fd-9034-832c-9933-59a5de5b9d1b
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
