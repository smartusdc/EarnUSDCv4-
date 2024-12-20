// Global variables
window.web3 = null;
window.contract = null;
window.usdcContract = null;
window.currentAccount = '';
window.rewardUpdateInterval = null;

// Application state
window.state = {
  balance: '0.000000',
  apr: '0',
  referralCode: '',
  depositReward: '0.000000',
  referralReward: '0.000000',
  isWalletConnected: false,
  isLoading: false,
  usdcBalance: '0.000000',
  referralStats: {
    totalReferrals: 0,
    referrerRate: 5,
    referredRate: 7
  }
};

// Clean up function
window.cleanup = function() {
  if (rewardUpdateInterval) {
    clearInterval(rewardUpdateInterval);
  }
  window.state = {
    balance: '0.000000',
    apr: '0',
    referralCode: '',
    depositReward: '0.000000',
    referralReward: '0.000000',
    isWalletConnected: false,
    isLoading: false,
    usdcBalance: '0.000000',
    referralStats: {
      totalReferrals: 0,
      referrerRate: 5,
      referredRate: 7
    }
  };
}

// Utility functions
window.setLoading = function(isLoading) {
  window.state.isLoading = isLoading;
  renderUI();
}

window.getBaseGasPrice = async function() {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return Math.max(Math.floor(Number(gasPrice) * APP_CONSTANTS.GAS_LIMIT_BUFFER), Number(APP_CONSTANTS.DEFAULT_GAS_PRICE));
  } catch (error) {
    console.error('Gas price fetch error:', error);
    return APP_CONSTANTS.DEFAULT_GAS_PRICE;
  }
}

window.showAlert = function(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${
    type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info'
  }`;
  alertDiv.textContent = message;
  
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const existingAlert = alertContainer.querySelector('.alert');
  if (existingAlert) existingAlert.remove();
  
  alertContainer.prepend(alertDiv);
  
  setTimeout(() => {
    if (alertDiv.parentElement === alertContainer) {
      alertDiv.remove();
    }
  }, APP_CONSTANTS.ALERT_DURATION);
}

window.handleTransactionError = function(error) {
  console.error('Transaction error:', error);
  
  // Network related errors
  if (error.code === 4902) {
    showAlert('Please add Base Network to your wallet. Click OK to add it automatically.', 'error');
    addBaseNetwork();
    return;
  }
  
  // User action related errors
  if (error.code === 4001) {
    showAlert('Transaction rejected in your wallet', 'error');
    return;
  }
  
  // Contract specific errors
  if (error.message?.includes('ERC20: insufficient allowance')) {
    showAlert('Please approve USDC spending first', 'error');
    return;
  }
  
  if (error.message?.includes('insufficient funds')) {
    showAlert('Insufficient funds for transaction', 'error');
    return;
  }

  if (error.message?.includes('user rejected')) {
    showAlert('Transaction cancelled', 'error');
    return;
  }
  
  // Generic error
  showAlert(`Transaction failed: ${error.message || 'Unknown error'}`, 'error');
}

// Core initialization
window.initContract = async function() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    usdcContract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    
    // Setup reward update interval
    if (rewardUpdateInterval) {
      clearInterval(rewardUpdateInterval);
    }
    rewardUpdateInterval = setInterval(updateRewards, APP_CONSTANTS.REWARD_UPDATE_INTERVAL);
    
    // Initial rewards update
    await updateRewards();
  } catch (error) {
    console.error('Contract initialization error:', error);
    showAlert('Failed to initialize. Please check your wallet connection.', 'error');
    throw error;
  }
}

// Network functions
window.addBaseNetwork = async function() {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [CHAIN_CONFIG],
    });
  } catch (error) {
    console.error('Failed to add Base network:', error);
    showAlert('Failed to add Base network. Please try manually.', 'error');
  }
}

// Wallet connection
window.connectWallet = async function() {
  try {
    if (!window.ethereum) {
      showAlert('Please install MetaMask to continue', 'error');
      return;
    }

    setLoading(true);
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Check network
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== CHAIN_CONFIG.chainId) {
      showAlert('Switching to Base Network...', 'info');
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHAIN_CONFIG.chainId }],
        });
      } catch (error) {
        if (error.code === 4902) {
          await addBaseNetwork();
        } else {
          throw error;
        }
      }
    }

    currentAccount = accounts[0];
    window.state.isWalletConnected = true;
    await initContract();
    
    // Generate referral code if needed
    const userReferral = await contract.methods.userReferrals(currentAccount).call();
    if (!userReferral.exists || userReferral.referralCode === '0') {
      showAlert('Setting up your account...', 'info');
      const gasPrice = await getBaseGasPrice();
      const tx = await contract.methods.generateReferralCode()
        .send({ 
          from: currentAccount,
          gasPrice: gasPrice
        });
      
      if (tx.status) {
        const newUserReferral = await contract.methods.userReferrals(currentAccount).call();
        window.state.referralCode = newUserReferral.referralCode;
        showAlert('Your account is ready!', 'success');
      }
    } else {
      window.state.referralCode = userReferral.referralCode;
    }
    
    await updateUI();
    showAlert('Connected successfully', 'success');
  } catch (error) {
    handleTransactionError(error);
    window.state.isWalletConnected = false;
    currentAccount = '';
  } finally {
    setLoading(false);
  }
}

// UI update functions
window.updateUI = async function() {
  if (!currentAccount) return;

  try {
    setLoading(true);
    const [balance, apr, depositReward, referralReward, userReferral, usdcBalance] = await Promise.all([
      contract.methods.deposits(currentAccount).call(),
      contract.methods.currentAPR().call(),
      contract.methods.calculateReward(currentAccount).call(),
      contract.methods.referralRewards(currentAccount).call(),
      contract.methods.userReferrals(currentAccount).call(),
      usdcContract.methods.balanceOf(currentAccount).call()
    ]);

    window.state = {
      ...window.state,
      balance: (balance / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
      apr: apr.toString(),
      depositReward: (depositReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
      referralReward: (referralReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
      usdcBalance: (usdcBalance / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
      referralCode: userReferral.referralCode
    };

    renderUI();
  } catch (error) {
    console.error('Update error:', error);
    showAlert('Failed to update information', 'error');
  } finally {
    setLoading(false);
  }
}

window.updateRewards = async function() {
  if (!currentAccount || !contract) return;
  
  try {
    const [depositReward, referralReward] = await Promise.all([
      contract.methods.calculateReward(currentAccount).call(),
      contract.methods.referralRewards(currentAccount).call()
    ]);

    window.state.depositReward = (depositReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS);
    window.state.referralReward = (referralReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS);
    renderUI();
  } catch (error) {
    console.error('Reward update error:', error);
  }
}

// Transaction functions
window.handleDeposit = async function() {
  if (!contract || !usdcContract) return;
  
  const amount = document.getElementById('depositAmount').value;
  if (!amount || amount <= 0) {
    showAlert('Please enter a valid amount', 'error');
    return;
  }

  if (amount < MIN_DEPOSIT / 1e6) {
    showAlert(`Minimum deposit amount is ${MIN_DEPOSIT / 1e6} USDC`, 'error');
    return;
  }

  try {
    setLoading(true);
    const amountWei = web3.utils.toWei(amount, 'mwei');
    const gasPrice = await getBaseGasPrice();

    const allowance = await usdcContract.methods.allowance(currentAccount, CONTRACT_ADDRESS).call();
    
    if (BigInt(allowance) < BigInt(amountWei)) {
      showAlert('Approving USDC...', 'info');
      const approveTx = await usdcContract.methods.approve(CONTRACT_ADDRESS, amountWei)
        .send({ 
          from: currentAccount,
          gasPrice: gasPrice
        });
      
      if (!approveTx.status) {
        throw new Error('USDC approval failed');
      }
      showAlert('USDC approved', 'success');
    }

    showAlert('Processing deposit...', 'info');
    const depositTx = await contract.methods.depositFunds(amountWei, '0')
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });

    if (depositTx.status) {
      showAlert('Deposit successful', 'success');
      document.getElementById('depositAmount').value = '';
      await updateUI();
    } else {
      throw new Error('Deposit failed');
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.handleWithdraw = async function() {
  if (!contract) return;
  
  const amount = document.getElementById('withdrawAmount').value;
  if (!amount || amount <= 0) {
    showAlert('Please enter a valid amount', 'error');
    return;
  }

  try {
    setLoading(true);
    const amountWei = web3.utils.toWei(amount, 'mwei');
    const balance = await contract.methods.deposits(currentAccount).call();
    
    if (BigInt(amountWei) > BigInt(balance)) {
      showAlert('Insufficient balance', 'error');
      return;
    }

    const gasPrice = await getBaseGasPrice();
    showAlert('Processing withdrawal...', 'info');
    
    const withdrawTx = await contract.methods.withdraw(amountWei)
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });

    if (withdrawTx.status) {
      showAlert('Withdrawal successful', 'success');
      document.getElementById('withdrawAmount').value = '';
      await updateUI();
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.handleClaimDepositReward = async function() {
  try {
    setLoading(true);
    const gasPrice = await getBaseGasPrice();
    showAlert('Claiming rewards...', 'info');
    
    const tx = await contract.methods.claimDepositReward()
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
      
    if (tx.status) {
      showAlert('Rewards claimed successfully', 'success');
      await updateUI();
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.handleClaimReferralReward = async function() {
  try {
    setLoading(true);
    const gasPrice = await getBaseGasPrice();
    showAlert('Claiming referral rewards...', 'info');
    
    const tx = await contract.methods.claimReferralReward()
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
      
    if (tx.status) {
      showAlert('Referral rewards claimed', 'success');
      await updateUI();
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.copyReferralWithMessage = async function() {
  const message = `Earn ${state.apr}% APR on your USDC with EarnUSDC on Base!
Use my referral code: ${state.referralCode}
${window.location.href}`;
  
  try {
    await navigator.clipboard.writeText(message);
    showAlert('Referral link copied', 'success');
  } catch (error) {
    showAlert('Failed to copy link', 'error');
    console.error('Copy error:', error);
  }
}

// Initialize MetaMask event listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', async function (accounts) {
    cleanup();
    if (accounts.length === 0) {
      currentAccount = '';
      state.isWalletConnected = false;
      renderUI();
    } else {
      currentAccount = accounts[0];
      await updateUI();
    }
    [前のコードの続き...]

// Initialize MetaMask event listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', async function (accounts) {
    cleanup();
    if (accounts.length === 0) {
      currentAccount = '';
      window.state.isWalletConnected = false;
      renderUI();
    } else {
      currentAccount = accounts[0];
      window.state.isWalletConnected = true;
      await updateUI();
    }
  });

  window.ethereum.on('chainChanged', function(chainId) {
    if (chainId !== CHAIN_CONFIG.chainId) {
      cleanup();
      showAlert('Please switch to Base Network to continue', 'error');
    }
    window.location.reload();
  });

  window.ethereum.on('disconnect', function() {
    cleanup();
    currentAccount = '';
    window.state.isWalletConnected = false;
    renderUI();
    showAlert('Wallet disconnected', 'info');
  });

  // Check network on initialization
  ethereum.request({ method: 'eth_chainId' })
    .then(chainId => {
      if (chainId !== CHAIN_CONFIG.chainId) {
        showAlert('Please switch to Base Network to continue', 'error');
      }
    })
    .catch(console.error);
}

// Cleanup on window unload
window.addEventListener('unload', cleanup);

// Handle visibility change
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible' && currentAccount) {
    updateUI();
  }
});
    
