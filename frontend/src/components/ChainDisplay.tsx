import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getChain } from '../utils/chains';
import { Network, Info, X } from 'lucide-react';

export const ChainDisplay: React.FC = () => {
  const { chainId } = useWeb3();
  const [showModal, setShowModal] = useState(false);

  if (!chainId) {
    return null;
  }

  const chainIdNum = parseInt(chainId, 10);
  const chain = getChain(chainIdNum);
  const chainName = chain ? chain.name : '-';
  const chainIdText = `Chain ID: ${chainId}`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-4 px-4 py-1 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center">
          <Network size={18} className="text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {chainName}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {chainIdText}
          </span>
        </div>
      </button>

      {/* Info Modal */}
      {showModal && (
        <div className="fixed h-screen inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-[#0A0A0B] border border-white/10 p-0 rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header Background */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-2xl bg-[#0A0A0B] border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Network size={32} className="text-primary" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-8 pb-6 px-6 text-center">
              <h3 className="text-xl font-bold text-white mb-1">{chainName}</h3>
              <p className="text-sm text-white/50 mb-6">Connected Network</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Chain ID</p>
                  <p className="text-sm font-mono font-medium text-primary">{chainId}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-white/40 mb-1">Currency</p>
                  <p className="text-sm font-medium text-white">{chain?.nativeCurrency?.symbol || 'ETH'}</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6 text-left flex gap-3">
                <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-blue-200/80 leading-relaxed">
                  To switch networks, please use your wallet application (e.g., MetaMask). The app will automatically update.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover text-black rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
