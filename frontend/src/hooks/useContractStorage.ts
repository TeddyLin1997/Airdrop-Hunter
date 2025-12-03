import { useState, useEffect } from 'react';
import type { Abi } from 'viem';

export interface DeployedContract {
    address: string;
    name: string;
    abi: Abi;
    chainId: string;
    deployedAt: number;
    deployer: string; // 部署者地址
}

// New structure: { [deployerAddress]: { [chainId]: DeployedContract[] } }
type ContractsByDeployer = Record<string, Record<string, DeployedContract[]>>;

const getStoredContracts = (deployerAddress?: string): DeployedContract[] => {
    const stored = localStorage.getItem('deployedContracts');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);

            // Handle legacy array format - migrate to new structure
            if (Array.isArray(parsed)) {
                console.log('Migrating legacy contract storage format...');
                // Return empty for now, legacy data will be ignored
                return [];
            }

            // New structure: { [deployerAddress]: { [chainId]: DeployedContract[] } }
            if (typeof parsed === 'object' && parsed !== null) {
                if (!deployerAddress) {
                    // Return all contracts from all deployers
                    const allContracts: DeployedContract[] = [];
                    Object.values(parsed as ContractsByDeployer).forEach(chainMap => {
                        Object.values(chainMap).forEach(contracts => {
                            allContracts.push(...contracts);
                        });
                    });
                    return allContracts;
                }

                // Return contracts for specific deployer
                const deployerContracts = parsed[deployerAddress];
                if (deployerContracts && typeof deployerContracts === 'object') {
                    const contracts: DeployedContract[] = [];
                    Object.values(deployerContracts).forEach(chainContracts => {
                        if (Array.isArray(chainContracts)) {
                            contracts.push(...chainContracts);
                        }
                    });
                    return contracts;
                }
            }
        } catch (e) {
            console.error("Failed to parse stored contracts", e);
        }
    }
    return [];
};

const saveContracts = (contractsByDeployer: ContractsByDeployer) => {
    localStorage.setItem('deployedContracts', JSON.stringify(contractsByDeployer));
};

const getAllContractsMap = (): ContractsByDeployer => {
    const stored = localStorage.getItem('deployedContracts');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Handle legacy array format
            if (Array.isArray(parsed)) {
                return {};
            }
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse stored contracts", e);
        }
    }
    return {};
};

export const useContractStorage = (deployerAddress?: string) => {
    const [contracts, setContracts] = useState<DeployedContract[]>(() =>
        getStoredContracts(deployerAddress)
    );

    useEffect(() => {
        // Update contracts when deployer address changes
        setContracts(getStoredContracts(deployerAddress));
    }, [deployerAddress]);

    const addContract = (contract: DeployedContract) => {
        const allContracts = getAllContractsMap();

        // Ensure deployer exists in map
        if (!allContracts[contract.deployer]) {
            allContracts[contract.deployer] = {};
        }

        // Ensure chainId exists for this deployer
        if (!allContracts[contract.deployer][contract.chainId]) {
            allContracts[contract.deployer][contract.chainId] = [];
        }

        // Add contract to the beginning of the array
        allContracts[contract.deployer][contract.chainId] = [
            contract,
            ...allContracts[contract.deployer][contract.chainId]
        ];

        saveContracts(allContracts);
        setContracts(getStoredContracts(deployerAddress));
    };

    const removeContract = (contractAddress: string, chainId: string) => {
        const allContracts = getAllContractsMap();

        if (deployerAddress && allContracts[deployerAddress]?.[chainId]) {
            allContracts[deployerAddress][chainId] = allContracts[deployerAddress][chainId].filter(
                c => c.address !== contractAddress
            );

            // Remove empty chainId
            if (allContracts[deployerAddress][chainId].length === 0) {
                delete allContracts[deployerAddress][chainId];
            }

            // Remove empty deployer
            if (Object.keys(allContracts[deployerAddress]).length === 0) {
                delete allContracts[deployerAddress];
            }

            saveContracts(allContracts);
            setContracts(getStoredContracts(deployerAddress));
        }
    };

    return { contracts, addContract, removeContract };
};
