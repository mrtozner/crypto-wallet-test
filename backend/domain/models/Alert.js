import { Schema, model } from 'mongoose';
import constant from '../../constant';

const alertSchema = new Schema({
    type: { type: String, enum: Object.keys(constant.alertTypes) },
    message: String,
    transactionId: {type: Schema.Types.ObjectId, ref: 'Transaction'},
}, { timestamps: true, toJSON: { virtuals: true } });

export default model('Alert', alertSchema);
