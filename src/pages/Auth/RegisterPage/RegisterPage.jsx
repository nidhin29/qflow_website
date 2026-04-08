import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/hospital/register', formData);
            await api.post('/hospital/send-otp', { email: formData.email });
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="auth-card shadow-premium">
                <div className="auth-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div className="auth-logo" style={{ borderRadius: '12px', width: '48px', height: '48px', fontSize: '1.5rem', margin: '0 auto 1rem' }}>Q</div>
                    <h1 style={{ fontSize: '1.5rem' }}>Hospital Registration</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start managing your patient flow with Qflow</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. John Smith / City Care Hospital"
                        required
                    />
                    <Input
                        label="Work Email"
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
                    {error && <p className="error-message">{error}</p>}
                    <Button type="submit" variant="primary" className="w-full mt-lg shadow-premium" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Hospital Account'}
                    </Button>
                </form>
                <p className="auth-footer">
                    Already registered? <Link to="/login">Sign In Instead</Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;
