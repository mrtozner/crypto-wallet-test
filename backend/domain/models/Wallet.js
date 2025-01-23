import { Schema, model } from 'mongoose';

const walletSchema = new Schema({
    userId: String,
    publicKey: String,
    privateKey: String,
    tokens: [{
        symbol: String,
        amount: Number,
    }],
}, { timestamps: true, toJSON: { virtuals: true } });

export default model('Wallet', walletSchema);
