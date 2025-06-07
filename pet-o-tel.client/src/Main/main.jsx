import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId="523054235039-baai24au08ulvv0frm2hvcfm2skd1s4a.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
)
