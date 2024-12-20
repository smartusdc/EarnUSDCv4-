// Contract Addresses
window.CONTRACT_ADDRESS = '0x9cf81A1814D452D4f5308aA38D128ce5CAADdDE4';
window.USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Constants from Contract
window.MIN_DEPOSIT = 0.1 * 10**6;  // 0.1 USDC (6 decimals)
window.WITHDRAWAL_DELAY = 3600;     // 1 hour in seconds

// Contract ABIs
window.CONTRACT_ABI = [
  // View Functions
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"deposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"currentAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"calculateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userReferrals","outputs":[{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"referralCode","type":"uint256"},{"internalType":"bool","name":"exists","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_referralCode","type":"uint256"}],"name":"getUserByReferralCode","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  
  // State Changing Functions
  {"inputs":[],"name":"generateReferralCode","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"depositFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimDepositReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},

  // Events
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"DepositRewardClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ReferralRewardClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"ReferralCodeCreated","type":"event"}
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
    "inputs": [
      {"name": "account","type": "address"}
    ],
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
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"name": "from","type": "address"},
      {"indexed": true,"name": "to","type": "address"},
      {"indexed": false,"name": "value","type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"name": "owner","type": "address"},
      {"indexed": true,"name": "spender","type": "address"},
      {"indexed": false,"name": "value","type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  }
];

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

// config.js - MAX_DECIMALSの更新

window.APP_CONSTANTS = {
  REWARD_UPDATE_INTERVAL: 60 * 1000,    // 1分（変更なし）
  ALERT_DURATION: 5000,                 // 5秒（変更なし）
  MAX_DECIMALS: 4,                      // 小数点以下4桁に変更（0.0001単位）
  GAS_LIMIT_BUFFER: 1.2,                // 20%（変更なし）
  DEFAULT_GAS_PRICE: '100'              // 維持
};
