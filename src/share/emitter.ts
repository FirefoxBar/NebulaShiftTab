import EventEmitter from 'eventemitter3';

class Emitter extends EventEmitter {
  EVENT_PREFS_UPDATE = 'pref_update';
  EVENT_PREFS_READY = 'pref_ready';
}
const emitter = new Emitter();

export default emitter;
