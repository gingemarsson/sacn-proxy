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
    color?: string; // Hex format
    dmxData: Record<number, number>;
    enabled: boolean;
}
