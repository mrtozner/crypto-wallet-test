import TransactionService from '../domain/services/TransactionService';
import TransactionRepository from '../domain/repositories/TransactionRepository';
import WalletService from '../domain/services/WalletService';
import AlertService from '../domain/services/AlertService';
import constant from '../constant';
import { classifyTransaction } from '../helpers/utils';

jest.mock('../domain/repositories/TransactionRepository');
jest.mock('../domain/services/WalletService');
jest.mock('../domain/services/AlertService');
jest.mock('../helpers/utils');

describe('TransactionService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get a single transaction by filter', async () => {
        const mockFilter = { from: 'wallet1' };
        const mockTransaction = { id: 'transaction1', from: 'wallet1', to: 'wallet2', amount: 100 };

        TransactionRepository.getTransaction.mockResolvedValue(mockTransaction);

        const transaction = await TransactionService.getTransaction(mockFilter);

        expect(transaction).toEqual(mockTransaction);
        expect(TransactionRepository.getTransaction).toHaveBeenCalledWith(mockFilter);
    });

    it('should get a paginated list of transactions', async () => {
        const mockPage = 1;
        const mockLimit = 10;
        const mockFilter = {};
        const mockTransactions = [
            { id: 'transaction1', from: 'wallet1', to: 'wallet2', amount: 100 },
            { id: 'transaction2', from: 'wallet3', to: 'wallet4', amount: 50 },
        ];

        TransactionRepository.getTransactions.mockResolvedValue(mockTransactions);

        const transactions = await TransactionService.getTransactions(mockPage, mockLimit, mockFilter);

        expect(transactions).toEqual(mockTransactions);
        expect(TransactionRepository.getTransactions).toHaveBeenCalledWith(mockPage, mockLimit, mockFilter);
    });

    it('should throw an error if transaction by ID is not found', async () => {
        TransactionRepository.getTransactionById.mockResolvedValue(null);

        await expect(TransactionService.getTransactionById('nonexistent-id')).rejects.toThrow('Transaction not found');
        expect(TransactionRepository.getTransactionById).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should create a transaction', async () => {
        const mockTransactionData = { from: 'wallet1', to: 'wallet2', amount: 100 };
        const mockSavedTransaction = { id: 'transaction1', ...mockTransactionData };

        TransactionRepository.createTransaction.mockResolvedValue(mockSavedTransaction);

        const transaction = await TransactionService.createTransaction(mockTransactionData);

        expect(transaction).toEqual(mockSavedTransaction);
        expect(TransactionRepository.createTransaction).toHaveBeenCalledWith(mockTransactionData);
    });

    it('should process a successful transaction and update wallets', async () => {
        const mockTransactionData = {
            from: 'wallet1',
            to: 'wallet2',
            symbol: 'ETH',
            amount: 50,
            status: constant.transactionStatuses.success,
        };
        const mockWallets = [
            { _id: 'wallet1-id', publicKey: 'wallet1', tokens: [{ symbol: 'ETH', amount: 100 }] },
            { _id: 'wallet2-id', publicKey: 'wallet2', tokens: [{ symbol: 'ETH', amount: 50 }] },
        ];
        const mockSavedTransaction = { id: 'transaction1', ...mockTransactionData };

        WalletService.getWalletsByAddresses.mockResolvedValue(mockWallets);
        WalletService.upsertToken.mockResolvedValue(true);
        TransactionRepository.createTransaction.mockResolvedValue(mockSavedTransaction);
        classifyTransaction.mockReturnValue([]);

        const transaction = await TransactionService.processTransaction(mockTransactionData);

        expect(transaction).toEqual(mockSavedTransaction);
        expect(WalletService.getWalletsByAddresses).toHaveBeenCalledWith(['wallet1', 'wallet2']);
        expect(WalletService.upsertToken).toHaveBeenCalledWith('wallet1-id', { symbol: 'ETH', amount: 50 });
        expect(WalletService.upsertToken).toHaveBeenCalledWith('wallet2-id', { symbol: 'ETH', amount: 100 });
        expect(TransactionRepository.createTransaction).toHaveBeenCalledWith(mockTransactionData);
        expect(classifyTransaction).toHaveBeenCalledWith(mockTransactionData);
    });

    it('should process a transaction and create alerts if applicable', async () => {
        const mockTransactionData = {
            from: 'wallet1',
            to: 'wallet2',
            symbol: 'ETH',
            amount: 50,
            status: constant.transactionStatuses.success,
        };
        const mockWallets = [
            { _id: 'wallet1-id', publicKey: 'wallet1', tokens: [{ symbol: 'ETH', amount: 100 }] },
            { _id: 'wallet2-id', publicKey: 'wallet2', tokens: [{ symbol: 'ETH', amount: 50 }] },
        ];
        const mockSavedTransaction = {
            _id: 'transaction1', // Use _id to match the implementation
            ...mockTransactionData,
        };

        WalletService.getWalletsByAddresses.mockResolvedValue(mockWallets);
        WalletService.upsertToken.mockResolvedValue(true);
        TransactionRepository.createTransaction.mockResolvedValue(mockSavedTransaction);
        classifyTransaction.mockReturnValue([{ type: 'largeTransaction' }]);
        AlertService.createAlerts.mockResolvedValue(true);

        const transaction = await TransactionService.processTransaction(mockTransactionData);

        expect(transaction).toEqual(mockSavedTransaction);
        expect(WalletService.getWalletsByAddresses).toHaveBeenCalledWith(['wallet1', 'wallet2']);
        expect(WalletService.upsertToken).toHaveBeenCalledTimes(2);
        expect(classifyTransaction).toHaveBeenCalledWith(mockTransactionData);
        expect(AlertService.createAlerts).toHaveBeenCalledWith([
            { type: 'largeTransaction', transactionId: mockSavedTransaction._id },
        ]);
    });

    it('should throw an error for insufficient balance in the from wallet', async () => {
        const mockTransactionData = {
            from: 'wallet1',
            to: 'wallet2',
            symbol: 'ETH',
            amount: 200,
            status: constant.transactionStatuses.success,
        };
        const mockWallets = [
            { _id: 'wallet1-id', publicKey: 'wallet1', tokens: [{ symbol: 'ETH', amount: 100 }] },
        ];

        WalletService.getWalletsByAddresses.mockResolvedValue(mockWallets);

        await expect(TransactionService.processTransaction(mockTransactionData)).rejects.toThrow(
            'Insufficient balance in wallet wallet1'
        );

        expect(WalletService.getWalletsByAddresses).toHaveBeenCalledWith(['wallet1', 'wallet2']);
    });
});
