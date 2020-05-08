import ActionTypes from '../actions';
import { v4 as uuid } from 'uuid';
import { alt, deepCopy } from '@/utils';
import IndexDB from '@/store/indexedDB';

function altMemory(state, action) {
    let { memory } = state;

    switch (action.type) {
        case ActionTypes.INIT_MEMORY:
            memory = action.value;
            break;
        case ActionTypes.PUSH_MEMORY:
        case ActionTypes.PUSH_MATCH_RULE:
            memory = memory.concat({
                time: new Date(),
                value: deepCopy(action.callback.children())
            });
            if (memory.length > 10) {
                memory = memory.slice(-10);
            }
            break;
        case ActionTypes.DELETE:
            memory = memory.slice(0, memory.length - 1);
            break;
        default:
            throw new Error('[pre-onenote] redux');
    }

    IndexDB.history(memory);
    return memory;
}

const workbenchAside = (state = {
    v: null,
    memory: [],
}, action) => {
    switch (action.type) {
        case ActionTypes.INIT_MEMORY:
            return {
                ...state,
                memory: altMemory(state, action)
            }
        case ActionTypes.PUSH_MEMORY:
            return {
                ...state,
                memory: altMemory(state, action)
            };
        case ActionTypes.DELETE:
            action.callback.slate(state.memory[state.memory.length - 1].value); // reset
            state = alt.set(state, 'v.shouldDelete', true);
            return {
                ...state,
                memory: altMemory(state, action)
            };
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
                        clear: false,
                        dividers: []
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
            return {
                ...state,
                memory: altMemory(state, action)
            };
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
            if (state.v.isApplied) {
                action.callback.slate(state.memory[state.memory.length - 1].value); // reset
                setTimeout(_ => action.callback.match(state), 0); // WARNING: bad practice, should open another memory to record those state
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
