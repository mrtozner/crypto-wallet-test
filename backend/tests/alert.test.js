import AlertService from '../domain/services/AlertService';
import AlertRepository from '../domain/repositories/AlertRepository';
import mongoose from 'mongoose';

jest.mock('../domain/repositories/AlertRepository');

describe('AlertService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a single alert', async () => {
        const mockAlertData = {
            type: 'largeTransaction',
            message: 'Large transaction detected',
            transactionId: '644a7b5c8b8e2a001f7f1f30',
        };
        const mockCreatedAlert = {
            ...mockAlertData,
            _id: '123',
            transactionId: mockAlertData.transactionId,
        };

        AlertRepository.createAlert.mockResolvedValue(mockCreatedAlert);

        const alert = await AlertService.createAlert(mockAlertData);

        expect(alert).toEqual(mockCreatedAlert);
        expect(AlertRepository.createAlert).toHaveBeenCalledWith({
            type: mockAlertData.type,
            message: mockAlertData.message,
            transactionId: mongoose.Types.ObjectId(mockAlertData.transactionId),
        });
    });

    it('should create multiple alerts', async () => {
        const mockAlertDatas = [
            { type: 'largeTransaction', message: 'Alert 1', transactionId: '644a7b5c8b8e2a001f7f1f30' },
            { type: 'suspiciousActivity', message: 'Alert 2', transactionId: '644a7b5c8b8e2a001f7f1f31' },
        ];
        const mockCreatedAlerts = mockAlertDatas.map((alert) => ({
            ...alert,
            _id: mongoose.Types.ObjectId().toString(),
            transactionId: mongoose.Types.ObjectId(alert.transactionId),
        }));

        AlertRepository.createAlerts.mockResolvedValue(mockCreatedAlerts);

        const alerts = await AlertService.createAlerts(mockAlertDatas);

        expect(alerts).toEqual(mockCreatedAlerts);
        expect(AlertRepository.createAlerts).toHaveBeenCalledWith(
            mockAlertDatas.map((alert) => ({
                type: alert.type,
                message: alert.message,
                transactionId: mongoose.Types.ObjectId(alert.transactionId),
            }))
        );
    });

    it('should get an alert by ID', async () => {
        const mockAlertId = '644a7b5c8b8e2a001f7f1f30';
        const mockAlert = {
            _id: mockAlertId,
            type: 'largeTransaction',
            message: 'Large transaction detected',
            transactionId: mongoose.Types.ObjectId(),
        };

        AlertRepository.getAlertById.mockResolvedValue(mockAlert);

        const alert = await AlertService.getAlertById(mockAlertId);

        expect(alert).toEqual(mockAlert);
        expect(AlertRepository.getAlertById).toHaveBeenCalledWith(mockAlertId);
    });

    it('should throw an error if alert by ID is not found', async () => {
        const mockAlertId = 'nonexistent-id';

        AlertRepository.getAlertById.mockResolvedValue(null);

        await expect(AlertService.getAlertById(mockAlertId)).rejects.toThrow('Alert not found.');
        expect(AlertRepository.getAlertById).toHaveBeenCalledWith(mockAlertId);
    });

    it('should get alerts with pagination and filter', async () => {
        const mockPage = 1;
        const mockLimit = 10;
        const mockFilter = { type: 'largeTransaction' };
        const mockAlerts = [
            { _id: '1', type: 'largeTransaction', message: 'Alert 1', transactionId: '644a7b5c8b8e2a001f7f1f30' },
            { _id: '2', type: 'largeTransaction', message: 'Alert 2', transactionId: '644a7b5c8b8e2a001f7f1f31' },
        ];

        AlertRepository.getAlerts.mockResolvedValue(mockAlerts);

        const alerts = await AlertService.getAlerts(mockPage, mockLimit, mockFilter);

        expect(alerts).toEqual(mockAlerts);
        expect(AlertRepository.getAlerts).toHaveBeenCalledWith(mockPage, mockLimit, mockFilter);
    });

    it('should update an alert by ID', async () => {
        const mockAlertId = '644a7b5c8b8e2a001f7f1f30';
        const mockUpdateData = { message: 'Updated alert message' };
        const mockUpdatedAlert = {
            _id: mockAlertId,
            type: 'largeTransaction',
            message: mockUpdateData.message,
            transactionId: mongoose.Types.ObjectId(),
        };

        AlertRepository.updateAlertById.mockResolvedValue(mockUpdatedAlert);

        const updatedAlert = await AlertService.updateAlert(mockAlertId, mockUpdateData);

        expect(updatedAlert).toEqual(mockUpdatedAlert);
        expect(AlertRepository.updateAlertById).toHaveBeenCalledWith(mockAlertId, mockUpdateData);
    });

    it('should throw an error if alert update fails', async () => {
        const mockAlertId = 'nonexistent-id';
        const mockUpdateData = { message: 'Updated alert message' };

        AlertRepository.updateAlertById.mockResolvedValue(null);

        await expect(AlertService.updateAlert(mockAlertId, mockUpdateData)).rejects.toThrow(
            'Alert not found or could not be updated.'
        );
        expect(AlertRepository.updateAlertById).toHaveBeenCalledWith(mockAlertId, mockUpdateData);
    });
});
