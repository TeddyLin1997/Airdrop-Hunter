interface Window {
    ethereum: import('ethers').Eip1193Provider & {
        on: (eventName: string, listener: (...args: any[]) => void) => void;
        removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
    };
}
