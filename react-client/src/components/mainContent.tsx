import React from 'react';
import useSwr from 'swr';
import { Universe } from '../../../shared/models/models';
import { getResponseContentOrError } from '../lib/utils';
import styles from './mainContent.module.scss';
import UniverseDisplay from './universeDisplay';

const MainContent: React.FC = () => {
    const { data, mutate } = useSwr('/api/universes', (url: string) =>
        fetch(url).then((response) => getResponseContentOrError<Universe[]>(response)),
    );

    const makeApiCall = (url: string) => {
        console.log('Making API call to', url)
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
            {data.map((u: Universe) => (
                <UniverseDisplay universe={u} key={u.id} makeApiCall={makeApiCall} />
            ))}
        </div>
    );
};

export default MainContent;
