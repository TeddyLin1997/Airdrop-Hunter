import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSnackbar } from '../context/SnackbarContext';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnect: React.FC = () => {
    const { account, connectWallet, disconnectWallet, error } = useWeb3();
    const { showSnackbar } = useSnackbar();

    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="flex flex-col items-end">
            {!account ? (
                <button
                    onClick={connectWallet}
                    className="flex items-center gap-2 bg-gold-gradient hover:bg-gold-gradient-hover text-black px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                    <Wallet size={18} />
                    Connect Wallet
                </button>
            ) : (
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (account) {
                                navigator.clipboard.writeText(account);
                                showSnackbar('Address copied to clipboard!', 'success');
                            }
                        }}
                        className="bg-secondary px-4 py-2 rounded-xl text-sm font-mono text-primary border border-border hover:bg-secondary/80 hover:border-primary/50 transition-all cursor-pointer flex items-center gap-2"
                        title="Click to copy address"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        {formatAddress(account)}
                    </button>
                    <button
                        onClick={disconnectWallet}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                        title="Disconnect"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            )}
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
    );
};
