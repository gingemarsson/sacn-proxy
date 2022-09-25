import { setupDmxListener, setupDmxSending } from './lib/dmx';
import { setupState } from './lib/state';
import { getCategoryLogger } from './lib/utils';
import { setupWebServer } from './lib/web';

const APP_NAME = 'node-sacn-proxy';
const APP_PRIO = 190;
const UNIVERSES = [1, 2, 3, 4];

const log = getCategoryLogger('Main');

// Main app
//
const run = (universes: number[]) => {
    log(`App running`);

    const liveDmxData = setupDmxListener(universes);
    const state = setupState(universes, liveDmxData);
    setupDmxSending(universes, state, APP_NAME, APP_PRIO);
    setupWebServer(state);
};

run(UNIVERSES);
