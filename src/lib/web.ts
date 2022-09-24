import express from 'express';
import { StateService } from '../models/models';
import { getCategoryLogger } from './utils';

const log = getCategoryLogger('Web server');

// Sender
//
export const setupWebServer = async (state: StateService) => {
    const app = express();
    const port = 3000;

    app.get('/', (req, res) => {
        res.sendFile('client/index.html', { root: '.' });
    });

    app.get('/api/status', (req, res) => {
        res.send(state.getStatus());
    });

    app.get('/api/:universeId/:action/:id?', (req, res) => {
        const universeId = parseInt(req.params.universeId);
        const action = req.params.action;
        const snapshotId = req.params.id ? parseInt(req.params.id) : undefined;

        switch (action) {
            case 'live':
                state.pauseUniverse(universeId);
                break;
            case 'freeze':
                state.sendFreeze(universeId);
                break;
            case 'sendSnapshot':
                if (!snapshotId) {
                    throw 'Invalid snapshot id';
                }
                state.sendSnapshot(universeId, snapshotId);
                break;
            case 'storeSnapshot':
                if (!snapshotId) {
                    throw 'Invalid snapshot id';
                }
                state.storeSnapshot(universeId, snapshotId);
                break;
            case 'status':
                break;
        }

        res.send(state.getStatus());

        log(`API call received for action ${action}`);
    });

    app.listen(port, () => {
        log(`App listening on port ${port}`);
    });
};
