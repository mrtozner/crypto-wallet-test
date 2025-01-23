import { ethers } from 'ethers';
import constant from '../constant';

export const generateEthereumAddress = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
        publicKey: wallet.address,
        privateKey: wallet.privateKey,
    };
}

export const getRandomAmount = (symbol) => {
    switch (symbol) {
        case 'ETH':
            return Number((Math.random() * (500 - 0.001) + 0.001).toFixed(6)); // ETH: 0.001 - 500
        case 'USDT':
        case 'USDC':
            return Number(Math.floor(Math.random() * (100000 - 1 + 1)) + 1); // USDT/USDC: 1 - 100000
        case 'LINK':
            return Number((Math.random() * (5000 - 1 + 1) + 1).toFixed(0)); // LINK: 1 - 5000
        default:
            return 0;
    }
};

export const getRandomStatus = () => {
    const statuses = Object.keys(constant.transactionStatuses);
    return statuses[Math.floor(Math.random() * statuses.length)];
};

export const getRandomIterations = (min = 1, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const classifyTransaction = (transaction) => {
    const alerts = [];
    const { symbol, amount } = transaction;

    const highAmountThresholds = {
        ETH: 100,
        USDT: 25000,
        USDC: 25000,
        LINK: 1000,
    };

    if (amount >= highAmountThresholds[symbol]) {
        alerts.push({
            type: constant.alertTypes.highAmount,
            message: `High amount transaction detected: ${amount} ${symbol}`,
        });
    }

    if (Math.random() < 0.05) {
        alerts.push({
            type: constant.alertTypes.unusualActivity,
            message: 'Unusual activity detected in transaction.',
        });
    }

    return alerts;
};
