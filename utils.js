// Utility functions
window.setLoading = function(isLoading) {
  window.state.isLoading = isLoading;
  renderUI();
}

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

// Format number utility
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
