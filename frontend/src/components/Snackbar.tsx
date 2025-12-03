import React from 'react';
import { useSnackbar } from '../context/SnackbarContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Snackbar: React.FC = () => {
    const { isOpen, message, type, hideSnackbar } = useSnackbar();

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className="text-semantic-success" />;
            case 'error':
                return <AlertCircle size={20} className="text-semantic-error" />;
            default:
                return <Info size={20} className="text-semantic-info" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-card border-semantic-success/50 text-foreground shadow-semantic-success/10';
            case 'error':
                return 'bg-card border-semantic-error/50 text-foreground shadow-semantic-error/10';
            default:
                return 'bg-card border-semantic-info/50 text-foreground shadow-semantic-info/10';
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${getStyles()}`}>
            {getIcon()}
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={hideSnackbar}
                className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} className="opacity-60" />
            </button>
        </div>
    );
};
