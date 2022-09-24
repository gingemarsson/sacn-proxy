export interface StateService {
    addSnapshot: (universeId: number, snapshotName: string) => void;
    deleteSnapshot: (universeId: number, snapshotId: string) => void;
    updateSnapshotDmxData: (universeId: number, snapshotId: string) => void;
    updateSnapshotColor: (universeId: number, snapshotId: string, color: string) => void;
    updateSnapshotName: (universeId: number, snapshotId: string, name: string) => void;
    enableSnapshot: (universeId: number, snapshotId: string) => void;
    disableSnapshot: (universeId: number, snapshotId: string) => void;

    getUniverseList: () => Universe[];
    getSnapshotList: (universeId: number) => Snapshot[];
    updateUniverseName: (universeId: number, name: string) => void;

    getDmxDataToSendForUniverse: (universeId: number) => Record<number, number>;
}

export interface State {
    priority: number;
    universes: Universe[];
}

export interface Universe {
    id: number; // Universe number
    created: Date;
    updated: Date;
    name: string;
    snapshots: Snapshot[];
}

export interface Snapshot {
    id: string; // Guid
    created: Date;
    updated: Date;

    name: string;
    color: string; // Hex format
    dmxData: Record<number, number>;
    enabled: boolean;
}
