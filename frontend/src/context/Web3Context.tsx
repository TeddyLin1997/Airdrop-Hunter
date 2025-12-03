import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';

import { getChain } from '../utils/chains';

interface Web3ContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    chainId: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    switchChain: (chainId: string) => Promise<void>;
    error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface RpcError extends Error {
    code: number;
}

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setError(null);
        if (window.ethereum) {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const _signer = await _provider.getSigner();
                const _account = await _signer.getAddress();
                const _network = await _provider.getNetwork();

                setProvider(_provider);
                setSigner(_signer);
                setAccount(_account);
                setChainId(_network.chainId.toString());
            } catch (err) {
                console.error("Failed to connect wallet:", err);
                setError((err as Error).message || "Failed to connect wallet");
            }
        } else {
            setError("MetaMask is not installed");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    const switchChain = async (targetChainId: string) => {
        if (!window.ethereum) return;

        const hexChainId = "0x" + BigInt(targetChainId).toString(16);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }],
            });
            // A page reload is handled by the 'chainChanged' event listener,
            // which is generally a safe way to reset application state.
        } catch (switchError) {
            const err = switchError as RpcError;
            // This error code indicates that the chain has not been added to MetaMask.
            if (err.code === 4902) {
                const chainToAdd = getChain(parseInt(targetChainId, 10));
                if (!chainToAdd) {
                    setError("This chain is not supported by the app.");
                    return;
                }

                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: hexChainId,
                                chainName: chainToAdd.name,
                                nativeCurrency: chainToAdd.nativeCurrency,
                                rpcUrls: [chainToAdd.rpcUrls.default.http[0]],
                                blockExplorerUrls: chainToAdd.blockExplorers ? [chainToAdd.blockExplorers.default.url] : [],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error("Failed to add chain:", addError);
                    setError((addError as Error).message || "Failed to add the chain.");
                }
            } else {
                console.error("Failed to switch chain:", switchError);
                setError(err.message || "Failed to switch chain.");
            }
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    // Re-establish connection to update signer and account
                    connectWallet();
                } else {
                    disconnectWallet();
                }
            };

            const handleChainChanged = () => {
                // Reload the page to ensure the app state reflects the new chain
                window.location.reload();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            // Clean up listeners on component unmount
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    return (
        <Web3Context.Provider value={{ account, provider, signer, chainId, connectWallet, disconnectWallet, switchChain, error }}>
            {children}
        </Web3Context.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};
