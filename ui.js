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

// UI Components Rendering
window.renderStatsSection = function() {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Your Deposit</div>
        <div class="text-2xl font-bold">${state.balance} USDC</div>
        <div class="text-sm text-gray-500 mt-1">Available USDC: ${state.usdcBalance}</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Current APR</div>
        <div class="text-2xl font-bold">${state.apr}%</div>
      </div>
    </div>
  `;
}

window.renderReferralSection = function() {
  return `
    <div class="referral-section p-4 bg-gray-50 rounded-lg mb-4">
      <h2 class="text-lg font-bold mb-2">Referral Program</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg">
          <div class="text-sm text-gray-500">Your Referral Code</div>
          <div class="flex items-center gap-2 mt-1">
            <div class="text-xl font-mono">${state.referralCode}</div>
            <button 
              onclick="copyReferralWithMessage()" 
              class="hover:bg-gray-100 p-2 rounded-full transition-colors"
              ${state.isLoading ? 'disabled' : ''}
            >
              <i data-lucide="clipboard" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <div class="text-sm text-gray-500">Referral Rewards</div>
          <div class="text-xl font-bold">${state.referralReward} USDC</div>
          ${Number(state.referralReward) > 0 ? `
            <button 
              onclick="handleClaimReferralReward()"
              class="mt-2 w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              ${state.isLoading ? 'disabled' : ''}
            >
              ${state.isLoading ? 'Processing...' : 'Claim Rewards'}
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

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
            step="0.000001"
            min="0.1"
            class="flex-1 p-2 border rounded"
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
        <div class="text-sm text-gray-500">Min. deposit: 0.1 USDC</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold mb-2">Withdraw USDC</h3>
        <div class="flex gap-2 mb-2">
          <input 
            type="number" 
            id="withdrawAmount" 
            placeholder="Amount" 
            step="0.000001"
            min="0.000001"
            class="flex-1 p-2 border rounded"
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
        <div class="text-sm text-gray-500">Available: ${state.balance} USDC</div>
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
      <div class="text-2xl font-bold mb-2">${state.depositReward} USDC</div>
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

// Main render function
window.renderUI = function() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  // Clear existing content
  while (mainContent.firstChild) {
    mainContent.firstChild.remove();
  }

  // Show loading state
  if (state.isLoading) {
    mainContent.innerHTML = renderLoading();
    return;
  }

  // Show connect wallet button if not connected
  if (!state.isWalletConnected) {
    mainContent.innerHTML = renderConnectButton();
    return;
  }

  // Render main interface
  mainContent.innerHTML = `
    ${renderStatsSection()}
    ${renderReferralSection()}
    ${renderDepositSection()}
    ${renderRewardsSection()}
  `;

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', function() {
  renderUI();

  // Check if already connected
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});
