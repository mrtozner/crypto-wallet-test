import express from 'express';
import validate from './middlewares/validationMiddleware';
import AlertController from './domain/controllers/alertController';
import WalletController from './domain/controllers/walletController';
import TransactionController from './domain/controllers/transactionController';
import alertValidation from './domain/validations/alertValidation';
import walletValidation from './domain/validations/walletValidation';
import transactionValidation from './domain/validations/transactionValidation';
import catchError from './helpers/catchError';

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));

router.get('/alert', alertValidation.getAlerts, validate, catchError(AlertController.getAlerts));
router.get('/alert/:id', alertValidation.getAlertById, validate, catchError(AlertController.getAlertById));

router.post('/wallet', walletValidation.createWallet, validate, catchError(WalletController.createWallet));
router.get('/wallet/:id', walletValidation.getWalletById, validate, catchError(WalletController.getWalletById));
router.get('/wallet/by-address/:address', walletValidation.getWalletByAddress, validate, catchError(WalletController.getWalletByAddress));

router.get('/transaction', transactionValidation.getTransactions, validate, catchError(TransactionController.getTransactions));
router.get('/transaction/:id', transactionValidation.getTransactionById, validate, catchError(TransactionController.getTransactionById));

export default router;
