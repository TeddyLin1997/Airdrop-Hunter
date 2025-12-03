import React from 'react';
import { WalletConnect } from './WalletConnect';
import { ChainDisplay } from './ChainDisplay';
import { Box } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gold-gradient p-2 rounded-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Box className="text-black w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gold-gradient tracking-wide">
                <span className="text-white">AirDrop</span>
                <span className="mr-4 text-primary">Hunter</span>
              </h1>
              <h1 className='flex items-center font-semibold'>
                <span className="text-foreground/70">Chain Interaction Tool</span>
                <span className="ml-1 text-white">- One</span>
                <span className="text-primary">Base</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ChainDisplay />
              <div className="h-6 w-px bg-border hidden md:block"></div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Box className="text-primary w-5 h-5" />
            <span className="text-lg font-display font-bold text-muted-foreground">OneBase</span>
          </div>

          <p className="text-muted-foreground text-sm">
            © 2024 OneBase AirDrop Hunter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
