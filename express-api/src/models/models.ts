import { Universe, Snapshot } from '../../../shared/models/models';

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

    getDmxDataToSendForUniverse: (universeId: number) => Record<number, number> | null;
}

export interface State {
    universes: Universe[];
}
