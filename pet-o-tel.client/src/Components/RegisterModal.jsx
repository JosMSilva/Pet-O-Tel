import './LoginModal.css'; 
import React, { useState, useEffect } from 'react';

const RegisterModal = ({ onClose }) => {

    {/*************************************** Const Declaration ***************************************/ }
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    {/*************************************** Password Strenght Bar ***************************************/ }
    const getPasswordStrength = (password) => {
        if (password.length == 0) return;
        if (password.length < 6) return 'weak';
        if (/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8) return 'strong';
        return 'medium';
    };

    {/*************************************** Register Function ***************************************/ }
    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch('users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            setError('');
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    {/*************************************** Error Message Disapear ***************************************/ }
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
                <div className="modalHeader">
                    <h3>Create Account</h3>
                    <button className="modal-close" onClick={onClose}><i className='fa fa-times'></i></button>
                </div>

                {/**************************** Register Form ****************************/}
                <form className="loginForm" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            const newPassword = e.target.value;
                            setPassword(newPassword);
                            setPasswordStrength(getPasswordStrength(newPassword));
                        }}
                        className='passwordInput'
                    />
                    <div className="passwordStrengthBar">
                        <div className={`strength-indicator ${passwordStrength}`}></div>
                    </div>

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='passwordInput'
                    />

                    {error && <div className="errorMessage">{error}</div>}
                    <button type="submit" className="loginBtn">Register</button>
                </form>

                <p className="signupLink">
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>Log in</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterModal;
