/**
 * Airdrops Data Layer
 *
 * Provides data access for Crypto Airdrops
 * Currently uses mock data. Will be connected to separate Redis database/n8n workflow in the future.
 *
 * TODO: Connect to Airdrops workflow + Redis database
 * TODO: Set up airdrop tracking and notification system
 */

export type AirdropStatus = 'active' | 'upcoming' | 'ended' | 'claimed';
export type AirdropType = 'snapshot' | 'task-based' | 'holder' | 'referral' | 'testnet';

export interface Airdrop {
  id: string;
  project: string;
  token: string;
  tokenSymbol: string;
  description: string;
  totalValue: string; // e.g., "$1M USD"
  status: AirdropStatus;
  type: AirdropType;
  startDate: Date;
  endDate: Date;
  claimDeadline?: Date;
  requirements: string[];
  eligibilityCriteria: string;
  steps: string[];
  estimatedReward: string;
  website: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  verified: boolean;
}

// Mock airdrop data
const mockAirdrops: Airdrop[] = [
  {
    id: 'airdrop-1',
    project: 'Layer Zero',
    token: 'ZRO',
    tokenSymbol: 'ZRO',
    description: 'Cross-chain messaging protocol rewarding early users and testnet participants.',
    totalValue: '$500M USD',
    status: 'active',
    type: 'snapshot',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-01-31'),
    claimDeadline: new Date('2025-02-15'),
    requirements: [
      'Used LayerZero protocol before snapshot',
      'Made at least 5 cross-chain transactions',
      'Hold wallet snapshot proof',
    ],
    eligibilityCriteria: 'Users who interacted with LayerZero before December 1, 2024',
    steps: [
      'Connect your wallet to the claim portal',
      'Verify your eligibility',
      'Sign the claim transaction',
      'Tokens will be distributed to your wallet',
    ],
    estimatedReward: '100-500 ZRO ($500-$2,500)',
    website: 'https://layerzero.network',
    socialLinks: {
      twitter: 'https://twitter.com/layerzero',
      discord: 'https://discord.gg/layerzero',
    },
    verified: true,
  },
  {
    id: 'airdrop-2',
    project: 'zkSync Era',
    token: 'ZK',
    tokenSymbol: 'ZK',
    description: 'Ethereum Layer 2 scaling solution airdrop for mainnet users.',
    totalValue: '$300M USD',
    status: 'active',
    type: 'task-based',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2025-02-01'),
    requirements: [
      'Bridged funds to zkSync Era',
      'Made at least 10 transactions on Era',
      'Used 3+ different dApps',
      'Hold minimum $100 in wallet',
    ],
    eligibilityCriteria: 'Active zkSync Era users with on-chain activity',
    steps: [
      'Bridge assets to zkSync Era',
      'Complete transactions on different protocols',
      'Wait for snapshot',
      'Claim via official portal',
    ],
    estimatedReward: '200-800 ZK ($1,000-$4,000)',
    website: 'https://zksync.io',
    socialLinks: {
      twitter: 'https://twitter.com/zksync',
      discord: 'https://discord.gg/zksync',
    },
    verified: true,
  },
  {
    id: 'airdrop-3',
    project: 'Blast',
    token: 'BLAST',
    tokenSymbol: 'BLAST',
    description: 'L2 with native yield for ETH and stablecoins',
    totalValue: '$200M USD',
    status: 'upcoming',
    type: 'holder',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-03-01'),
    requirements: [
      'Bridge ETH or stablecoins to Blast',
      'Hold for minimum 30 days',
      'Participate in Blast ecosystem',
    ],
    eligibilityCriteria: 'Early depositors and ecosystem participants',
    steps: [
      'Bridge assets to Blast L2',
      'Hold and earn native yield',
      'Use Blast dApps',
      'Wait for airdrop announcement',
    ],
    estimatedReward: '500-2000 BLAST ($2,500-$10,000)',
    website: 'https://blast.io',
    socialLinks: {
      twitter: 'https://twitter.com/blast',
    },
    verified: true,
  },
  {
    id: 'airdrop-4',
    project: 'Scroll',
    token: 'SCR',
    tokenSymbol: 'SCR',
    description: 'zkEVM-based Layer 2 for Ethereum scaling',
    totalValue: '$150M USD',
    status: 'active',
    type: 'testnet',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-01-15'),
    requirements: [
      'Participate in testnet campaigns',
      'Bridge to Scroll mainnet',
      'Make transactions on Scroll',
      'Hold Scroll NFT badges',
    ],
    eligibilityCriteria: 'Testnet participants and early mainnet users',
    steps: [
      'Complete testnet tasks',
      'Bridge to mainnet',
      'Collect NFT badges',
      'Wait for snapshot',
    ],
    estimatedReward: '300-1200 SCR ($1,500-$6,000)',
    website: 'https://scroll.io',
    socialLinks: {
      twitter: 'https://twitter.com/scroll',
      discord: 'https://discord.gg/scroll',
    },
    verified: true,
  },
  {
    id: 'airdrop-5',
    project: 'Linea',
    token: 'LINEA',
    tokenSymbol: 'LINEA',
    description: 'ConsenSys zkEVM Layer 2 solution',
    totalValue: '$250M USD',
    status: 'upcoming',
    type: 'snapshot',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-03-31'),
    requirements: [
      'Bridge assets to Linea',
      'Use Linea dApps',
      'Hold Linea NFTs',
      'Participate in governance',
    ],
    eligibilityCriteria: 'Early adopters and active ecosystem participants',
    steps: [
      'Bridge to Linea network',
      'Interact with multiple dApps',
      'Mint commemorative NFTs',
      'Check eligibility when announced',
    ],
    estimatedReward: 'TBA',
    website: 'https://linea.build',
    socialLinks: {
      twitter: 'https://twitter.com/linea',
    },
    verified: true,
  },
  {
    id: 'airdrop-6',
    project: 'Berachain',
    token: 'BERA',
    tokenSymbol: 'BERA',
    description: 'EVM-compatible L1 with Proof of Liquidity consensus',
    totalValue: '$100M USD',
    status: 'upcoming',
    type: 'task-based',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-28'),
    requirements: [
      'Participate in testnet',
      'Provide liquidity on testnet DEX',
      'Complete social tasks',
      'Hold NFT badges',
    ],
    eligibilityCriteria: 'Testnet participants and community members',
    steps: [
      'Join Berachain testnet',
      'Complete tasks and earn badges',
      'Provide liquidity',
      'Wait for mainnet launch',
    ],
    estimatedReward: 'TBA',
    website: 'https://berachain.com',
    socialLinks: {
      twitter: 'https://twitter.com/berachain',
      discord: 'https://discord.gg/berachain',
    },
    verified: false,
  },
  {
    id: 'airdrop-7',
    project: 'Taiko',
    token: 'TKO',
    tokenSymbol: 'TKO',
    description: 'Type 1 zkEVM - most Ethereum-equivalent ZK-rollup',
    totalValue: '$180M USD',
    status: 'active',
    type: 'testnet',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-01-31'),
    requirements: [
      'Run Taiko node or prover',
      'Bridge assets to Taiko',
      'Make transactions on testnet/mainnet',
      'Participate in community',
    ],
    eligibilityCriteria: 'Node operators, provers, and active users',
    steps: [
      'Set up Taiko node (optional)',
      'Bridge to Taiko network',
      'Complete transactions',
      'Accumulate activity points',
    ],
    estimatedReward: '400-1500 TKO ($2,000-$7,500)',
    website: 'https://taiko.xyz',
    socialLinks: {
      twitter: 'https://twitter.com/taikoxyz',
      discord: 'https://discord.gg/taiko',
    },
    verified: true,
  },
  {
    id: 'airdrop-8',
    project: 'Manta Pacific',
    token: 'MANTA',
    tokenSymbol: 'MANTA',
    description: 'Modular L2 ecosystem for ZK applications',
    totalValue: '$120M USD',
    status: 'ended',
    type: 'snapshot',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-11-30'),
    claimDeadline: new Date('2024-12-31'),
    requirements: [
      'Used Manta Pacific before snapshot',
      'Held MANTA on Manta Network',
      'Participated in NPO campaigns',
    ],
    eligibilityCriteria: 'Early users and NPO participants',
    steps: [
      'Visit claim portal',
      'Connect eligible wallet',
      'Sign claim transaction',
      'Receive MANTA tokens',
    ],
    estimatedReward: '250-1000 MANTA ($1,250-$5,000)',
    website: 'https://manta.network',
    socialLinks: {
      twitter: 'https://twitter.com/mantanetwork',
    },
    verified: true,
  },
];

/**
 * Get all airdrops
 */
export async function getAllAirdrops(): Promise<Airdrop[]> {
  return mockAirdrops;
}

/**
 * Get active airdrops
 */
export async function getActiveAirdrops(): Promise<Airdrop[]> {
  return mockAirdrops.filter(airdrop => airdrop.status === 'active');
}

/**
 * Get upcoming airdrops
 */
export async function getUpcomingAirdrops(): Promise<Airdrop[]> {
  return mockAirdrops.filter(airdrop => airdrop.status === 'upcoming');
}

/**
 * Get airdrops by type
 */
export async function getAirdropsByType(type: AirdropType): Promise<Airdrop[]> {
  return mockAirdrops.filter(airdrop => airdrop.type === type);
}

/**
 * Get verified airdrops only
 */
export async function getVerifiedAirdrops(): Promise<Airdrop[]> {
  return mockAirdrops.filter(airdrop => airdrop.verified);
}

/**
 * Get airdrop by ID
 */
export async function getAirdropById(id: string): Promise<Airdrop | null> {
  return mockAirdrops.find(airdrop => airdrop.id === id) || null;
}

/**
 * Search airdrops
 */
export async function searchAirdrops(query: string): Promise<Airdrop[]> {
  const lowerQuery = query.toLowerCase();
  return mockAirdrops.filter(airdrop =>
    airdrop.project.toLowerCase().includes(lowerQuery) ||
    airdrop.token.toLowerCase().includes(lowerQuery) ||
    airdrop.description.toLowerCase().includes(lowerQuery)
  );
}
