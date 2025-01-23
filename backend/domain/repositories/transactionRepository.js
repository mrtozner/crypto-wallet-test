import Transaction from '../models/transaction';

class TransactionRepository {
  async createTransaction(transactionData) {
    return Transaction.create(transactionData);
  }

  async updateTransactionById(id, updateData) {
    return Transaction.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async getTransaction(filter) {
    return Transaction.findOne({ ...filter }).lean();
  }

  async getTransactions(page, limit, filter) {
    return Transaction.find({ ...filter })
        .sort('-createdAt')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();
  }

  async getTransactionById(id) {
    return Transaction.findById(id).lean();
  }
}

export default new TransactionRepository();
