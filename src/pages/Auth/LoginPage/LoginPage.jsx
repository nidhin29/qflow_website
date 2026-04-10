import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/hospital/google-login', { 
                tokenID: credentialResponse.credential 
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

                <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign-In failed')}
                        theme="outline"
                        size="large"
                        shape="rectangular"
                        width="340"
                    />
                </div>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create Hospital Account</Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
