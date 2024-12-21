// アプリケーションの状態
window.state = {
    // 基本情報
    balance: '0.0000',
    apr: '0',
    usdcBalance: '0.0000',
    isWalletConnected: false,
    isLoading: false,

    // ユーザーランク情報
    rank: {
        id: 0,
        name: 'Normal',
        bonusRate: 0,
        nextThreshold: 0,
        progress: 0
    },

    // 報酬情報
    rewards: {
        pending: '0.0000',
        accumulated: '0.0000',
        bonus: '0.0000'
    },

    // リファラル情報
    referral: {
        code: '',
        totalRewards: '0.0000',
        pendingRewards: '0.0000'
    }
};

// 状態更新関数
window.updateUI = async function() {
    if (!currentAccount || !contract) return;

    try {
        setLoading(true);

        // 並列で各種情報を取得
        const [
            balance,
            apr,
            depositReward,
            referralReward,
            userRank,
            rewardStats,
            usdcBalance
        ] = await Promise.all([
            contract.methods.deposits(currentAccount).call(),
            contract.methods.currentAPR().call(),
            contract.methods.calculateReward(currentAccount).call(),
            contract.methods.referralRewards(currentAccount).call(),
            contract.methods.getUserRank(currentAccount).call(),
            contract.methods.userRewardStats(currentAccount).call(),
            usdcContract.methods.balanceOf(currentAccount).call()
        ]);

        // 状態を更新
        window.state = {
            ...window.state,
            balance: (balance / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
            apr: (apr / 100).toString(),
            usdcBalance: (usdcBalance / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
            isWalletConnected: true,

            // ランク情報
            rank: {
                id: Number(userRank.rankId),
                name: userRank.rankName,
                bonusRate: Number(userRank.bonusRate) / 100,
                nextThreshold: Number(userRank.nextRankThreshold) / 1e6,
                progress: Number(userRank.progressToNextRank) / 100
            },

            // 報酬情報
            rewards: {
                pending: (depositReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
                accumulated: (rewardStats.totalDepositRewards / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS),
                bonus: (rewardStats.totalBonusRewards / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS)
            },

            // リファラル情報
            referral: {
                ...window.state.referral,
                pendingRewards: (referralReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS)
            }
        };

        renderUI();
    } catch (error) {
        console.error('Update error:', error);
        showAlert('Failed to update information', 'error');
    } finally {
        setLoading(false);
    }
}

// 報酬更新
window.updateRewards = async function() {
    if (!currentAccount || !contract) return;
    
    try {
        const [depositReward, referralReward] = await Promise.all([
            contract.methods.calculateReward(currentAccount).call(),
            contract.methods.referralRewards(currentAccount).call()
        ]);

        const prevDepositReward = Number(window.state.rewards.pending);
        const newDepositReward = Number(depositReward) / 1e6;

        // 報酬が増加した場合のみ更新
        if (newDepositReward >= prevDepositReward) {
            window.state.rewards.pending = newDepositReward.toFixed(APP_CONSTANTS.MAX_DECIMALS);
            window.state.referral.pendingRewards = (referralReward / 1e6).toFixed(APP_CONSTANTS.MAX_DECIMALS);
            renderUI();
        }
    } catch (error) {
        console.error('Reward update error:', error);
    }
}

// リファラルコードの更新
window.updateReferralCode = async function() {
    if (!currentAccount || !contract) return;

    try {
        const code = await contract.methods.userToReferralCode(currentAccount).call();
        if (code && code !== '0') {
            window.state.referral.code = code;
            renderUI();
        }
    } catch (error) {
        console.error('Referral code update error:', error);
    }
}

// クリーンアップ
window.cleanup = function() {
    if (window.rewardUpdateInterval) {
        clearInterval(window.rewardUpdateInterval);
        window.rewardUpdateInterval = null;
    }

    window.state = {
        balance: '0.0000',
        apr: '0',
        usdcBalance: '0.0000',
        isWalletConnected: false,
        isLoading: false,
        rank: {
            id: 0,
            name: 'Normal',
            bonusRate: 0,
            nextThreshold: 0,
            progress: 0
        },
        rewards: {
            pending: '0.0000',
            accumulated: '0.0000',
            bonus: '0.0000'
        },
        referral: {
            code: '',
            totalRewards: '0.0000',
            pendingRewards: '0.0000'
        }
    };

    web3 = null;
    contract = null;
    usdcContract = null;
    currentAccount = '';
    
    renderUI();
}
