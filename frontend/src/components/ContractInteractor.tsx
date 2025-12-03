import React, { useState, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSnackbar } from '../context/SnackbarContext';
import type { DeployedContract } from '../hooks/useContractStorage';
import { ethers } from 'ethers';
import { Play, Loader2, Trash2, Copy } from 'lucide-react';
import type { AbiFunction, AbiParameter } from 'viem';

interface InteractorProps {
    contracts: DeployedContract[];
    onRemove: (address: string) => void;
}

export const ContractInteractor: React.FC<InteractorProps> = ({ contracts, onRemove }) => {
    const { signer, chainId } = useWeb3();
    const { showSnackbar } = useSnackbar();
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [selectedFunction, setSelectedFunction] = useState<string>('');
    const [args, setArgs] = useState<Record<string, string>>({});
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [contractToRemove, setContractToRemove] = useState<string | null>(null);

    // Filter contracts by current chain
    const availableContracts = useMemo(() => {
        if (!chainId) return [];
        return contracts.filter(c => c.chainId === chainId);
    }, [contracts, chainId]);

    const currentContract = useMemo(() => {
        return availableContracts.find(c => c.address === selectedAddress);
    }, [selectedAddress, availableContracts]);

    const functions = useMemo(() => {
        if (!currentContract) return [];
        return currentContract.abi.filter(item => item.type === 'function') as AbiFunction[];
    }, [currentContract]);

    const currentFunction = useMemo(() => {
        return functions.find(f => f.name === selectedFunction);
    }, [selectedFunction, functions]);

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !currentContract || !currentFunction) return;

        setExecuting(true);
        setError(null);
        setResult(null);
        showSnackbar('Executing transaction...', 'info');

        try {
            const contract = new ethers.Contract(currentContract.address, currentContract.abi as any, signer);

            const funcArgs = (currentFunction.inputs as AbiParameter[]).map(input => args[input.name || ''] || '');

            // Check if it's a read or write function
            const isView = currentFunction.stateMutability === 'view' || currentFunction.stateMutability === 'pure';

            let tx;
            if (isView) {
                tx = await contract[currentFunction.name](...funcArgs);
                setResult(String(tx));
                showSnackbar('Read operation successful', 'success');
            } else {
                const transaction = await contract[currentFunction.name](...funcArgs);
                showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
                await transaction.wait();
                setResult(`Transaction confirmed: ${transaction.hash}`);
                showSnackbar('Transaction confirmed successfully!', 'success');
            }
        } catch (err) {
            console.error("Execution failed:", err);
            const errorMessage = (err as Error).message || "Execution failed";
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setExecuting(false);
        }
    };

    const confirmRemove = () => {
        if (contractToRemove) {
            onRemove(contractToRemove);
            setContractToRemove(null);
            if (selectedAddress === contractToRemove) {
                setSelectedAddress('');
                setSelectedFunction('');
                setArgs({});
                setResult(null);
                setError(null);
            }
        }
    };

    if (availableContracts.length === 0) {
        return (
            <div className="bg-card/50 p-8 rounded-2xl shadow-xl border border-border text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="bg-secondary p-4 rounded-full mb-4">
                    <Play className="text-muted-foreground" size={32} />
                </div>
                <p className="text-lg font-medium">No contracts deployed</p>
                <p className="text-sm mt-2">Deploy a contract to get started</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
                <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3 text-primary">
                    <Play className="text-primary" size={24} />
                    Interact with Contract
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Select Contract</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedAddress}
                                onChange={(e) => {
                                    setSelectedAddress(e.target.value);
                                    setSelectedFunction('');
                                    setArgs({});
                                    setResult(null);
                                    setError(null);
                                }}
                                className="w-full rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            >
                                <option value="">-- Select a contract --</option>
                                {availableContracts.map(c => (
                                    <option key={c.address} value={c.address}>
                                        {c.name} ({c.address.substring(0, 6)}...{c.address.substring(c.address.length - 4)})
                                    </option>
                                ))}
                            </select>
                            {selectedAddress && (
                                <button
                                    onClick={() => setContractToRemove(selectedAddress)}
                                    className="p-3 text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/30 transition-colors"
                                    title="Remove from list"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        {/* Selected Contract Address Display */}
                        {selectedAddress && (
                            <div
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedAddress);
                                    showSnackbar('Address copied to clipboard', 'success');
                                }}
                                className="flex items-center justify-between px-4 py-3 bg-secondary/30 rounded-xl border border-border hover:border-primary/50 cursor-pointer group transition-all mt-4"
                                title="Click to copy address"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground mb-0.5">Contract Address</span>
                                    <span className="text-sm font-mono text-foreground break-all group-hover:text-primary transition-colors">
                                        {selectedAddress}
                                    </span>
                                </div>
                                <div className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
                                    <Copy size={16} />
                                </div>
                            </div>
                        )}
                    </div>

                    {currentContract && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Function</label>
                                <select
                                    value={selectedFunction}
                                    onChange={(e) => {
                                        setSelectedFunction(e.target.value);
                                        setArgs({});
                                        setResult(null);
                                        setError(null);
                                    }}
                                    className="w-full rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                >
                                    <option value="">-- Select a function --</option>
                                    {functions.map(f => (
                                        <option key={f.name} value={f.name}>
                                            {f.name} ({f.stateMutability})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {currentFunction && (
                                <form onSubmit={handleExecute} className="space-y-6">
                                    {(currentFunction.inputs as AbiParameter[]).length > 0 && (
                                        <div className="bg-secondary/50 p-6 rounded-xl border border-border">
                                            <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Arguments</h3>
                                            <div className="space-y-4">
                                                {(currentFunction.inputs as AbiParameter[]).map((input, idx: number) => (
                                                    <div key={idx}>
                                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                                            {input.name || `Arg ${idx}`} <span className="text-muted-foreground/70">({input.type})</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={args[input.name || ''] || ''}
                                                            onChange={(e) => setArgs(prev => ({ ...prev, [input.name || '']: e.target.value }))}
                                                            className="w-full rounded-lg bg-background border-input text-foreground p-2.5 focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                                                            placeholder={`${input.type}`}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-destructive/20 border border-destructive/50 text-destructive text-sm rounded-lg break-words">
                                            {error}
                                        </div>
                                    )}

                                    {result && (
                                        <div className="p-4 bg-green-900/20 border border-green-900/50 text-green-400 text-sm rounded-lg break-words font-mono">
                                            <strong>Result:</strong> {result}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={executing || !signer}
                                        className="w-full flex items-center justify-center gap-2 bg-gold-gradient hover:bg-gold-gradient-hover text-black py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {executing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Executing...
                                            </>
                                        ) : (
                                            'Execute'
                                        )}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {contractToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-foreground mb-2">Remove Contract?</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to remove this contract from your list? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setContractToRemove(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
