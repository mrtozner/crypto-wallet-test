import WalletService from '../services/WalletService';
import walletView from "../views/walletView";

class WalletController {
    async createWallet(req, res) {
        const { userId } = req.body;
        const response = await WalletService.createWallet(userId);
        res.json(response);
    }

    async getWalletById(req, res) {
        const { id } = req.params;
        const response = await WalletService.getWalletById(id);
        res.json(walletView(response));
    }

    async getWalletByAddress(req, res) {
        const { address } = req.params;
        const response = await WalletService.getWalletByAddress(address);
        res.json(walletView(response));
    }
}

export default new WalletController();
