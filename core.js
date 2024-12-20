// Global variables
window.web3 = null;
window.contract = null;
window.usdcContract = null;
window.currentAccount = '';

// Application state
window.state = {
  balance: '0',
  apr: '0',
  referralCode: '',
  withdrawRequested: false,
  depositReward: '0',
  referralReward: '0',
  isWalletConnected: false,
  isLoading: false,
  referralStats: {
    totalReferrals: 0,
    referrerRate: 5,
    referredRate: 7
  }
};

// Utility functions
window.setLoading = function(isLoading) {
  state.isLoading = isLoading;
  renderUI();
}

window.getBaseGasPrice = async function() {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return Math.max(Math.floor(Number(gasPrice) * 1.1), 100);
  } catch (error) {
    console.error('Gas price fetch error:', error);
    return '100';
  }
}

window.showAlert = function(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${
    type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info'
  }`;
  alertDiv.textContent = message;
  
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();
  
  document.getElementById('mainContent').prepend(alertDiv);
  
  setTimeout(() => alertDiv.remove(), 5000);
}

window.handleTransactionError = function(error) {
  console.error('Transaction error:', error);
  if (error.code === 4001) {
    showAlert('Transaction was rejected by user', 'error');
  } else if (error.message.includes('insufficient funds')) {
    showAlert('Insufficient funds for transaction', 'error');
  } else if (error.message.includes('user rejected')) {
    showAlert('Transaction was rejected', 'error');
  } else {
    showAlert('Transaction failed: ' + error.message, 'error');
  }
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
  } catch (error) {
    console.error('Contract initialization error:', error);
    showAlert('Failed to initialize contracts', 'error');
    throw error;
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
      throw new Error('Wallet connection was denied');
    }

    currentAccount = accounts[0];
    state.isWalletConnected = true;
    await initContract();
    
    // Check and generate referral code
    const userReferral = await contract.methods.userReferrals(currentAccount).call();
    if (!userReferral.exists || userReferral.referralCode === '0') {
      showAlert('Generating your referral code...', 'info');
      const gasPrice = await getBaseGasPrice();
      const tx = await contract.methods.generateReferralCode()
        .send({ 
          from: currentAccount,
          gasPrice: gasPrice
        });
      
      if (tx.status) {
        const newUserReferral = await contract.methods.userReferrals(currentAccount).call();
        state.referralCode = newUserReferral.referralCode;
        showAlert('Your referral code has been generated!', 'success');
      }
    } else {
      state.referralCode = userReferral.referralCode;
    }
    
    await updateUI();
    showAlert('Wallet connected successfully', 'success');
  } catch (error) {
    handleTransactionError(error);
    state.isWalletConnected = false;
    currentAccount = '';
  } finally {
    setLoading(false);
  }
}

// UI update
window.updateUI = async function() {
  if (!currentAccount) return;

  try {
    setLoading(true);
    const [balance, apr, depositReward, referralReward, userReferral] = await Promise.all([
      contract.methods.deposits(currentAccount).call(),
      contract.methods.currentAPR().call(),
      contract.methods.calculateReward(currentAccount).call(),
      contract.methods.referralRewards(currentAccount).call(),
      contract.methods.userReferrals(currentAccount).call()
    ]);

    if (userReferral.exists && userReferral.referralCode !== '0') {
      state.referralCode = userReferral.referralCode;
    }

    state = {
      ...state,
      balance: (balance / 1e6).toFixed(2),
      apr,
      depositReward: (depositReward / 1e6).toFixed(2),
      referralReward: (referralReward / 1e6).toFixed(2)
    };

    renderUI();
  } catch (error) {
    console.error('Update error:', error);
    showAlert('Failed to update information', 'error');
  } finally {
    setLoading(false);
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

  try {
    setLoading(true);
    const amountWei = web3.utils.toWei(amount, 'mwei');
    const gasPrice = await getBaseGasPrice();

    const allowance = await usdcContract.methods.allowance(currentAccount, CONTRACT_ADDRESS).call();
    
    if (BigInt(allowance) < BigInt(amountWei)) {
      showAlert('Approving USDC transfer...', 'info');
      const approveTx = await usdcContract.methods.approve(CONTRACT_ADDRESS, amountWei)
        .send({ 
          from: currentAccount,
          gasPrice: gasPrice
        });
      
      if (!approveTx.status) {
        throw new Error('USDC approval failed');
      }
    }

    showAlert('Processing deposit...', 'info');
    const depositTx = await contract.methods.depositFunds(amountWei, '0')
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });

    if (depositTx.status) {
      showAlert('Deposit completed successfully', 'success');
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

window.handleWithdrawRequest = async function() {
  if (!contract) return;
  
  const amount = document.getElementById('withdrawAmount').value;
  if (!amount || amount <= 0) {
    showAlert('Please enter a valid amount', 'error');
    return;
  }

  try {
    setLoading(true);
    const gasPrice = await getBaseGasPrice();
    
    await contract.methods.requestWithdrawal(web3.utils.toWei(amount, 'mwei'))
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
    
    state.withdrawRequested = true;
    showAlert('Withdrawal request submitted', 'success');
    renderUI();
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.handleWithdraw = async function() {
  try {
    setLoading(true);
    const gasPrice = await getBaseGasPrice();
    await contract.methods.withdraw()
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
    state.withdrawRequested = false;
    showAlert('Withdrawal completed successfully', 'success');
    await updateUI();
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
    await contract.methods.claimDepositReward()
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
    showAlert('Deposit rewards claimed successfully', 'success');
    await updateUI();
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
    await contract.methods.claimReferralReward()
      .send({ 
        from: currentAccount,
        gasPrice: gasPrice
      });
    showAlert('Referral rewards claimed successfully', 'success');
    await updateUI();
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

window.copyReferralWithMessage = async function() {
  const message = `Earn up to ${state.apr}% APR on your USDC with EarnUSDC on Base!
Use my referral code: ${state.referralCode}
${window.location.href}`;
  
  try {
    await navigator.clipboard.writeText(message);
    showAlert('Referral message copied to clipboard', 'success');
  } catch (error) {
    showAlert('Failed to copy to clipboard', 'error');
  }
}
