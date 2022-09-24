import { StateService, UniverseStatus } from '../models/models';

// State handling
//
export const setupState = (universes: number[], liveContent: Record<number, Record<number, number> | null>): StateService => {
    const snapshots = universes.reduce((record: Record<number, Record<number, Record<number, number>>>, universeId: number) => ({...record, [universeId]: {}}), {});
    const currentContent = universes.reduce((record: Record<number, {data: Record<number, number>, label: string} | null>, universeId: number) => ({...record, [universeId]: null}), {});

    console.log(`[State service] State ready`)

    return {
        pauseUniverse: (universeId: number) => currentContent[universeId] = null,
        sendFreeze: (universeId: number) => currentContent[universeId] = {data: {...liveContent[universeId]}, label: 'freeze'},
        sendSnapshot: (universeId: number, snapshotId: number) => currentContent[universeId] = {data: snapshots[universeId][snapshotId], label: snapshotId.toString()},
        storeSnapshot: (universeId: number, snapshotId: number) => snapshots[universeId][snapshotId] = {...liveContent[universeId]},
        getDataToSendForUniverse: (universeId: number) => currentContent[universeId]?.data ?? null,
        getStatus: () => universes.reduce((record: Record<number, UniverseStatus>, universeId: number) => ({...record, [universeId]: {feed: currentContent[universeId]?.label ?? 'live', snapshots: snapshots[universeId]}}), {}),
    }
}