import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) return;

        const fetchGitHubToken = async () => {
            try {
                const response = await fetch("users/github", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ code })
                });

                if (!response.ok) {
                    return navigate("/login?error=github");
                }

                const data = await response.json();
                console.log("GitHub login success:", data);
                window.location.href = "/";
            } catch (err) {
                console.error("GitHub login failed", err);
                navigate("/login?error=github");
            }
        };

        fetchGitHubToken();
    }, []);

    return <div>Logging in with GitHub...</div>;
};

export default OAuthCallback;
