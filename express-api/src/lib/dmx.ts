import { Receiver, Sender } from 'sacn';
import { StateService } from '../models/models';
import { getCategoryLogger } from './utils';

const log = getCategoryLogger('SACN server');

// Listener
//
export const setupDmxListener = (universes: number[]) => {
    const sACN = new Receiver({
        universes: universes,
    });

    const result = universes.reduce(
        (record: Record<number, Record<number, number> | null>, universeId: number) => ({
            ...record,
            [universeId]: null,
        }),
        {},
    );

    const receivedMetadata = universes.reduce(
        (
            record: Record<number, { priority: number; lastReceived: number; sender?: string } | null>,
            universeId: number,
        ) => ({
            ...record,
            [universeId]: { priority: 0, lastReceived: 0 },
        }),
        {},
    );

    listenForDmx(sACN, result, receivedMetadata);

    log(`App listening on universes ${universes}`);

    return result;
};

export const listenForDmx = async (
    reciver: Receiver,
    result: Record<number, Record<number, number> | null>,
    receivedMetadata: Record<number, { priority: number; lastReceived: number; sender?: string } | null>,
) => {
    reciver.on('packet', async (packet) => {
        const metadata = receivedMetadata[packet.universe];
        if (metadata && metadata.priority > packet.priority && metadata.lastReceived > Date.now() - 15000) {
            // If prio is lower than stored prio, and not enough time has elapsed, return.
            return;
        }

        result[packet.universe] = packet.payload;
        receivedMetadata[packet.universe] = {
            priority: packet.priority,
            lastReceived: Date.now(),
            sender: packet.sourceName,
        };
    });
};

// Sender
//
export const setupDmxSending = (universes: number[], state: StateService, appName: string, priority: number) => {
    const sACNSenders = universes.reduce(
        (record: Record<number, Sender>, universeId: number) => ({
            ...record,
            [universeId]: new Sender({
                universe: universeId,
            }),
        }),
        {},
    );

    setInterval(async () => {
        universes.forEach(async (universeId) => {
            const sender = sACNSenders[universeId];
            const dataToSend = state.getDmxDataToSendForUniverse(universeId);

            if (!dataToSend) {
                return;
            }

            await sender.send({
                payload: dataToSend,
                sourceName: appName,
                priority: priority,
            });
        });
    }, 1000);

    log(`App ready to send universes ${universes} as ${appName} with priority ${priority}`);
};
