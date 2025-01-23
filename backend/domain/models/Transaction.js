import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
    from: String,
    to: String,
    contractAddress: String,
    amount: Number,
    symbol: String,
    hash: String,
    status: String,
}, { timestamps: true, toJSON: { virtuals: true } });

export default model('Transaction', transactionSchema);
