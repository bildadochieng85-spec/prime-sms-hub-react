import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const showConfirm = useCallback((title, message, onConfirm) => {
        setConfig({ type: 'confirm', title, message, onConfirm });
    }, []);

    const showPrompt = useCallback((title, message, onConfirm, defaultValue = '') => {
        setInputValue(defaultValue);
        setConfig({ type: 'prompt', title, message, onConfirm });
    }, []);

    const handleConfirm = () => {
        if (config.type === 'prompt') {
            config.onConfirm(inputValue);
        } else {
            config.onConfirm();
        }
        closeModal();
    };

    const closeModal = () => {
        setConfig(null);
        setInputValue('');
    };

    return (
        <ModalContext.Provider value={{ showConfirm, showPrompt }}>
            {children}
            {config && (
                <div className="admin-modal-overlay fade-in" style={{ zIndex: 2000 }}>
                    <div className="admin-modal-content glass-panel bounce-in">
                        <h3 style={{ borderBottom: 'none', padding: 0 }}>{config.title}</h3>
                        <p>{config.message}</p>
                        
                        {config.type === 'prompt' && (
                            <input 
                                type="text" 
                                className="modal-input" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    marginBottom: '20px'
                                }}
                            />
                        )}
                        
                        <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="dashboard-back-button" style={{ margin: 0, padding: '10px 20px' }} onClick={closeModal}>Cancel</button>
                            <button className="dashboard-purchase-btn" style={{ margin: 0, padding: '10px 20px', minWidth: '120px' }} onClick={handleConfirm}>
                                {config.type === 'prompt' ? 'Confirm' : 'Yes, Proceed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};
