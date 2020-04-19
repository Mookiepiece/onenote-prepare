import ActionTypes from '../actions';
import { v4 as uuid } from 'uuid';
import { deepCopy, alt } from '@/utils';

const currentState = state => {
    if (state.memory.length > state.currentIndex + 1)
        return 'applied';
    else
        return 'current';
};

const workbenchAside = (state = {
    v: [],
    memory: [[{ children: [{ text: '' }] }]],
    currentIndex: null,
}, action) => {
    switch (action.type) {
        case ActionTypes.DELETE:
            //TODO 
            return state;
        case ActionTypes.PUSH_MATCH_RULE: {
            if (action.pushTransform) { //PUSH_TRANSFORM 如果是点击add transform 按钮，则要新建一个transform
                if (state.currentIndex !== null && currentState(state) === 'current') { //save prev transform
                    state = action.callback.match(state);
                }
                state = alt.set(state, 'currentIndex', state.v.length);
                state = alt.push(state, `v`, {
                    name: action.value.title,
                    matches: [],
                    currentMatch: null,
                    result: {
                        nodes: [],
                        options: {
                            overrideStyle: false,
                        }
                    }, //nodes会在useEffect里通过INPUT事件传入
                    key: uuid()
                });
            }

            let currentIndex = state.currentIndex;
            let v = state.v;
            let currentMatch = v[currentIndex].currentMatch;

            state = alt.push(state, `v.${currentIndex}.matches`, {
                ...action.value,
                inputs: { ...action.value.inputs, title: action.value.title },
                key: uuid()
            });
            state = alt.set(state, `v.${currentIndex}.matches.currentMatch`, currentMatch === null ? 0 : currentMatch + 1);

            return state;
        }
        case ActionTypes.INPUT: {
            let currentIndex = state.currentIndex;
            let matchIndex = action.matchIndex; // -1 result >=0 matches

            if (matchIndex < 0) {
                state = alt.set(state, `v.${currentIndex}.result`, action.inputs);
            } else {
                state = alt.merge(state, `v.${currentIndex}.matches.${matchIndex}.inputs`, action.inputs);
                action.rematch && (state = action.callback.match(state));
            }
            return state;
        }
        case ActionTypes.TOGGLE_ACTIVE: {
            let index = action.index;

            if (index < state.currentIndex) {
                //一步到位还原状态，
                action.callback.slate(state.memory[index]);
                state = {
                    ...state,
                    currentIndex: index,
                    memory: [...state.memory].slice(0, index + 1)
                };

            } else if (index === state.currentIndex) {
                if (currentState(state) === "current") {
                    state = action.callback.change(state);
                    return state;
                } else {
                    action.callback.slate(state.memory[index]); //setSlateValue后无法激活match要下一个阶段激活 
                    state = {
                        ...state,
                        memory: [...state.memory].slice(0, index + 1)
                    };
                    return state;
                }
            } else {
                //逐步应用
                if (currentState(state) === "current") {
                    state = action.callback.change(state);
                }
                for (let i = state.currentIndex + 1; i !== index; i++) {
                    state = action.callback.change(state, i);
                }

                state = {
                    ...state,
                    currentIndex: index,
                }

            }
            return state;
        }
        case ActionTypes.MATCH:
            state = action.callback.match(state);
            return state;
        case ActionTypes.APPLY:
            state = action.callback.change(state); //need add memory of editor.children
            return state;
        case ActionTypes.SET_CURRENT_INDEX:
            return { ...state, currentIndex: action.index }
        default:
            return state;
    }
}

export default workbenchAside;
