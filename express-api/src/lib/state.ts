import { State, StateService } from '../models/models';
import { getCategoryLogger } from './utils';
import { webcrypto } from 'crypto';
import { Snapshot, Universe } from '../../../shared/models/models';

const log = getCategoryLogger('State service');
const DEFAULTCOLOR = undefined;

export const getUniverseById = (id: number, state: State) => {
    const universe = state.universes.find((x) => x.id === id);
    if (!universe) {
        throw new Error('Universe not found');
    }
    return universe;
};

export const patchUniverseById = (id: number, patch: Partial<Universe>, state: State) => {
    const universe = getUniverseById(id, state);

    if (patch.name !== undefined) {
        universe.name = patch.name;
    }

    if (patch.snapshots !== undefined) {
        universe.snapshots = patch.snapshots;
    }

    universe.updated = new Date();

    return universe;
};

export const getSnapshotById = (universeId: number, snapshotId: string, state: State) => {
    const universe = getUniverseById(universeId, state);
    const snapshot = universe.snapshots.find((x) => x.id === snapshotId);
    if (!snapshot) {
        throw new Error('Snapshot not found');
    }
    return snapshot;
};

export const patchSnapshotById = (universeId: number, snapshotId: string, patch: Partial<Snapshot>, state: State) => {
    const snapshot = getSnapshotById(universeId, snapshotId, state);

    if (patch.name !== undefined) {
        snapshot.name = patch.name;
    }
    if (patch.color !== undefined) {
        snapshot.color = patch.color;
    }
    if (patch.dmxData !== undefined) {
        snapshot.dmxData = patch.dmxData;
    }
    if (patch.enabled !== undefined) {
        snapshot.enabled = patch.enabled;
    }

    snapshot.updated = new Date();

    return snapshot;
};

export const getDmxDataToSendForUniverse = (universeId: number, state: State) => {
    const universe = getUniverseById(universeId, state);

    if (!universe.snapshots.some((x) => x.enabled)) {
        return null;
    }

    const mergedDmxData = universe.snapshots.reduce((merged, snapshot) => {
        if (!snapshot.enabled) {
            return merged;
        }

        for (const address in snapshot.dmxData) {
            const value = snapshot.dmxData[address];

            if (merged[address] && merged[address] > value) {
                continue;
            }

            merged[address] = value;
        }

        return merged;
    }, {} as Record<number, number>);

    return mergedDmxData;
};

// State handling
//
export const setupState = (
    universes: number[],
    liveContent: Record<number, Record<number, number> | null>,
): StateService => {
    const state: State = {
        priority: 190,
        universes: universes.map((universeId) => ({
            id: universeId,
            name: 'Universe ' + universeId,
            created: new Date(),
            updated: new Date(),
            snapshots: [],
        })),
    };

    const getDmxDataReceivedForUniverse = (universeId: number) => liveContent[universeId] ?? {};

    log(`State ready`);

    return {
        addSnapshot: (universeId, name) =>
            getUniverseById(universeId, state).snapshots.push({
                id: webcrypto.randomUUID(),
                created: new Date(),
                updated: new Date(),
                color: DEFAULTCOLOR,
                dmxData: getDmxDataReceivedForUniverse(universeId),
                enabled: false,
                name: name,
            }),

        deleteSnapshot: (universeId, snapshotId) =>
            (getUniverseById(universeId, state).snapshots = getUniverseById(universeId, state).snapshots.filter(
                (x) => x.id !== snapshotId,
            )),

        updateSnapshotDmxData: (universeId: number, snapshotId: string) =>
            patchSnapshotById(universeId, snapshotId, { dmxData: getDmxDataReceivedForUniverse(universeId) }, state),

        updateSnapshotColor: (universeId: number, snapshotId: string, color: string) =>
            patchSnapshotById(universeId, snapshotId, { color: color }, state),

        updateSnapshotName: (universeId: number, snapshotId: string, name: string) =>
            patchSnapshotById(universeId, snapshotId, { name: name }, state),

        enableSnapshot: (universeId: number, snapshotId: string) =>
            patchSnapshotById(universeId, snapshotId, { enabled: true }, state),

        disableSnapshot: (universeId: number, snapshotId: string) =>
            patchSnapshotById(universeId, snapshotId, { enabled: false }, state),

        getSnapshotList: (universeId: number) => getUniverseById(universeId, state).snapshots,

        getUniverseList: () => state.universes,

        updateUniverseName: (universeId: number, name: string) => patchUniverseById(universeId, { name: name }, state),

        getDmxDataToSendForUniverse: (universeId: number) => getDmxDataToSendForUniverse(universeId, state),
    };
};
