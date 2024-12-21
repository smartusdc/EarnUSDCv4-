// state.js の先頭に追加
console.log('Loading state.js');
if (typeof renderUI === 'undefined') {
    console.log('Warning: renderUI is not defined when loading state.js');
}

// State management and updates
window.updateUI = async function() {
  if (!currentAccount || !contract) return;

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
      referralCode: userReferral.referralCode || ''
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

    const prevDepositReward = window.state.depositReward;
    const newDepositReward = (depositReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS);

    // 報酬が増加した場合のみ更新（減少は想定外のため更新しない）
    if (Number(newDepositReward) >= Number(prevDepositReward)) {
      window.state.depositReward = newDepositReward;
      window.state.referralReward = (referralReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS);
      renderUI();
    }
  } catch (error) {
    console.error('Reward update error:', error);
    // エラーは表示せず、次の更新を待つ
  }
}
