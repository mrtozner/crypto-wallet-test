import TransactionRepository from '../repositories/TransactionRepository';
import WalletService from './WalletService';
import AlertService from './AlertService';
import constant from '../../constant';
import { classifyTransaction } from '../../helpers/utils';

class TransactionService {
    async getTransaction(filter) {
        return TransactionRepository.getTransaction(filter);
    }

    async getTransactions(page, limit, filter) {
        return TransactionRepository.getTransactions(page, limit, filter);
    }

    async getTransactionById(id) {
        const transaction = await TransactionRepository.getTransactionById(id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    }

    async createTransaction(transactionData) {
        return TransactionRepository.createTransaction(transactionData);
    }

    async updateTransactionById(id, updateData) {
        const updatedTransaction = await TransactionRepository.updateTransactionById(id, updateData);
        if (!updatedTransaction) {
            throw new Error('Transaction not found or could not be updated');
        }
        return updatedTransaction;
    }

    async processTransaction(transactionData) {
        const { from, to, symbol, amount, status } = transactionData;

        const wallets = await WalletService.getWalletsByAddresses([from, to]);
        if (!wallets.length) {
            return;
        }
        const fromWallet = wallets.find((wallet) => wallet.publicKey === from);
        const toWallet = wallets.find((wallet) => wallet.publicKey === to);

        if (status === constant.transactionStatuses.success) {
            if (fromWallet) {
                const currentAmount = fromWallet.tokens.find((token) => token.symbol === symbol)?.amount || 0;
                const newAmount = currentAmount - amount;

                if (newAmount < 0) {
                    throw new Error(`Insufficient balance in wallet ${from}`);
                }

                await WalletService.upsertToken(fromWallet._id.toString(), { symbol, amount: newAmount });
            }

            if (toWallet) {
                const currentAmount = toWallet.tokens.find((token) => token.symbol === symbol)?.amount || 0;
                const newAmount = currentAmount + amount;

                await WalletService.upsertToken(toWallet._id.toString(), { symbol, amount: newAmount });
            }
        }
        const savedTransaction = await TransactionRepository.createTransaction(transactionData);

        if (status !== constant.transactionStatuses.failed) {
            const alerts = classifyTransaction(transactionData).map((alert) => ({
                ...alert,
                transactionId: savedTransaction._id,
            }));

            if (alerts.length) {
                await AlertService.createAlerts(alerts);
            }
        }

        return savedTransaction;
    }
}

export default new TransactionService();
