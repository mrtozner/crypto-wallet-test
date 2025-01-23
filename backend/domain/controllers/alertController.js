import AlertService from '../services/AlertService.js';

class AlertController {
    async getAlertById(req, res, next) {
        const { id } = req.params;
        const response = await AlertService.getAlertById(id);
        res.json(response);
    }

    async getAlerts(req, res) {
        const { page = 1, limit = 10 } = req.query;
        const filter = JSON.parse(req.query.filter || '{}');

        if (req.query.type) {
            filter.type = req.query.type;
        }
        const response = await AlertService.getAlerts(page, limit, filter);
        res.json(response);
    }
}

export default new AlertController();
