import { Receiver, Sender } from 'sacn';
import { StateService } from '../models/models';

// Listener
//
export const setupDmxListener = (universes: number[]) => {
    const sACN = new Receiver({
        universes: universes,
    });

    const result = universes.reduce((record: Record<number, Record<number, number> | null>, universeId: number) => ({...record, [universeId]: null}), {})

    listenForDmx(sACN, result);

    console.log(`[sACN server] App listening on universes ${universes}`)

    return result;
}

export const listenForDmx = async (reciver: Receiver, result: Record<number, Record<number, number> | null>) => {
    reciver.on('packet', async (packet) => {
        console.log('received', packet.payload)
        result[packet.universe] = packet.payload;
    });
}


// Sender
//
export const setupDmxSending = (universes: number[], state: StateService, appName: string, priority: number) => {
    const sACNSenders = universes.reduce((record: Record<number, Sender>, universeId: number) => ({...record, [universeId]: new Sender({
        universe: universeId,
    })}), {})

    setInterval(async () => {
        universes.forEach(async universeId => {
            const sender = sACNSenders[universeId];
            const dataToSend = state.getDataToSendForUniverse(universeId);
            
            if (!dataToSend) {
                return;
            }

            await sender.send({
                payload: dataToSend,
                sourceName: appName,
                priority: priority,
            });
        })        
    }, 1000);

    console.log(`[sACN server] App ready to send universes ${universes} as ${appName} with priority ${priority}`)
}
