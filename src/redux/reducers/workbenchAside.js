import ActionTypes from '../actions';
import { v4 as uuid } from 'uuid';
import { alt, deepCopy } from '@/utils';

const workbenchAside = (state = {
    v: null,
    memory: [],
}, action) => {
    switch (action.type) {
        case ActionTypes.PUSH_MEMORY:
            state = alt.push(state, 'memory', {
                time: new Date(),
                value: deepCopy(action.callback.children())
            });
            if (state.memory.length > 10) {
                state = alt.set(state, 'memory', state.memory.slice(-10));
            }
            return state;
        case ActionTypes.DELETE:
            action.callback.slate(state.memory[state.memory.length - 1].value);
            // state = alt.del(state, `memory`, state.memory.length - 1);
            state = alt.set(state, 'memory', state.memory.slice(0, state.memory.length - 1));
            state = alt.set(state, 'v.shouldDelete', true);
            return state;
        case ActionTypes.PUSH_MATCH_RULE: {
            state = alt.set(state, `v`, {
                name: action.value.title,
                matches: [],
                isApplied: false,
                shouldDelete: false,
                result: {
                    nodes: [],
                    options: {
                        overrideStyle: false,
                        clear:false,
                    }
                }, // nodes会在useEffect里通过INPUT事件传入
                key: uuid()
            });

            state = alt.push(state, `v.matches`, {
                ...action.value,
                inputs: { ...action.value.inputs, title: action.value.title },
                key: uuid()
            });

            // better add memory here, because at this time we toggle our editor to an readOnly state
            state = alt.push(state, 'memory', {
                time: new Date(),
                value: deepCopy(action.callback.children())
            });
            if (state.memory.length > 10) {
                state = alt.set(state, 'memory', state.memory.slice(-10));
            }

            return state;
        }
        case ActionTypes.INPUT: {
            let matchIndex = action.matchIndex; // -1 result >= 0 matches

            if (matchIndex < 0) {
                state = alt.set(state, `v.result`, action.inputs);
            } else {
                state = alt.merge(state, `v.matches.${matchIndex}.inputs`, action.inputs);
                action.rematch && (state = action.callback.match(state));
            }
            return state;
        }
        case ActionTypes.TOGGLE_PREVIEW: {
            if (state.v === null) throw new Error('[pre-onenote][store] .');
            if (state.v.isApplied) {
                action.callback.slate(state.memory[state.memory.length - 1].value);
                setTimeout(_ => action.callback.match(state), 0); //WARNING: bad practice, should open another memory to record those state
            } else {
                state = action.callback.change(state);
            }
            state = alt.set(state, `v.isApplied`, !state.v.isApplied);
            return state;
        }
        case ActionTypes.MATCH:
            state = action.callback.match(state);
            return state;
        case ActionTypes.APPLY:
            if (state.v === null) throw new Error('[pre-onenote][store] .');
            if (!state.v.isApplied) {
                state = action.callback.change(state);
            }
            state = alt.set(state, 'v.shouldDelete', true);
            return state;
        case ActionTypes.APPLY_FINISH:
            // WARNING: I do not actually know whether our slate will finish its transform work during one render
            state = alt.set(state, `v`, null);
            return state;
        default:
            return state;
    }
}

export default workbenchAside;
