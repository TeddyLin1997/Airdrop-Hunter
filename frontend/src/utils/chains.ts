import {
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    arbitrum,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
    base,
    baseSepolia,
    zora,
    zoraSepolia,
    localhost,
    type Chain,
} from 'viem/chains';

export const supportedChains: Chain[] = [
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    arbitrum,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
    base,
    baseSepolia,
    zora,
    zoraSepolia,
    { ...localhost, id: 31337, name: 'Localhost' },
];

export const getChain = (chainId: number): Chain | undefined => {
    return supportedChains.find(chain => chain.id === chainId);
};