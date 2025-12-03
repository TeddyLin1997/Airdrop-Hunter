import { useState, useEffect } from 'react';
import type { Abi } from 'viem';

export interface DeployedContract {
    address: string;
    name: string;
    abi: Abi;
    chainId: string;
    deployedAt: number;
}

const getStoredContracts = (): DeployedContract[] => {
    const stored = localStorage.getItem('deployedContracts');
    if (stored) {
        try {
            // Basic validation
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse stored contracts", e);
        }
    }
    return [];
};


export const useContractStorage = () => {
    const [contracts, setContracts] = useState<DeployedContract[]>(getStoredContracts);

    useEffect(() => {
        localStorage.setItem('deployedContracts', JSON.stringify(contracts));
    }, [contracts]);

    const addContract = (contract: DeployedContract) => {
        setContracts(prev => [contract, ...prev]);
    };

    const removeContract = (address: string) => {
        setContracts(prev => prev.filter(c => c.address !== address));
    }

    return { contracts, addContract, removeContract };
};
