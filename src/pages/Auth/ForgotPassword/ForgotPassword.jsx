import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/hospital/forgot-password', { email });
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            alert('Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="auth-card" title="Forgot Password">
                <p className="auth-subtitle">Enter your email and we'll send you a code to reset your password.</p>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hospital.com"
                        required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
