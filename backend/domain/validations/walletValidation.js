import { check } from 'express-validator';

export default {
    createWallet: [
        check('userId')
            .isString()
            .optional(),
    ],
    getWalletById: [
        check('id')
            .isMongoId()
            .notEmpty()
    ],
    getWalletByAddress: [
        check('address')
            .isString()
            .notEmpty()
    ],
};
