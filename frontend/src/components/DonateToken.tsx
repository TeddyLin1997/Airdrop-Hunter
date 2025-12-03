import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSnackbar } from '../context/SnackbarContext';
import { getChain } from '../utils/chains';
import { ethers } from 'ethers';
import { Heart, Loader2, Send, Coins } from 'lucide-react';

const DONATE_ADDRESS = '0x5244361b12ED6716B3aD9bA46dd23252A72D22C7';

// Standard ERC20 ABI for transfer and balanceOf
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];

type TokenType = 'native' | 'erc20';

export const DonateToken: React.FC = () => {
    const { signer, account, provider, chainId } = useWeb3();
    const { showSnackbar } = useSnackbar();
    const [tokenType, setTokenType] = useState<TokenType>('native');
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [donating, setDonating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenInfo, setTokenInfo] = useState<{ symbol: string; balance: string; decimals: number; rawBalance: bigint } | null>(null);
    const [nativeBalance, setNativeBalance] = useState<string>('0');
    const [rawNativeBalance, setRawNativeBalance] = useState<bigint>(0n);

    // Get current chain info
    const currentChain = chainId ? getChain(parseInt(chainId, 10)) : null;
    const nativeSymbol = currentChain?.nativeCurrency?.symbol || ''

    // Load native token balance
    useEffect(() => {
        const loadNativeBalance = async () => {
            if (!provider || !account) return;

            try {
                const balance = await provider.getBalance(account);
                setRawNativeBalance(balance);
                setNativeBalance(ethers.formatEther(balance));
            } catch (err) {
                console.error('Failed to load native balance:', err);
            }
        };

        if (tokenType === 'native') {
            loadNativeBalance();
        }
    }, [provider, account, tokenType]);

    // Reset state when switching token type
    useEffect(() => {
        setTokenAddress('');
        setAmount('');
        setTokenInfo(null);
    }, [tokenType]);

    const handleLoadToken = async () => {
        if (!signer || !tokenAddress) return;

        setLoading(true);
        setTokenInfo(null);
        try {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

            const [symbol, decimals, balance] = await Promise.all([
                contract.symbol(),
                contract.decimals(),
                contract.balanceOf(account),
            ]);

            const formattedBalance = ethers.formatUnits(balance, decimals);

            setTokenInfo({
                symbol,
                balance: formattedBalance,
                decimals: Number(decimals),
                rawBalance: balance,
            });

            showSnackbar(`Token loaded: ${symbol}`, 'success');
        } catch (err) {
            console.error('Failed to load token:', err);
            showSnackbar('Invalid token address or failed to load token', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDonateNativeAll = async () => {
        if (!signer || !provider || !account) return;

        setDonating(true);
        showSnackbar('Preparing donation transaction...', 'info');

        try {
            const balance = await provider.getBalance(account);

            // Estimate gas for the transaction by simulating it
            const gasLimit = await provider.estimateGas({
                to: DONATE_ADDRESS,
                from: account,
                value: ethers.parseEther('0.001'), // Use a small amount for estimation
            });

            // Get current gas price from the network
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');

            // Calculate gas cost with 50% buffer for safety (1.5x the estimated cost)
            const estimatedGasCost = gasLimit * gasPrice;
            const gasCostWithBuffer = (estimatedGasCost * 150n) / 100n;

            // Amount to send = balance - gas cost with buffer
            const amountToSend = balance - gasCostWithBuffer;

            if (amountToSend <= 0n) {
                showSnackbar('Insufficient balance to cover gas fees', 'error');
                setDonating(false);
                return;
            }

            showSnackbar('Please confirm the transaction in your wallet...', 'info');
            const tx = await signer.sendTransaction({
                to: DONATE_ADDRESS,
                value: amountToSend,
            });

            showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            showSnackbar(
                `Successfully donated ${ethers.formatEther(amountToSend)} ${nativeSymbol}!`,
                'success'
            );

            // Reload native balance
            const newBalance = await provider.getBalance(account);
            setRawNativeBalance(newBalance);
            setNativeBalance(ethers.formatEther(newBalance));
            setAmount('');
        } catch (err) {
            console.error('Donation failed:', err);
            const errorMessage = (err as Error).message || 'Donation failed';
            showSnackbar(errorMessage, 'error');
        } finally {
            setDonating(false);
        }
    };

    const handleDonateNativeCustom = async () => {
        if (!signer || !provider || !account || !amount) return;

        try {
            // Validate amount format first
            const amountInWei = ethers.parseEther(amount);
            if (amountInWei <= 0n) {
                showSnackbar('Please enter a valid amount', 'error');
                return;
            }

            if (amountInWei > rawNativeBalance) {
                showSnackbar('Amount exceeds balance', 'error');
                return;
            }

            setDonating(true);
            showSnackbar('Preparing donation transaction...', 'info');

            // Estimate gas for the transaction by simulating it
            const gasLimit = await provider.estimateGas({
                to: DONATE_ADDRESS,
                from: account,
                value: amountInWei,
            });

            // Get current gas price from the network
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');

            // Calculate gas cost with 50% buffer for safety (1.5x the estimated cost)
            const estimatedGasCost = gasLimit * gasPrice;
            const gasCostWithBuffer = (estimatedGasCost * 150n) / 100n;

            // Check if user has enough balance for amount + gas + buffer
            const balance = await provider.getBalance(account);
            if (balance < amountInWei + gasCostWithBuffer) {
                showSnackbar('Insufficient balance to cover amount and gas fees', 'error');
                setDonating(false);
                return;
            }

            showSnackbar('Please confirm the transaction in your wallet...', 'info');
            const tx = await signer.sendTransaction({
                to: DONATE_ADDRESS,
                value: amountInWei,
            });

            showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            showSnackbar(
                `Successfully donated ${amount} ${nativeSymbol}!`,
                'success'
            );

            // Reload native balance
            const newBalance = await provider.getBalance(account);
            setRawNativeBalance(newBalance);
            setNativeBalance(ethers.formatEther(newBalance));
            setAmount('');
        } catch (err) {
            console.error('Donation failed:', err);
            // Check for parse errors specifically
            if ((err as Error).message.includes('invalid decimal')) {
                showSnackbar('Invalid amount format', 'error');
            } else {
                const errorMessage = (err as Error).message || 'Donation failed';
                showSnackbar(errorMessage, 'error');
            }
        } finally {
            setDonating(false);
        }
    };

    const handleDonateERC20All = async () => {
        if (!signer || !tokenAddress || !tokenInfo) return;

        setDonating(true);
        showSnackbar('Preparing donation transaction...', 'info');

        try {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const balance = await contract.balanceOf(account);

            if (balance === 0n) {
                showSnackbar('No tokens to donate', 'error');
                setDonating(false);
                return;
            }

            showSnackbar('Please confirm the transaction in your wallet...', 'info');
            const tx = await contract.transfer(DONATE_ADDRESS, balance);

            showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            showSnackbar(
                `Successfully donated ${ethers.formatUnits(balance, tokenInfo.decimals)} ${tokenInfo.symbol}!`,
                'success'
            );

            // Reload token info
            handleLoadToken();
            setAmount('');
        } catch (err) {
            console.error('Donation failed:', err);
            const errorMessage = (err as Error).message || 'Donation failed';
            showSnackbar(errorMessage, 'error');
        } finally {
            setDonating(false);
        }
    };

    const handleDonateERC20Custom = async () => {
        if (!signer || !tokenAddress || !amount || !tokenInfo) return;

        try {
            const amountInWei = ethers.parseUnits(amount, tokenInfo.decimals);

            if (amountInWei <= 0n) {
                showSnackbar('Please enter a valid amount', 'error');
                return;
            }

            if (amountInWei > tokenInfo.rawBalance) {
                showSnackbar('Amount exceeds balance', 'error');
                return;
            }

            setDonating(true);
            showSnackbar('Preparing donation transaction...', 'info');

            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

            showSnackbar('Please confirm the transaction in your wallet...', 'info');
            const tx = await contract.transfer(DONATE_ADDRESS, amountInWei);

            showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();

            showSnackbar(
                `Successfully donated ${amount} ${tokenInfo.symbol}!`,
                'success'
            );

            // Reload token info
            handleLoadToken();
            setAmount('');
        } catch (err) {
            console.error('Donation failed:', err);
            if ((err as Error).message.includes('invalid decimal')) {
                showSnackbar('Invalid amount format', 'error');
            } else {
                const errorMessage = (err as Error).message || 'Donation failed';
                showSnackbar(errorMessage, 'error');
            }
        } finally {
            setDonating(false);
        }
    };

    if (!account) {
        return (
            <div className="bg-card/50 p-8 rounded-2xl shadow-xl border border-border text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-secondary p-4 rounded-full mb-4">
                    <Heart className="text-muted-foreground" size={32} />
                </div>
                <p className="text-lg font-medium">Connect your wallet</p>
                <p className="text-sm mt-2">Connect your wallet to donate tokens</p>
            </div>
        );
    }

    return (
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-3 text-primary">
                <Heart className="text-primary" size={24} />
                Donate Tokens
            </h2>

            <div className="space-y-6">
                {/* Chain Info */}
                {currentChain && (
                    <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Coins size={18} />
                            <span className="text-sm font-medium">
                                Connected to {currentChain.name} - Native Token: {nativeSymbol}
                            </span>
                        </div>
                    </div>
                )}

                {/* Donate Address Info */}
                <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Donation Recipient</p>
                    <p className="text-sm font-mono text-foreground break-all">{DONATE_ADDRESS}</p>
                </div>

                {/* Token Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Token Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setTokenType('native')}
                            className={`p-4 rounded-xl border-2 transition-all ${tokenType === 'native'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Coins size={24} />
                                <span className="font-semibold text-sm">Native Token</span>
                                <span className="text-xs opacity-70">{nativeSymbol}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setTokenType('erc20')}
                            className={`p-4 rounded-xl border-2 transition-all ${tokenType === 'erc20'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/50'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Send size={24} />
                                <span className="font-semibold text-sm">ERC20 Token</span>
                                <span className="text-xs opacity-70">Custom</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Native Token Section */}
                {tokenType === 'native' && (
                    <>
                        <div className="bg-secondary/50 p-4 rounded-xl border border-border space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Your Balance:</span>
                                <span className="text-sm font-semibold text-primary">
                                    {parseFloat(nativeBalance).toFixed(6)} {nativeSymbol}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Amount (Optional - leave empty to donate all)
                            </label>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`Enter amount or leave empty for all (Native Token)`}
                                className="w-full rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                            />
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleDonateNativeAll}
                                disabled={donating || !signer || parseFloat(nativeBalance) === 0}
                                className="w-full flex items-center justify-center gap-2 bg-gold-gradient hover:bg-gold-gradient-hover text-black py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {donating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Heart size={20} />
                                        Donate All {nativeSymbol}
                                    </>
                                )}
                            </button>

                            {amount && (
                                <button
                                    onClick={handleDonateNativeCustom}
                                    disabled={donating || !signer}
                                    className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {donating ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Donate {amount} {nativeSymbol}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* ERC20 Token Section */}
                {tokenType === 'erc20' && (
                    <>
                        {/* Token Address Input */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Token Contract Address
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tokenAddress}
                                    onChange={(e) => setTokenAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="flex-1 rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder-muted-foreground font-mono"
                                />
                                <button
                                    onClick={handleLoadToken}
                                    disabled={!tokenAddress || loading}
                                    className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        'Load'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Token Info */}
                        {tokenInfo && (
                            <div className="bg-secondary/50 p-4 rounded-xl border border-border space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Token Symbol:</span>
                                    <span className="text-sm font-semibold text-foreground">{tokenInfo.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Your Balance:</span>
                                    <span className="text-sm font-semibold text-primary">
                                        {parseFloat(tokenInfo.balance).toFixed(6)} {tokenInfo.symbol}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Amount Input */}
                        {tokenInfo && (
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Amount (Optional - leave empty to donate all)
                                </label>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={`Enter amount or leave empty for all (${tokenInfo.symbol})`}
                                    className="w-full rounded-lg bg-background border-input text-foreground p-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none placeholder-muted-foreground"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        {tokenInfo && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleDonateERC20All}
                                    disabled={donating || !signer}
                                    className="w-full flex items-center justify-center gap-2 bg-gold-gradient hover:bg-gold-gradient-hover text-black py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {donating ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={20} />
                                            Donate All {tokenInfo.symbol}
                                        </>
                                    )}
                                </button>

                                {amount && (
                                    <button
                                        onClick={handleDonateERC20Custom}
                                        disabled={donating || !signer}
                                        className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {donating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Donate {amount} {tokenInfo.symbol}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Info Box */}
                <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg text-sm text-blue-400">
                    <p className="font-semibold mb-2">ℹ️ How to use:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Select Native Token or ERC20 Token</li>
                        <li>For ERC20: Enter token contract address and click "Load"</li>
                        <li>View your balance and enter custom amount (optional)</li>
                        <li>Click donate button and confirm in your wallet</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
