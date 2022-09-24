import express, { Express } from 'express';
import { StateService } from '../models/models';
import { getCategoryLogger } from './utils';

const log = getCategoryLogger('Web server');

// Sender
//
export const setupWebServer = async (state: StateService) => {
    const app = express();
    app.use(express.json());
    const port = 3000;

    app.get('/', (req, res) => {
        res.sendFile('client/index.html', { root: '.' });
    });

    setupUniverseApi(app, state);
    setupSnapshotApi(app, state);

    app.listen(port, () => {
        log(`App listening on port ${port}`);
    });
};

const setupUniverseApi = (app: Express, state: StateService) => {
    app.get('/api/universes/', (req, res) => {
        res.send(state.getUniverseList());
    });

    app.get('/api/universes/:universeId/updateName/:name', (req, res) => {
        const universeId = parseInt(req.params.universeId);
        const name = req.params.name;

        state.updateUniverseName(universeId, name);

        res.send('ok');
    });

    app.get('/api/universes/:universeId/addSnapshot/:name', (req, res) => {
        const universeId = parseInt(req.params.universeId);
        const name = req.params.name;

        state.addSnapshot(universeId, name);

        res.send('ok');
    });
};

const setupSnapshotApi = (app: Express, state: StateService) => {
    app.route('/api/universes/:universeId/snapshots/:snapshotId/:action/:value?').get((req, res) => {
        const universeId = parseInt(req.params.universeId);
        const snapshotId = req.params.snapshotId;
        const action = req.params.action;
        const value = req.params.value;

        switch (action) {
            case 'updateDmxData':
                state.updateSnapshotDmxData(universeId, snapshotId);
                break;

            case 'updateName':
                state.updateSnapshotName(universeId, snapshotId, value ?? '');
                break;

            case 'updateColor':
                state.updateSnapshotColor(universeId, snapshotId, value ?? '');
                break;

            case 'enable':
                state.enableSnapshot(universeId, snapshotId);
                break;

            case 'disable':
                state.disableSnapshot(universeId, snapshotId);
                break;

            case 'delete':
                state.deleteSnapshot(universeId, snapshotId);
                break;
        }

        res.send('ok');
    });
};
