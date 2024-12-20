// ウォレット接続とネットワーク関連の処理
window.initContract = async function() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    usdcContract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    
    if (rewardUpdateInterval) {
      clearInterval(rewardUpdateInterval);
    }
    rewardUpdateInterval = setInterval(updateRewards, APP_CONSTANTS.REWARD_UPDATE_INTERVAL);
    
    await updateRewards();
  } catch (error) {
    console.error('Contract initialization error:', error);
    showAlert('Failed to initialize contracts. Please check your wallet connection.', 'error');
    throw error;
  }
}

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

// MetaMask event listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', async function (accounts) {
    cleanup();
    if (accounts.length === 0) {
      currentAccount = '';
      window.state.isWalletConnected = false;
    } else {
      currentAccount = accounts[0];
      window.state.isWalletConnected = true;
      await updateUI();
    }
    renderUI();
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
    showAlert('Wallet disconnected', 'info');
  });
}

// クリーンアップ処理
window.cleanup = function() {
  if (rewardUpdateInterval) {
    clearInterval(rewardUpdateInterval);
    rewardUpdateInterval = null;
  }
  web3 = null;
  contract = null;
  usdcContract = null;
  currentAccount = '';
  window.state = {
    balance: '0.0000',
    apr: '0',
    referralCode: '',
    depositReward: '0.0000',
    referralReward: '0.0000',
    isWalletConnected: false,
    isLoading: false,
    usdcBalance: '0.0000'
  };
  renderUI();
}

// ページロード時のネットワークチェック
document.addEventListener('DOMContentLoaded', async function() {
  if (window.ethereum) {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId !== CHAIN_CONFIG.chainId) {
        showAlert('Please switch to Base Network to continue', 'error');
      }
    } catch (error) {
      console.error('Network check error:', error);
    }
  }
});
