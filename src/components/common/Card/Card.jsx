import React from 'react';
import './Card.css';

const Card = ({ children, title, className = '', variant = 'elevated' }) => {
    return (
        <div className={`premium-card-container ${variant} ${className}`}>
            {title && <div className="premium-card-header"><h3>{title}</h3></div>}
            <div className="premium-card-body">
                {children}
            </div>
        </div>
    );
};

export default Card;
