// Loading indicator
window.renderLoading = function() {
  return `
    <div class="flex justify-center items-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  `;
}

// Connect Wallet Button
window.renderConnectButton = function() {
  return `
    <div class="flex justify-center p-4">
      <button 
        onclick="connectWallet()"
        class="bg-blue-500 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-600 transition-colors"
        ${state.isLoading ? 'disabled' : ''}
      >
        ${state.isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  `;
}

// Stats Section
window.renderStatsSection = function() {
  const balance = state.balance;
  const availableBalance = state.usdcBalance;
  
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Your Deposit</div>
        <div class="text-2xl font-bold text-right tabular-nums">${formatUSDC(balance)} USDC</div>
        <div class="text-sm text-gray-500 mt-1 text-right tabular-nums">Available: ${formatUSDC(availableBalance)} USDC</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Current APR</div>
        <div class="text-2xl font-bold">${state.apr}%</div>
      </div>
    </div>
  `;
}

// Deposit/Withdraw Section
window.renderDepositSection = function() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold mb-2">Deposit USDC</h3>
        <div class="flex gap-2 mb-2">
          <input 
            type="number" 
            id="depositAmount" 
            placeholder="Amount" 
            step="0.0001"
            min="0.01"
            class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            ${state.isLoading ? 'disabled' : ''}
          />
          <button 
            onclick="handleDeposit()"
            class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            ${state.isLoading ? 'disabled' : ''}
          >
            ${state.isLoading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
        <div class="text-sm text-gray-500">Min. deposit: 0.01 USDC</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold mb-2">Withdraw USDC</h3>
        <div class="flex gap-2 mb-2">
          <input 
            type="number" 
            id="withdrawAmount" 
            placeholder="Amount" 
            step="0.0001"
            min="0.0001"
            class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            ${state.isLoading ? 'disabled' : ''}
          />
          <button 
            onclick="handleWithdraw()"
            class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            ${state.isLoading ? 'disabled' : ''}
          >
            ${state.isLoading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
        <div class="text-sm text-gray-500 tabular-nums">Available: ${formatUSDC(state.balance)} USDC</div>
      </div>
    </div>
  `;
}

// Rewards Section
window.renderRewardsSection = function() {
  return `
    <div class="p-4 bg-gray-50 rounded-lg mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold">Deposit Rewards</h3>
        <div class="text-sm text-gray-500">Updates every minute</div>
      </div>
      <div class="text-2xl font-bold mb-2 tabular-nums">${formatUSDC(state.depositReward)} USDC</div>
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

// Alert handling
window.showAlert = function(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${
    type === 'error' ? 'bg-red-100 text-red-800' : 
    type === 'success' ? 'bg-green-100 text-green-800' : 
    type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    'bg-blue-100 text-blue-800'
  } p-4 rounded-lg shadow-sm`;
  
  alertDiv.textContent = message;
  
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const existingAlert = alertContainer.querySelector('.alert');
  if (existingAlert) {
    alertContainer.removeChild(existingAlert);
  }
  
  alertContainer.prepend(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      if (alertDiv.parentElement === alertContainer) {
        alertDiv.remove();
      }
    }, 300);
  }, APP_CONSTANTS.ALERT_DURATION);
}

// Main render function
window.renderUI = function() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  if (state.isLoading) {
    mainContent.innerHTML = renderLoading();
    return;
  }

  if (!state.isWalletConnected) {
    mainContent.innerHTML = renderConnectButton();
    return;
  }

  mainContent.innerHTML = `
    ${renderStatsSection()}
    ${renderDepositSection()}
    ${renderRewardsSection()}
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Initialize UI
document.addEventListener('DOMContentLoaded', function() {
  renderUI();

  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});
