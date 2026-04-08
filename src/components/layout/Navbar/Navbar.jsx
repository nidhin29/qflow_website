import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';
import logoIcon from '/src/assets/icon.png';
import './Navbar.css';

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

const Navbar = () => {
    const { user, logout, hospitalDetails } = useAuth();

    if (!user) return null;

    const profileImg = hospitalDetails?.profile_image_thumbnail || hospitalDetails?.profile_image;
    const profileImgUrl = profileImg
        ? (profileImg.startsWith('http') ? profileImg : `http://localhost:8000${profileImg}`)
        : null;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <img src={logoIcon} alt="Qflow Logo" className="logo-img" />
                <h2 className="brand-name">Qflow<span>Hospital</span></h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="nav-icon"><DashboardIcon /></span>
                    Dashboard
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="nav-icon"><ProfileIcon /></span>
                    Hospital Profile
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar shadow-sm">
                        {profileImgUrl ? (
                            <img src={profileImgUrl} alt="Avatar" className="avatar-img" />
                        ) : (
                            (hospitalDetails?.name || user.name || 'H').charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{hospitalDetails?.name || user.name || 'Hospital Admin'}</p>
                    </div>
                </div>
                <button onClick={logout} className="logout-button">
                    <LogoutIcon /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Navbar;
