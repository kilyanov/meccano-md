import {EventEmitter} from 'events';

const emitter = new EventEmitter();

emitter.off = emitter.removeListener;

export default emitter;
