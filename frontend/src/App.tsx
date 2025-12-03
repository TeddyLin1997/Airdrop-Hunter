import React from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { ContractDeployer } from './components/ContractDeployer';
import { ContractInteractor } from './components/ContractInteractor';
import { DonateToken } from './components/DonateToken';
import { useContractStorage } from './hooks/useContractStorage';
import type { Abi } from 'viem';
import { SnackbarProvider } from './context/SnackbarContext';
import { Snackbar } from './components/Snackbar';
import { Layout } from './components/Layout';
import { Rocket, Zap, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { account, chainId } = useWeb3();
  const { contracts, addContract, removeContract } = useContractStorage(account || undefined);

  const handleDeploy = (address: string, name: string, abi: Abi) => {
    if (chainId && account) {
      addContract({
        address,
        name,
        abi,
        chainId,
        deployedAt: Date.now(),
        deployer: account
      });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
          ✨ The Ultimate Airdrop Tool
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-display text-foreground mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <span className="mr-4 text-transparent bg-clip-text bg-gold-gradient">AirDrop</span>
          <span>Hunter</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          With OneBase AirDrop, quickly participate in new blockchain testnets and mainnets. Deploy, interact, and manage your smart contracts while maximizing airdrop rewards—efficient, stylish, and intuitive.
        </p>

        {!account && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <p className="text-primary font-medium">Connect your wallet to get started</p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Rocket, title: 'Instant Deploy', desc: 'Rapidly deploy to emerging testnets and mainnets to secure early participant status.' },
          { icon: Zap, title: 'Smart Interaction', desc: 'Intuitive interfaces to boost your on-chain activity and maximize airdrop rewards.' },
          { icon: Shield, title: 'Secure & Safe', desc: 'Efficient and secure contract management designed for the professional airdrop hunter.' },
        ].map((feature, idx) => (
          <div key={idx} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <feature.icon className="text-muted-foreground group-hover:text-primary transition-colors" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Main App Area */}
      {account && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ContractDeployer onDeploy={handleDeploy} />
            </div>
            <div className="space-y-8">
              <ContractInteractor contracts={contracts} onRemove={removeContract} />
            </div>
          </div>

          {/* Donate Section */}
          <div className="grid grid-cols-1">
            <DonateToken />
          </div>
        </div>
      )}
    </Layout>
  );
};

function App() {
  return (
    <Web3Provider>
      <SnackbarProvider>
        <Dashboard />
        <Snackbar />
      </SnackbarProvider>
    </Web3Provider>
  );
}

export default App;
