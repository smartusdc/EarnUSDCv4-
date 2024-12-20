// core.js - UI更新処理の修正

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

// 数値フォーマットのユーティリティ関数
window.formatUSDC = function(value) {
  if (!value) return '0.0000';
  return Number(value).toFixed(APP_CONSTANTS.MAX_DECIMALS);
}

// UIコンポーネントの更新
window.renderStatsSection = function() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Your Deposit</div>
        <div class="text-2xl font-bold">${formatUSDC(state.balance)} USDC</div>
        <div class="text-sm text-gray-500 mt-1">Available: ${formatUSDC(state.usdcBalance)} USDC</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Current APR</div>
        <div class="text-2xl font-bold">${state.apr}%</div>
      </div>
    </div>
  `;
}

window.renderRewardsSection = function() {
  return `
    <div class="p-4 bg-gray-50 rounded-lg mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold">Deposit Rewards</h3>
        <div class="text-sm text-gray-500">Updates every minute</div>
      </div>
      <div class="text-2xl font-bold mb-2">${formatUSDC(state.depositReward)} USDC</div>
      ${Number(state.depositReward) > 0 ? `
        <button 
          onclick="handleClaimDepositReward()"
          class="w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          ${state.isLoading ? 'disabled' : ''}
        >
          ${state.isLoading ? 'Processing...' : 'Claim Rewards'}
        </button>
      ` : ''}
    </div>
  `;
}

// core.js - 数値フォーマット関連

window.formatUSDC = function(value) {
  if (!value) return '0.0000';
  
  const num = Number(value);
  
  // 1万以上の場合はカンマ区切りを使用し、小数点以下2桁まで
  if (num >= 10000) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // 1万未満の場合は小数点以下4桁
  return num.toFixed(APP_CONSTANTS.MAX_DECIMALS);
}

window.renderStatsSection = function() {
  const balance = state.balance;
  const availableBalance = state.usdcBalance;
  
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Your Deposit</div>
        <div class="text-2xl font-bold text-right tabular-nums">${formatUSDC(balance)} USDC</div>
        <div class="text-sm text-gray-500 mt-1 text-right">Available: ${formatUSDC(availableBalance)} USDC</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Current APR</div>
        <div class="text-2xl font-bold">${state.apr}%</div>
      </div>
    </div>
  `;
}
