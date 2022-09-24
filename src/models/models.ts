export interface StateService {
    pauseUniverse: (universeId: number) => void;
    sendFreeze: (universeId: number) => void;
    sendSnapshot: (universeId: number, snapshotId: number) => void;
    storeSnapshot: (universeId: number, snapshotId: number) => void;
    getDataToSendForUniverse: (universeId: number) => Record<number, number> | null;
    getStatus: () => Record<number, UniverseStatus>;
}

export interface UniverseStatus {
    feed: string;
    snapshots: any;
}
