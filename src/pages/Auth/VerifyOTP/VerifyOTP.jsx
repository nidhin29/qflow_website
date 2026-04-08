import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '/src/services/api';
import { useAuth } from '/src/context/AuthContext.jsx';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import './VerifyOTP.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/hospital/verify-otp', { email, otp });
            login(response.data.data);
            navigate('/register-details');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="auth-card" title="Verify Email">
                <p className="auth-subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="OTP Code"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength="6"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default VerifyOTP;
