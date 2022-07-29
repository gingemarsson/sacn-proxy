import { Receiver, Sender } from 'sacn';
import express from 'express';

const APP_NAME = 'node-sacn-proxy';
const APP_PRIO = 190;
const UNIVERSES = [1,2,3,4];

// Listener
//
const setupDmxListener = (universes: number[]) => {
    const sACN = new Receiver({
        universes: universes,
    });

    const result = universes.reduce((record: Record<number, Record<number, number> | null>, universeId: number) => ({...record, [universeId]: null}), {})

    listenForDmx(sACN, result);

    console.log(`[sACN server] App listening on universes ${universes}`)

    return result;
}

const listenForDmx = async (reciver: Receiver, result: Record<number, Record<number, number> | null>) => {
    reciver.on('packet', async (packet) => {
        result[packet.universe] = packet.payload;
    });
}


// Sender
//
const setupDmxSending = (universes: number[], state: StateService, appName: string, priority: number) => {
    const sACNSenders = universes.reduce((record: Record<number, Sender>, universeId: number) => ({...record, [universeId]: new Sender({
        universe: universeId,
    })}), {})

    setInterval(async () => {
        universes.forEach(async universeId => {
            const sender = sACNSenders[universeId];
            const dataToSend = state.getDataToSendForUniverse(universeId);
            
            if (!dataToSend) {
                return;
            }

            await sender.send({
                payload: dataToSend,
                sourceName: appName,
                priority: priority,
            });
        })        
    }, 1000);

    console.log(`[sACN server] App ready to send universes ${universes} as ${appName} with priority ${priority}`)
}

// Sender
//
const setupWebServer = async (state: StateService) => {
    const app = express();
    const port = 3000;
    
    app.get('/', (req, res) => {
        res.sendFile('index.html', { root: '.' });
    })

    app.get('/api/status', (req, res) => {
        res.send(state.getStatus());
    })

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
                if (!snapshotId) {throw 'Invalid snapshot id'}
                state.sendSnapshot(universeId, snapshotId);
                break;
            case 'storeSnapshot':
                if (!snapshotId) {throw 'Invalid snapshot id'}
                state.storeSnapshot(universeId, snapshotId);
                break;
            case 'status':
                break;
        }

        res.send(state.getStatus());

        console.log(`[Web server] API call received for action ${action}`)
    })
    
    app.listen(port, () => {
        console.log(`[Web server] App listening on port ${port}`)
    })
}

// State handling
//
const setupState = (universes: number[], liveContent: Record<number, Record<number, number> | null>): StateService => {
    const snapshots = universes.reduce((record: Record<number, Record<number, Record<number, number>>>, universeId: number) => ({...record, [universeId]: {}}), {});
    const currentContent = universes.reduce((record: Record<number, {data: Record<number, number>, label: string} | null>, universeId: number) => ({...record, [universeId]: null}), {});

    console.log(`[State service] State ready`)

    return {
        pauseUniverse: (universeId: number) => currentContent[universeId] = null,
        sendFreeze: (universeId: number) => currentContent[universeId] = {data: {...liveContent[universeId]}, label: 'freeze'},
        sendSnapshot: (universeId: number, snapshotId: number) => currentContent[universeId] = {data: snapshots[universeId][snapshotId], label: snapshotId.toString()},
        storeSnapshot: (universeId: number, snapshotId: number) => snapshots[universeId][snapshotId] = {...liveContent[universeId]},
        getDataToSendForUniverse: (universeId: number) => currentContent[universeId]?.data ?? null;
        getStatus: () => universes.reduce((record: Record<number, UniverseStatus>, universeId: number) => ({...record, [universeId]: {feed: currentContent[universeId]?.label ?? 'live', snapshots: snapshots[universeId]}}), {}),
    }
}
interface StateService {
    pauseUniverse: (universeId: number) => void;
    sendFreeze: (universeId: number) => void;
    sendSnapshot: (universeId: number, snapshotId: number) => void;
    storeSnapshot: (universeId: number, snapshotId: number) => void;
    getDataToSendForUniverse: (universeId: number) => Record<number, number> | null;
    getStatus: () => Record<number, UniverseStatus>;
}
interface UniverseStatus {
    feed: string,
    snapshots: any
}

// Main app
//
const run = (universes: number[]) => {
    console.log(`[Main] App running`)

    const liveDmxData = setupDmxListener(universes);
    const state = setupState(universes, liveDmxData);
    setupDmxSending(universes, state, APP_NAME, APP_PRIO);
    setupWebServer(state);
}

run(UNIVERSES);