import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        setError('');
        try {
            // tokenResponse.access_token is what useGoogleLogin returns by default
            // But your backend wants tokenID (idToken). 
            // NOTE: useGoogleLogin with flow: 'implicit' returns access_token.
            // For idToken, we use the standard GoogleLogin component OR a custom flow.
            // Let's use the explicit Google Login popup for the best experience.
            const response = await api.post('/hospital/google-login', { 
                tokenID: tokenResponse.access_token 
            });
            
            login(response.data.data.hospital || response.data.data);
            
            if (response.status === 201) {
                navigate('/register-details');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError('Google authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Sign-In failed')
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/hospital/login', formData);
            console.log('Login Response:', response);
            console.log('Login Response:', response.data.data);
            login(response.data.data);

            if (response.status === 201) {
                navigate('/register-details');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="auth-card shadow-premium">
                <div className="auth-header" style={{ marginBottom: '2rem' }}>
                    <div className="auth-logo" style={{ width: '60px', height: '60px', background: 'none', boxShadow: 'none' }}>
                        <img src="/icon.png" alt="Qflow Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem' }}>Hospital Login</h1>
                    <p style={{ fontSize: '0.9rem' }}>Secure access to your facility dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@hospital.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <div className="auth-form-meta">
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <Button type="submit" variant="primary" className="w-full mt-lg shadow-premium" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In to Portal'}
                    </Button>
                </form>

                <div className="auth-divider">
                    <span>OR SECURE SIGN IN</span>
                </div>

                <Button variant="secondary" className="w-full google-btn" onClick={() => handleGoogleLogin()} disabled={loading}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                    Continue with Google
                </Button>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create Hospital Account</Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
