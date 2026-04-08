import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ otp: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/hospital/reset-password', { email, ...formData });
            alert('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="auth-card" title="Reset Password">
                <form onSubmit={handleSubmit}>
                    <Input label="OTP Code" name="otp" value={formData.otp} onChange={handleChange} required />
                    <Input label="New Password" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ResetPassword;
