import React, { useEffect, useState } from 'react';
import { TinyEmitter, EVENTS } from '@/utils';
import { Portal } from '../util';

const Loading = () => {
    const [state, setState] = useState();

    useEffect(_ => {
        const handler1 = _ => setState(state + 1);
        const handler2 = _ => setState(state - 1);
        TinyEmitter.on(EVENTS.LOADING, handler1);
        TinyEmitter.on(EVENTS.LOADING_FINISH, handler2);
        return _ => {
            TinyEmitter.off(EVENTS.LOADING, handler1);
            TinyEmitter.off(EVENTS.LOADING_FINISH, handler2);
        }
    }, [state]);


    let style = {};
    activeColor && (style = { '--active-color': activeColor });
    inactiveColor && (style = { '--inactive-color': inactiveColor });

    return (
        <Portal>
            <div
                className="loading"
            >
            </div>
        </Portal>
    )
}

export default Loading;