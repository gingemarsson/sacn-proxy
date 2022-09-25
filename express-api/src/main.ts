import { setupDmxListener, setupDmxSending } from './lib/dmx.js';
import { setupState } from './lib/state.js';
import { getCategoryLogger } from './lib/utils.js';
import { setupWebServer } from './lib/web.js';

const APP_NAME = 'node-sacn-proxy';
const APP_PRIO = 90;
const UNIVERSES = [1, 2, 3, 4];

const log = getCategoryLogger('Main');

// Main app
//
const run = async (universes: number[]) => {
    log(`App running`);

    const liveDmxData = setupDmxListener(universes);
    const state = await setupState(universes, liveDmxData);
    setupDmxSending(universes, state, APP_NAME, APP_PRIO);
    setupWebServer(state);
};

run(UNIVERSES);
