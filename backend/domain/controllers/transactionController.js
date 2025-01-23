import TransactionService from '../services/TransactionService';

class TransactionController {
    async getTransaction(req, res) {
        const filter = JSON.parse(req.query.filter || '{}');
        const response = await TransactionService.getTransaction(filter);
        res.json(response);
    }

    async getTransactions(req, res) {
        const { page = 1, limit = 10 } = req.query;
        const filter = JSON.parse(req.query.filter || '{}');

        if (req.query.from) {
            filter.from = req.query.from;
        }
        if (req.query.to) {
            filter.to = req.query.to;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.contractAddress) {
            filter.contractAddress = req.query.contractAddress;
        }
        if (req.query.symbol) {
            filter.symbol = req.query.symbol;
        }

        const response = await TransactionService.getTransactions(page, limit, filter);
        res.json(response);
    }

    async getTransactionById(req, res) {
        const { id } = req.params;
        const response = await TransactionService.getTransactionById(id);
        res.json(response);
    }

    async createTransaction(req, res) {
        const transactionData = req.body;
        const response = await TransactionService.createTransaction(transactionData);
        res.json(response);
    }
}

export default new TransactionController();
