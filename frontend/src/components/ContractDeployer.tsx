import React, { useState, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Rocket, Loader2 } from 'lucide-react';
import type { Abi, AbiParameter } from 'viem';

// Dynamically import all JSON artifacts
const artifactModules = import.meta.glob('../artifacts/*.json', { eager: true });

interface DeployerProps {
    onDeploy: (address: string, artifactName: string, abi: Abi) => void;
}

interface Artifact {
    name: string;
    abi: Abi;
    bytecode: string;
    path: string;
}

interface ArtifactModule {
    abi: Abi;
    bytecode: string;
}

export const ContractDeployer: React.FC<DeployerProps> = ({ onDeploy }) => {
    const { signer } = useWeb3();
    const [selectedArtifact, setSelectedArtifact] = useState<string>('');
    const [args, setArgs] = useState<Record<string, string>>({});
    const [deploying, setDeploying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const artifacts: Artifact[] = useMemo(() => {
        return Object.entries(artifactModules).map(([path, module]) => {
            const name = path.split('/').pop()?.replace('.json', '') || '';
            const { abi, bytecode } = module as ArtifactModule;
            return {
                name,
                abi,
                bytecode,
                path
            };
        }).filter(a => a.abi && a.bytecode && a.bytecode !== '0x');
    }, []);

    const currentArtifact = useMemo(() => {
        return artifacts.find(a => a.name === selectedArtifact);
    }, [selectedArtifact, artifacts]);

    const constructorInputs = useMemo(() => {
        if (!currentArtifact) return [];
        const constructor = currentArtifact.abi.find(item => item.type === 'constructor');
        return constructor ? (constructor.inputs as AbiParameter[]) : [];
    }, [currentArtifact]);

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer || !currentArtifact) return;

        setDeploying(true);
        setError(null);

        try {
            const factory = new ethers.ContractFactory(currentArtifact.abi as any, currentArtifact.bytecode, signer);

            const deployArgs = constructorInputs.map((input: AbiParameter) => args[input.name || ''] || '');

            const contract = await factory.deploy(...deployArgs);
            await contract.waitForDeployment();

            const address = await contract.getAddress();
            onDeploy(address, currentArtifact.name, currentArtifact.abi);

            // Reset form
            setArgs({});
        } catch (err) {
            console.error("Deployment failed:", err);
            setError((err as Error).message || "Deployment failed");
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3 text-primary">
                <Rocket className="text-primary" size={24} />
                Deploy Contract
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Select Contract</label>
                    <select
                        value={selectedArtifact}
                        onChange={(e) => {
                            setSelectedArtifact(e.target.value);
                            setArgs({});
                        }}
                        className="w-full rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                    >
                        <option value="">-- Select a contract --</option>
                        {artifacts.map(a => (
                            <option key={a.name} value={a.name}>{a.name}</option>
                        ))}
                    </select>
                </div>

                {currentArtifact && (
                    <form onSubmit={handleDeploy} className="space-y-6">
                        {constructorInputs.length > 0 && (
                            <div className="bg-secondary/50 p-6 rounded-xl border border-border">
                                <h3 className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">Constructor Arguments</h3>
                                <div className="space-y-4">
                                    {constructorInputs.map((input: AbiParameter, idx: number) => (
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
                            <div className="p-4 bg-destructive/20 border border-destructive/50 text-destructive text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={deploying || !signer}
                            className="w-full flex items-center justify-center gap-2 bg-gold-gradient hover:bg-gold-gradient-hover text-black py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {deploying ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Deploying...
                                </>
                            ) : (
                                'Deploy Contract'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
