import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import useSwr from 'swr';
import { Universe } from '../../../shared/models/models';
import { getResponseContentOrError } from '../lib/utils';
import Button from './button';
import styles from './mainContent.module.scss';
import UniverseDisplay from './universeDisplay';

const MainContent: React.FC = () => {
    const [enableEdit, setEnableEdit] = useState(false);

    const { data, mutate } = useSwr('/api/universes', (url: string) =>
        fetch(url).then((response) => getResponseContentOrError<Universe[]>(response)),
    );

    const makeApiCall = (url: string) => {
        console.log('Making API call to', url);
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(url, request)
            .catch((error: Error) => {
                console.error(error);
            })
            .finally(() => mutate());
    };

    if (!data) {
        return <span>Loading...</span>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.headingContainer}>
                <h1 className={styles.heading}>sACN Snapshots</h1>
                <div>
                    <Button onClick={() => setEnableEdit((x) => !x)}>
                        <FontAwesomeIcon icon={faPen} />
                    </Button>
                </div>
            </div>
            <div className={styles.universeListContainer}>
                {data.map((u: Universe) => (
                    <UniverseDisplay universe={u} key={u.id} makeApiCall={makeApiCall} showEditButtons={enableEdit} />
                ))}
            </div>
        </div>
    );
};

export default MainContent;
