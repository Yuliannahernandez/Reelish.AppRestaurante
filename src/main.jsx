import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = '904956560703-u2u5bjpb19rbnb2auv8fane6shfh6rhc.apps.googleusercontent.com';

const paypalOptions = {
  "client-id": "sb", 
  currency: "USD",
  intent: "capture",
  components: "buttons" 
};

console.log('Google Client ID:', GOOGLE_CLIENT_ID);
console.log('GoogleOAuthProvider cargado');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PayPalScriptProvider options={paypalOptions}>
        <App />
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration.scope);
        
        // Verificar actualizaciones del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nueva versión del Service Worker encontrada');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Service Worker actualizado y activado');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error);
      });
  });
}

// Detectar si la app está instalada como PWA
window.addEventListener('load', () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 App ejecutándose como PWA instalada');
  } else {
    console.log('🌐 App ejecutándose en navegador');
  }
});