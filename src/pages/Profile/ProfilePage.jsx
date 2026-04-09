import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '/src/context/AuthContext.jsx';
import api from '/src/services/api';
import Card from '/src/components/common/Card/Card.jsx';
import Input from '/src/components/common/Input/Input.jsx';
import Button from '/src/components/common/Button/Button.jsx';
import './ProfilePage.css';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
);

const ProfilePage = () => {
    const { hospitalDetails, refreshHospitalDetails } = useAuth();
    const [details, setDetails] = useState({
        receptionist_name: '',
        receptionist_contact_number: '',
        city: '',
        district: '',
        hospital_name: '',
        available_services: '',
        average_consultation_time: '',
        profile_image: '',
        receptionist_image: ''
    });
    const [newImage, setNewImage] = useState(null);
    const [newReceptionistImage, setNewReceptionistImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [receptionistPreviewUrl, setReceptionistPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    const mapDetails = useCallback((data) => {
        if (!data) return;

        let services = data.available_services;
        if (Array.isArray(services)) {
            if (services.length === 1 && typeof services[0] === 'string' && services[0].startsWith('[')) {
                try {
                    const parsed = JSON.parse(services[0]);
                    if (Array.isArray(parsed)) services = parsed.join(', ');
                } catch (e) {
                    services = services[0].replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).join(', ');
                }
            } else {
                services = services.join(', ');
            }
        } else if (typeof services === 'string' && services.startsWith('[')) {
            try {
                let parsed = JSON.parse(services);
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                if (Array.isArray(parsed)) services = parsed.join(', ');
            } catch (e) {
                services = services.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).join(', ');
            }
        }

        setDetails({
            ...data,
            hospital_name: data.hospital_name || data.name || '',
            receptionist_name: data.receptionist_name || data.staff_name || '',
            receptionist_contact_number: data.receptionist_contact_number || data.contact || data.phone || '',
            average_consultation_time: data.average_consultation_time || data.avg_consultation_time || data.averageConsultationTime || '',
            available_services: services || ''
        });

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        const initialImg = data.profile_image_thumbnail || data.profile_image;
        if (initialImg) {
            const imgUrl = initialImg.startsWith('http')
                ? initialImg
                : `${apiBase}${initialImg}`;
            setPreviewUrl(imgUrl);
        }

        const initialRecImg = data.receptionist_image_thumbnail || data.receptionist_image;
        if (initialRecImg) {
            const imgUrl = initialRecImg.startsWith('http')
                ? initialRecImg
                : `${apiBase}${initialRecImg}`;
            setReceptionistPreviewUrl(imgUrl);
        }
    }, []);

    useEffect(() => {
        if (hospitalDetails) {
            mapDetails(hospitalDetails);
        } else {
            // Initial fetch if context is empty
            setFetching(true);
            refreshHospitalDetails().finally(() => setFetching(false));
        }
    }, [hospitalDetails, mapDetails, refreshHospitalDetails]);

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            const file = e.target.files[0];
            if (e.target.name === 'receptionist_image') {
                setNewReceptionistImage(file);
                if (file) setReceptionistPreviewUrl(URL.createObjectURL(file));
            } else {
                setNewImage(file);
                if (file) setPreviewUrl(URL.createObjectURL(file));
            }
        } else {
            setDetails({ ...details, [e.target.name]: e.target.value });
        }
    };

    const handleManualRefresh = async () => {
        setFetching(true);
        await refreshHospitalDetails();
        setFetching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const servicesArray = details.available_services
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '');

            const formDataToSend = new FormData();
            formDataToSend.append('name', details.name);
            formDataToSend.append('receptionist_name', details.receptionist_name);
            formDataToSend.append('receptionist_contact_number', details.receptionist_contact_number);
            formDataToSend.append('city', details.city);
            formDataToSend.append('district', details.district);
            formDataToSend.append('average_consultation_time', parseInt(details.average_consultation_time, 10) || 0);

            // Push each service dynamically so Multer/backend converts it correctly to an array
            servicesArray.forEach((service) => {
                formDataToSend.append('available_services', service);
            });

            if (newImage) {
                formDataToSend.append('profile_image', newImage);
            }

            if (newReceptionistImage) {
                formDataToSend.append('receptionist_image', newReceptionistImage);
            }

            await api.put('/hospital/update-hospital-details', formDataToSend);
            alert('Facility Profile Updated Successfully! ✨');
            await refreshHospitalDetails(); // Update global context
        } catch (err) {
            console.error('Update failed:', err);
            setError('Update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing hospital data...</p>
        </div>
    );

    return (
        <div className="profile-view container-fade-in">
            <header className="profile-header-section">
                <div className="header-text">
                    <h1>Hospital Profile</h1>
                    <p>Manage your facility configurations</p>
                </div>
                <button onClick={handleManualRefresh} className="icon-button-subtle shadow-sm" title="Refresh Profile">
                    <RefreshIcon />
                </button>
            </header>

            {error && <div className="profile-error-banner glass">{error}</div>}

            <div className="profile-content-centered">
                <Card className="profile-main-card shadow-premium" title="Facility Information">
                    <div className="profile-image-section">
                        <div className="profile-preview-container shadow-premium">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" className="profile-preview-img" />
                            ) : (
                                <div className="profile-placeholder">{details.name?.charAt(0) || 'H'}</div>
                            )}
                            <label className="image-upload-overlay">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                <span>Change Photo</span>
                                <input type="file" onChange={handleChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className="profile-image-meta">
                            <h3>{details.hospital_name || 'Hospital'}</h3>
                            <p>{details.city}, {details.district}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section-title">Facility Details</div>
                        <div className="profile-form-grid">
                            <Input
                                label="Hospital Name"
                                name="name"
                                value={details.name}
                                onChange={handleChange}
                                placeholder="E.g. City General Hospital"
                                required
                            />
                        </div>

                        <div className="form-section-title">Receptionist Details</div>
                        <div className="profile-form-grid">
                            <Input
                                label="Receptionist Name"
                                name="receptionist_name"
                                value={details.receptionist_name}
                                onChange={handleChange}
                                placeholder="Display Name"
                                required
                            />
                            <Input
                                label="Contact Number"
                                name="receptionist_contact_number"
                                value={details.receptionist_contact_number}
                                onChange={handleChange}
                                placeholder="+91..."
                                required
                            />
                            <div className="receptionist-photo-field">
                                <label className="receptionist-photo-label">Receptionist Photo</label>
                                <div className="receptionist-photo-preview-container">
                                    {receptionistPreviewUrl ? (
                                        <img src={receptionistPreviewUrl} alt="Receptionist" className="receptionist-preview-mini" />
                                    ) : (
                                        <div className="receptionist-placeholder-mini">{details.receptionist_name?.charAt(0) || 'R'}</div>
                                    )}
                                    <label className="receptionist-upload-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                        <span>Change</span>
                                        <input type="file" name="receptionist_image" onChange={handleChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-section-title">Location & Logistics</div>
                        <div className="profile-form-grid">
                            <Input
                                label="City"
                                name="city"
                                value={details.city}
                                onChange={handleChange}
                                placeholder="City"
                                required
                            />
                            <Input
                                label="District"
                                name="district"
                                value={details.district}
                                onChange={handleChange}
                                placeholder="District"
                                required
                            />
                            <Input
                                label="Avg Consultation (mins)"
                                name="average_consultation_time"
                                type="number"
                                value={details.average_consultation_time}
                                onChange={handleChange}
                                placeholder="15"
                                required
                            />
                        </div>

                        <div className="form-section-title">Medical Services</div>
                        <Input
                            label="Available Services (comma separated)"
                            name="available_services"
                            value={details.available_services}
                            onChange={handleChange}
                            placeholder="OPD, Cardiology, etc."
                            required
                        />

                        <div className="form-actions mt-xl">
                            <Button type="submit" variant="primary" className="save-profile-btn shadow-premium" disabled={loading}>
                                {loading ? 'Saving Changes...' : 'Update Facility Profile'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
