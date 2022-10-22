import React from 'react';
import styles from './UniverseDisplay.module.scss';
import { Universe } from '../../../shared/models/models';
import Button from './button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faPalette, faPen, faSave, faSquareMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

type Props = {
    universe: Universe;
    makeApiCall: (url: string) => void;
    showEditButtons: boolean;
};

const generateApiUrl = (universeId: number, snapshotId: string, action: string, value?: string) =>
    `/api/universes/${encodeURIComponent(universeId)}/snapshots/${encodeURIComponent(snapshotId)}/${encodeURIComponent(
        action,
    )}/${value ? encodeURIComponent(value) : ''}`;

const UniverseDisplay: React.FC<Props> = ({ universe, makeApiCall, showEditButtons }: Props) => {
    return (
        <div className={styles.universeContainer}>
            <h1 className={styles.heading}>{universe.name}</h1>

            {universe.snapshots.map((snapshot) => (
                <div className={styles.row} key={snapshot.id}>
                    <Button
                        isHighlighted={snapshot.enabled}
                        onClick={() =>
                            makeApiCall(
                                generateApiUrl(universe.id, snapshot.id, snapshot.enabled ? 'disable' : 'enable'),
                            )
                        }
                        color={snapshot.color}
                    >
                        {snapshot.name}
                    </Button>
                    {showEditButtons ? (
                        <>
                            <Button
                                isSideButton={true}
                                onClick={() =>
                                    makeApiCall(
                                        generateApiUrl(
                                            universe.id,
                                            snapshot.id,
                                            'updateDmxData',
                                        ),
                                    )
                                }
                            >
                                <FontAwesomeIcon icon={faSave} />
                            </Button>
                            <Button
                                isSideButton={true}
                                onClick={() =>
                                    makeApiCall(
                                        generateApiUrl(
                                            universe.id,
                                            snapshot.id,
                                            'deleteDmxData',
                                        ),
                                    )
                                }
                            >
                                <FontAwesomeIcon icon={faSquareMinus} />
                            </Button>
                            <Button
                                isSideButton={true}
                                onClick={() =>
                                    makeApiCall(
                                        generateApiUrl(
                                            universe.id,
                                            snapshot.id,
                                            'updateName',
                                            prompt('Namn', snapshot.name) ?? '',
                                        ),
                                    )
                                }
                            >
                                <FontAwesomeIcon icon={faPen} />
                            </Button>
                            <Button
                                isSideButton={true}
                                onClick={() =>
                                    makeApiCall(
                                        generateApiUrl(
                                            universe.id,
                                            snapshot.id,
                                            'updateColor',
                                            prompt('Färg (hex)', snapshot.color) ?? '',
                                        ),
                                    )
                                }
                            >
                                <FontAwesomeIcon icon={faPalette} />
                            </Button>
                            <Button
                                isSideButton={true}
                                onClick={() => makeApiCall(generateApiUrl(universe.id, snapshot.id, 'delete'))}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </>
                    ) : null}
                </div>
            ))}
            {showEditButtons ? (
                <div className={styles.row}>
                    <Button onClick={() => makeApiCall(`api/universes/${universe.id}/addSnapshot/Ny`)}>
                        Lägg till snapshot
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default UniverseDisplay;
