import EventEmitter from 'eventemitter3';

class Emitter extends EventEmitter {
  EVENT_PREFS_UPDATE = 'pref_update';
  EVENT_PREFS_READY = 'pref_ready';

  INNER_DRIVE_READY = 'inner_drive_ready';
  INNER_DRIVE_LOADING = 'inner_drive_loading';
}
const emitter = new Emitter();

export default emitter;
