import React, { useRef, useState } from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, error, name, required = false, accept }) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName('');
        }
        if (onChange) onChange(e);
    };

    const triggerFileClick = () => {
        fileInputRef.current?.click();
    };

    if (type === 'file') {
        return (
            <div className="premium-input-container">
                {label && (
                    <label className="premium-input-label">
                        {label}{required && <span className="required">*</span>}
                    </label>
                )}
                <div className="custom-file-upload premium-input" onClick={triggerFileClick}>
                    <span className="file-upload-btn">Choose File</span>
                    <span className="file-name-text">{fileName || placeholder || 'No file chosen'}</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        name={name}
                        onChange={handleFileChange}
                        accept={accept}
                        style={{ display: 'none' }}
                        required={required}
                    />
                </div>
                {error && <span className="premium-input-error">{error}</span>}
            </div>
        );
    }

    return (
        <div className="premium-input-container">
            {label && (
                <label className="premium-input-label">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                className={`premium-input ${error ? 'error' : ''}`}
                {...(type !== 'file' ? { value } : {})}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />
            {error && <span className="premium-input-error">{error}</span>}
        </div>
    );
};

export default Input;
