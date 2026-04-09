import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '/src/services/api';
import { useAuth } from '/src/context/AuthContext.jsx';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import './RegisterDetailsPage.css';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);

const RegisterDetailsPage = () => {
    const [formData, setFormData] = useState({
        receptionist_name: '',
        receptionist_contact_number: '',
        city: '',
        district: '',
        available_services: '',
        average_consultation_time: '15'
    });
    const [profileImage, setProfileImage] = useState(null);
    const [receptionistImage, setReceptionistImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const { refreshHospitalDetails } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            if (e.target.name === 'receptionist_image') {
                setReceptionistImage(e.target.files[0]);
            } else {
                setProfileImage(e.target.files[0]);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const servicesArray = formData.available_services
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '');

            const formDataToSend = new FormData();
            formDataToSend.append('receptionist_name', formData.receptionist_name);
            formDataToSend.append('receptionist_contact_number', formData.receptionist_contact_number);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('district', formData.district);
            formDataToSend.append('average_consultation_time', parseInt(formData.average_consultation_time, 10));
            formDataToSend.append('available_services', JSON.stringify(servicesArray));

            if (profileImage) {
                formDataToSend.append('profile_image', profileImage);
            }

            if (receptionistImage) {
                formDataToSend.append('receptionist_image', receptionistImage);
            }

            await api.post('/hospital/register-details', formDataToSend);
            await refreshHospitalDetails();
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration details error:', err);
            alert('Could not save your details. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-details-view auth-container">
            <div className="auth-mesh-gradient"></div>
            <Card className="details-main-card shadow-premium">
                <header className="details-header">
                    <div className="auth-logo" style={{ width: '60px', height: '60px', background: 'none', boxShadow: 'none', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/icon.png" alt="Qflow Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1>Complete Profile</h1>
                    <p>Finalize your facility setup to enter the dashboard</p>
                </header>

                <form onSubmit={handleSubmit} className="details-form">
                    <section className="form-group-section">
                        <div className="section-title"><UserIcon /><span>Staff Information</span></div>
                        <div className="details-grid">
                            <Input
                                label="Receptionist Name"
                                name="receptionist_name"
                                value={formData.receptionist_name}
                                onChange={handleChange}
                                placeholder="e.g. Rahul Sharma"
                                required
                            />
                            <Input
                                label="Receptionist Contact"
                                name="receptionist_contact_number"
                                value={formData.receptionist_contact_number}
                                onChange={handleChange}
                                placeholder="+91..."
                                required
                            />
                            <Input
                                label="Receptionist Photo"
                                name="receptionist_image"
                                type="file"
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <section className="form-group-section">
                        <div className="section-title"><MapPinIcon /><span>Location Details</span></div>
                        <div className="details-grid">
                            <Input
                                label="City Name"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Current City"
                                required
                            />
                            <Input
                                label="District Name"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="Current District"
                                required
                            />
                        </div>
                    </section>

                    <section className="form-group-section">
                        <div className="section-title"><SettingsIcon /><span>Operational Settings</span></div>
                        <div className="details-grid">
                            <Input
                                label="Avg Consultation (min)"
                                name="average_consultation_time"
                                type="number"
                                value={formData.average_consultation_time}
                                onChange={handleChange}
                                placeholder="15"
                                required
                            />
                            <Input
                                label="Facility Profile Image"
                                name="profile_image"
                                type="file"
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <section className="form-group-section">
                        <Input
                            label="Medical Services Offered (comma separated)"
                            name="available_services"
                            value={formData.available_services}
                            onChange={handleChange}
                            placeholder="OPD, Cardiology, Radiology, Pediatrics..."
                            required
                        />
                    </section>

                    <div className="form-actions mt-xxl">
                        <Button type="submit" variant="primary" className="w-full shadow-premium" disabled={loading} style={{ height: '56px' }}>
                            {loading ? 'Finalizing Setup...' : 'Enter Dashboard'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default RegisterDetailsPage;
