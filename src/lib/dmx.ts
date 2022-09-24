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

    listenForDmx(sACN, result);

    log(`App listening on universes ${universes}`);

    return result;
};

export const listenForDmx = async (reciver: Receiver, result: Record<number, Record<number, number> | null>) => {
    reciver.on('packet', async (packet) => {
        result[packet.universe] = packet.payload;
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
