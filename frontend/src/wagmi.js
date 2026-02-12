import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Aegis Protocol',
    projectId: 'YOUR_PROJECT_ID',
    chains: [base],
    ssr: false, // If your dApp uses server side rendering (SSR)
});
