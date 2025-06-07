import './LoginModal.css';
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';


const LoginModal = ({ onClose, onOpenRegister }) => {


    {/*************************************** Const Declaration ***************************************/ }
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    {/*************************************** Google Login Handler ***************************************/ }

    const handleGoogleSuccess = async (credentialResponse) => {

        try {
            const response = await fetch("users/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    provider: "Google",
                    token: credentialResponse.credential,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }
            window.location.reload();

        } catch (error) {
            handleGoogleError(error.message);
        }
    };

    const handleGoogleError = (message) => {
        setError(message || "Google login was cancelled or failed.");
    };

    {/*************************************** GitHub Login Handler ***************************************/ }

    const redirectToGitHub = () => {
        const clientId = "Ov23liTMW6eumMElkr8d";
        const redirectUri = "https://localhost:51726/oauth-callback";
        const scope = "read:user user:email";
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = githubAuthUrl;
    };

    {/*************************************** Base Login Handler ***************************************/ }

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const response = await fetch('users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            setError('');
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };
   
    {/*************************************** Error Message Clear ***************************************/ }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);



    return (
        <div className="modalMain">
            <div className="modalContent">

                {/**************************** Header ****************************/}

                <div className='modalHeader'>
                    <h3>Login with</h3>
                    <button className="modal-close" onClick={onClose}><i className='fa fa-times'></i></button>
                </div>

                {/**************************** Log In with Socials ****************************/}

                <div className="socialButtons">
                    <button className="social facebook"><i className="fa fa-facebook" onClick={() => setError("Facebook Login Unavailable.") }></i></button>
                    <button className="social google"><i className="fa fa-google"></i></button>
                    <div className="google-login-wrapper"><GoogleLogin  onSuccess={handleGoogleSuccess} onError={handleGoogleError}/></div>
                    <button className="social github" onClick={redirectToGitHub}><i className="fa fa-github"></i></button>
                    <div className='googleHider1'></div>
                    <div className='googleHider2'></div>
                </div>

                <div className="divider"><span>or</span></div>

                {/**************************** Log In form for Basic Login ****************************/}

                <form className="loginForm" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="passwordWrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i
                            className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                        />
                    </div>
                    {error && <div className="errorMessage">{error}</div>}
                    <button type="submit" className="loginBtn">Log In</button>
                </form>

                <p className="signupLink">
                    Looking to <button onClick={onOpenRegister} className="linkButton">create an account</button>?
                </p>               
            </div>

        </div>
    );
};

export default LoginModal;
