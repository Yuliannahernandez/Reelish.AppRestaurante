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
