import WalletService from '../domain/services/WalletService';
import TransactionService from '../domain/services/TransactionService';
import { getRandomAmount, getRandomStatus, getRandomIterations } from '../helpers/utils';
import { randomUUID } from 'crypto';
import constant from '../constant';

export default {
  expression: '*/30 * * * * *',
  func: async () => {
    for (let i = 0; i < getRandomIterations(1, 10); i++) {
      try {
        const wallets = await WalletService.getAllWalletAddresses();

        if (!wallets.length) {
          return;
        }

        const toAddress = wallets[Math.floor(Math.random() * wallets.length)].publicKey;
        const symbol = constant.symbols[Math.floor(Math.random() * constant.symbols.length)];
        const status = getRandomStatus();

        const transaction = {
          from: `0x${randomUUID()}`.replace(/-/g, ''),
          to: toAddress,
          contractAddress: symbol === 'ETH' ? null : constant.contractAddresses[symbol],
          amount: getRandomAmount(symbol),
          symbol,
          hash: `0x${randomUUID()}`.replace(/-/g, ''),
          status,
        };

        await TransactionService.processTransaction(transaction);
      } catch (error) {
        console.log('erroe generating transaction ->', error.message);
      }
    }
  },
};
