import AlertRepository from '../repositories/AlertRepository';
import mongoose from 'mongoose';

class AlertService {
    async createAlert(alertData) {
        const { type, message, transactionId } = alertData;
        return AlertRepository.createAlert({ type, message, transactionId: mongoose.Types.ObjectId(transactionId) });
    }

    async createAlerts(alertDatas) {
        const formattedAlerts = alertDatas.map((alert) => ({
            type: alert.type,
            message: alert.message,
            transactionId: mongoose.Types.ObjectId(alert.transactionId),
        }));

        return AlertRepository.createAlerts(formattedAlerts);
    }

    async getAlertById(id) {
        const alert = await AlertRepository.getAlertById(id);
        if (!alert) {
            throw new Error('Alert not found.');
        }
        return alert;
    }

    async getAlerts(page, limit, filter) {
        return AlertRepository.getAlerts(page, limit, filter);
    }

    async updateAlert(id, updateData) {
        const updatedAlert = await AlertRepository.updateAlertById(id, updateData);
        if (!updatedAlert) {
            throw new Error('Alert not found or could not be updated.');
        }
        return updatedAlert;
    }
}

export default new AlertService();
