// Contract Addresses
window.CONTRACT_ADDRESS = '0x9cf81A1814D452D4f5308aA38D128ce5CAADdDE4';
window.USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Contract ABIs
window.CONTRACT_ABI = [
  {"inputs":[],"name":"generateReferralCode","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"referralCode","type":"uint256"}],"name":"depositFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"deposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"currentAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"requestWithdrawal","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimDepositReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userReferrals","outputs":[{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"referralCode","type":"uint256"},{"internalType":"bool","name":"exists","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"calculateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
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
  }
];
