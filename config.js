// Contract Addresses
window.CONTRACT_ADDRESS = '0x3038eBDFF5C17d9B0f07871b66FCDc7B9329fCD8';
window.USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Constants from Contract
window.MIN_DEPOSIT = 0.01 * 10**6;  // 0.01 USDC (6 decimals)

// Application constants
window.APP_CONSTANTS = {
    REWARD_UPDATE_INTERVAL: 60 * 1000,    // 1 minute in milliseconds
    ALERT_DURATION: 5000,                 // 5 seconds
    MAX_DECIMALS: 4,                      // 小数点以下4桁
    GAS_LIMIT_BUFFER: 1.2,                // 20% buffer for gas limit
    DEFAULT_GAS_PRICE: '100',             // Fallback gas price
    RANK_COLORS: {
        'Normal': 'bg-gray-100 text-gray-800',
        'Silver': 'bg-gray-200 text-gray-800',
        'Gold': 'bg-yellow-100 text-yellow-800',
        'Platinum': 'bg-purple-100 text-purple-800',
        'Whale': 'bg-blue-100 text-blue-800'
    }
};

// Chain configuration
window.CHAIN_CONFIG = {
    chainId: '0x2105', // Base Mainnet
    chainName: 'Base',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org/'],
    iconUrls: ["https://raw.githubusercontent.com/ethereum-optimism/brand-kit/main/assets/svg/Base_Network_Logo.svg"]
};

// Contract ABIs
window.CONTRACT_ABI = [
    // View Functions
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"deposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"currentAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"calculateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserRank","outputs":[{"internalType":"uint256","name":"rankId","type":"uint256"},{"internalType":"string","name":"rankName","type":"string"},{"internalType":"uint256","name":"bonusRate","type":"uint256"},{"internalType":"uint256","name":"nextRankThreshold","type":"uint256"},{"internalType":"uint256","name":"progressToNextRank","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRewardStats","outputs":[{"internalType":"uint256","name":"totalDepositRewards","type":"uint256"},{"internalType":"uint256","name":"totalBonusRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdateTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"referralCodeToUser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    
    // State Changing Functions
    {"inputs":[],"name":"generateReferralCode","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"depositFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"claimDepositReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},

    // Events
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bonusAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalAccumulatedRewards","type":"uint256"}],"name":"DepositRewardClaimed","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ReferralRewardClaimed","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"ReferralCodeCreated","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"ReferralProcessed","type":"event"}
];

window.USDC_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "spender","type": "address"},
            {"name": "amount","type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "","type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "owner","type": "address"},
            {"name": "spender","type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "","type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "account","type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "","type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "recipient","type": "address"},
            {"name": "amount","type":"uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "","type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
