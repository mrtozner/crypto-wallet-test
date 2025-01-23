import { check } from 'express-validator';

export default {
    getTransactionById: [
        check('id')
            .isMongoId(),
    ],
    getTransactions: [
        check('page')
            .optional()
            .isInt({ min: 1 }),
        check('limit')
            .optional()
            .isInt({ min: 1 }),
        check('filter')
            .optional()
            .custom((value) => {
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    throw new Error('Filter must be a valid JSON string');
                }
            }),
    ],
};
