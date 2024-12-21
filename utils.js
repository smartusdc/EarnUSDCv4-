// ローディング状態の設定
window.setLoading = function(isLoading) {
    window.state.isLoading = isLoading;
    renderUI();
}

// 数値フォーマット
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

// ガス価格の取得
window.getBaseGasPrice = async function() {
    try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceInGwei = web3.utils.fromWei(gasPrice, 'gwei');
        
        // ガス価格が高い場合は警告
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

// トランザクションコストの推定
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

// アラート表示
window.showAlert = function(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${
        type === 'error' ? 'bg-red-100 text-red-800' : 
        type === 'success' ? 'bg-green-100 text-green-800' : 
        type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
    } p-4 rounded-lg shadow-sm flex items-center gap-2`;
    
    const iconMap = {
        error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
        info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };
    
    alertDiv.innerHTML = `
        ${iconMap[type]}
        <span class="flex-1">${message}</span>
    `;
    
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const existingAlert = alertContainer.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
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

// エラーハンドリング
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

// ランクカラーの取得
window.getRankColor = function(rankName) {
    return APP_CONSTANTS.RANK_COLORS[rankName] || 'bg-gray-100 text-gray-800';
}

// 進捗率のフォーマット
window.formatProgress = function(progress) {
    return (progress / 100).toFixed(2);
}
