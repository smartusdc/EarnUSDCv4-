// Loading indicator
window.renderLoading = function() {
  return `
    <div class="flex justify-center items-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  `;
}

// UI Components Rendering
window.renderStatsSection = function() {
  return `
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Deposit Balance</div>
        <div class="text-2xl font-bold">${state.balance} USDC</div>
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
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg">
          <div class="text-sm text-gray-500">Your Referral Code</div>
          <div class="flex items-center gap-2">
            <div class="text-xl font-mono">${state.referralCode}</div>
            <button 
              onclick="copyReferralWithMessage()" 
              class="copy-button" 
              title="Copy referral message"
              ${state.isLoading ? 'disabled' : ''}
            >
              <i data-lucide="clipboard" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <div class="text-sm text-gray-500">Referral Stats</div>
          <div>Total Referrals: ${state.referralStats.totalReferrals}</div>
          <div class="text-sm text-gray-500 mt-2">
            Referrer Bonus: ${state.referralStats.referrerRate}%
            <br/>
            Referee Bonus: ${state.referralStats.referredRate}%
          </div>
        </div>
      </div>
    </div>
  `;
}

window.renderRewardsSection = function() {
  return `
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Deposit Rewards</div>
        <div class="text-2xl font-bold">${state.depositReward} USDC</div>
        ${Number(state.depositReward) > 0 ? `
          <button 
            onclick="handleClaimDepositReward()"
            class="mt-2 w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors"
            ${state.isLoading ? 'disabled' : ''}
          >
            ${state.isLoading ? 'Processing...' : 'Claim Deposit Rewards'}
          </button>
        ` : ''}
      </div>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500">Referral Rewards</div>
        <div class="text-2xl font-bold">${state.referralReward} USDC</div>
        ${Number(state.referralReward) > 0 ? `
          <button 
            onclick="handleClaimReferralReward()"
            class="mt-2 w-full bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors"
            ${state.isLoading ? 'disabled' : ''}
          >
            ${state.isLoading ? 'Processing...' : 'Claim
