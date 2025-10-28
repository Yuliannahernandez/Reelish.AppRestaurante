import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = '904956560703-lmv7u0d041ee3u3j8lv9rt1msll9ar0p.apps.googleusercontent.com';

console.log(' Google Client ID:', GOOGLE_CLIENT_ID);
console.log(' GoogleOAuthProvider cargado');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);