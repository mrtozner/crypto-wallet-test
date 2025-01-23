import Alert from '../models/alert';

class AlertRepository {
    async createAlert(alertData) {
        return Alert.create(alertData);
    }

    async createAlerts(alerts) {
        return Alert.insertMany(alerts);
    }

    async getAlertById(id) {
        return Alert.findById(id).populate('transactionId').lean();
    }

    async getAlerts(page, limit, filter) {
        return Alert.find({ ...filter })
            .sort('-createdAt')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .lean();
    }

    async updateAlertById(id, updateData) {
        return Alert.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
}

export default new AlertRepository();
