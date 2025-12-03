import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType) => void;
    hideSnackbar: () => void;
    message: string;
    type: SnackbarType;
    isOpen: boolean;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackbarType>('info');

    const showSnackbar = useCallback((msg: string, msgType: SnackbarType = 'info') => {
        setMessage(msg);
        setType(msgType);
        setIsOpen(true);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            setIsOpen(false);
        }, 3000);
    }, []);

    const hideSnackbar = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar, message, type, isOpen }}>
            {children}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};
