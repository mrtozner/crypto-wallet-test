import Wallet from '../models/wallet';

class WalletRepository {
    async createWallet(wallet) {
        return Wallet.create(wallet);
    };

    async getWalletByAddress(address) {
        return Wallet.findOne({ publicKey: address }).lean();
    };

    async getWalletById(id) {
        return Wallet.findById(id);
    };

    async getAllWalletAddresses() {
        return Wallet.find().select('publicKey').lean();
    };

    async getWalletsByAddresses(addresses) {
        return Wallet.find({ publicKey: { $in: addresses } }).lean();
    }

    async addNewToken(walletId, tokenData) {
        return Wallet.findByIdAndUpdate(
            walletId,
            {
                $push: { tokens: tokenData },
            },
            { new: true }
        ).lean();
    }

    async updateExistingToken(walletId, tokenData) {
        return Wallet.findByIdAndUpdate(
            walletId,
            {
                $set: { 'tokens.$[token]': tokenData },
            },
            {
                arrayFilters: [{ 'token.symbol': tokenData.symbol }],
                new: true,
            }
        ).lean();
    };
}

export default new WalletRepository();
