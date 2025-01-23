import WalletRepository from '../repositories/WalletRepository';
import * as redis from '../../helpers/redis';
import { generateEthereumAddress } from '../../helpers/utils';
import { v4 as uuidv4 } from 'uuid';

class WalletService {
    async createWallet(userId) {
        const finalUserId = userId?.trim() || uuidv4();
        const { publicKey, privateKey } = generateEthereumAddress();

        const walletData = {
            userId: finalUserId,
            publicKey,
            privateKey,
            tokens: [],
        };

        const createdWallet = await WalletRepository.createWallet(walletData);

        await redis.setJSON(`wallet:${createdWallet.publicKey}`, createdWallet);

        return createdWallet;
    }

    async getWalletById(walletId) {
        const wallet = await WalletRepository.getWalletById(walletId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet;
    }

    async getWalletByAddress(address) {
        const walletFromRedis = await redis.getJSON(`wallet:${address}`);
        if (walletFromRedis) {
            return walletFromRedis;
        }

        const walletFromMongo = await WalletRepository.getWalletByAddress(address);
        if (!walletFromMongo) {
            throw new Error('Wallet not found');
        }

        await redis.setJSON(`wallet:${address}`, walletFromMongo);
        return walletFromMongo;
    }

    async upsertToken(walletId, tokenData) {
        const wallet = await this.getWalletById(walletId);

        const existingToken = wallet.tokens.find((token) => token.symbol === tokenData.symbol);
        if (existingToken) {
            return WalletRepository.updateExistingToken(walletId, tokenData);
        } else {
            return WalletRepository.addNewToken(walletId, tokenData);
        }
    }

    async getAllWalletAddresses() {
        return WalletRepository.getAllWalletAddresses();
    }

    async getWalletsByAddresses(addresses) {
        const wallets = [];
        const missingAddresses = [];

        for (const address of addresses) {
            const wallet = await redis.getJSON(`wallet:${address}`);
            if (wallet) {
                wallets.push(wallet);
            } else {
                missingAddresses.push(address);
            }
        }

        if (missingAddresses.length) {
            const walletsFromMongo = await WalletRepository.getWalletsByAddresses(missingAddresses);
            wallets.push(...walletsFromMongo);

            for (const wallet of walletsFromMongo) {
                await redis.setJSON(`wallet:${wallet.publicKey}`, wallet);
            }
        }

        return wallets;
    }
}

export default new WalletService();
