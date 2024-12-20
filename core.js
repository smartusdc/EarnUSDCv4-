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
