// トランザクション関連の処理を管理
window.handleTransactionError = function(error) {
  console.error('Transaction error:', error);
  
  if (error.code === 4902) {
    showAlert('Please add Base Network to your wallet. Click OK to add it automatically.', 'error');
    addBaseNetwork();
    return;
  }
  
  if (error.code === 4001 || error.message?.includes('user rejected')) {
    showAlert('Transaction cancelled by user', 'error');
    return;
  }
  
  if (error.message?.includes('insufficient funds')) {
    showAlert('Insufficient funds for transaction', 'error');
    return;
  }

  if (error.message?.includes('execution reverted')) {
    const revertMessage = error.message.match(/execution reverted:(.+?)"/)?.[1]?.trim() || 'Transaction failed';
    showAlert(revertMessage, 'error');
    return;
  }
  
  showAlert('Transaction failed: ' + (error.message || 'Unknown error'), 'error');
}

// デポジット処理
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
    
    // USDC承認の確認
    const allowance = await usdcContract.methods.allowance(currentAccount, CONTRACT_ADDRESS).call();
    
    if (BigInt(allowance) < BigInt(amountWei)) {
      showAlert('Approving USDC...', 'info');
      const gasPrice = await getBaseGasPrice();
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

    // ガス代見積もり
    const gasEstimate = await contract.methods.depositFunds(amountWei, '0').estimateGas({
      from: currentAccount
    });
    
    // ガスコストの確認
    if (!await estimateTransactionCost(gasEstimate)) {
      if (!confirm('Network fees are higher than usual. Do you want to proceed?')) {
        setLoading(false);
        return;
      }
    }

    // デポジット実行
    const gasPrice = await getBaseGasPrice();
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
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

// transaction.js の handleWithdraw 関数を修正
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

    // ガス代見積もり
    const gasEstimate = await contract.methods.withdraw(amountWei).estimateGas({
      from: currentAccount
    });
    
    // ガスコストの確認
    if (!await estimateTransactionCost(gasEstimate)) {
      if (!confirm('Network fees are higher than usual. Do you want to proceed?')) {
        setLoading(false);
        return;
      }
    }

    const gasPrice = await getBaseGasPrice();
    showAlert('Processing withdrawal...', 'info');
    
    // 即時引き出し
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

// 預金報酬の請求
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

// リファラル報酬の請求
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
      showAlert('Referral rewards claimed successfully', 'success');
      await updateUI();
    }
  } catch (error) {
    handleTransactionError(error);
  } finally {
    setLoading(false);
  }
}

// ガスコストの推定
window.estimateTransactionCost = async function(gasLimit) {
  try {
    const gasPrice = await getBaseGasPrice();
    const estimatedCost = web3.utils.fromWei(
      (BigInt(gasPrice) * BigInt(gasLimit)).toString(),
      'ether'
    );
    
    if (Number(estimatedCost) > 0.002) {
      showAlert(
        'Network is experiencing high traffic. Transaction costs are higher than usual. ' +
        'Consider waiting a few minutes for network conditions to improve.',
        'warning'
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Cost estimation error:', error);
    return true;
  }
}

// ガス価格の取得
window.getBaseGasPrice = async function() {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceInGwei = web3.utils.fromWei(gasPrice, 'gwei');
    
    if (Number(gasPriceInGwei) > 0.3) {
      showAlert(
        'Gas prices are currently higher than usual on Base Network. ' +
        'You may want to wait a few minutes for prices to stabilize.',
        'warning'
      );
    }

    const adjustedGasPrice = Math.floor(Number(gasPrice) * APP_CONSTANTS.GAS_LIMIT_BUFFER);
    return adjustedGasPrice.toString();
  } catch (error) {
    console.error('Gas price fetch error:', error);
    return web3.eth.getGasPrice();
  }
}
