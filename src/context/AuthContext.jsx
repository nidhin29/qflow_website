import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '/src/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [hospitalDetails, setHospitalDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshHospitalDetails = useCallback(async () => {
        try {
            const response = await api.get('/hospital/get-hospital-details');
            const data = response.data.data?.hospital || response.data.data || response.data;
            setHospitalDetails(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch hospital details globally');
            return null;
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            // ALWAYS try fetching profile to force browser to send cookies, verifying the session
            const data = await refreshHospitalDetails();

            if (data) {
                // Backend accepted the cookies!
                const storedUser = localStorage.getItem('hospital_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser({ name: data.name || data.hospital_name });
                }
            } else {
                setUser(null);
            }

            setLoading(false); // Unblock the protected routes
        };
        initAuth();
    }, [refreshHospitalDetails]);

    const login = async (userData) => {
        setUser(userData);
        localStorage.setItem('hospital_user', JSON.stringify(userData));
        await refreshHospitalDetails();
    };

    const logout = () => {
        setUser(null);
        setHospitalDetails(null);
        localStorage.removeItem('hospital_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            hospitalDetails,
            login,
            logout,
            refreshHospitalDetails,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
