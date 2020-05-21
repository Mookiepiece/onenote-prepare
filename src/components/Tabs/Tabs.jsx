import React, { useEffect, useState } from 'react';
import Button from '../Button';

import './tabs.scss';

export default ({
    panels,
    lazy = false,
    onlyone = false,
    onChange = _ => Promise.resolve(true),
    ...others
}) => {
    const [index, _setIndex] = useState(0);

    const setIndex = i => onChange(index, i).then(
        shouldUpdate => shouldUpdate && _setIndex(i)
    ).catch(
        e => console.error("[tab] tab change cancelled by error:", e)
    );

    useEffect(_ => {
        if (!panels.length) console.error("[tab] panels.length === 0, need provide panels for tabs");
        if (index > panels.length) {
            setIndex(panels.length - 1);
        }
    }, [panels]);

    return (
        <div className="tabs" {...others}>
            <TabNav
                panels={panels}
                index={index}
                setIndex={setIndex}
            />
            <div>
                {panels.map(([key, title, view], i) => {
                    return (
                        <TabView
                            key={key}
                            view={view}
                            visible={index === i}
                            lazy={lazy}
                            onlyone={onlyone}
                        />
                    )
                })}
            </div>
        </div>
    );
};

function TabNav({ panels, index, setIndex }) {
    return (
        <nav style={{ display: "flex" }}>
            {panels.map(([key, title], i) => {
                return (
                    <Button
                        key={key}
                        active={index === i}
                        onClick={_ => index !== i && setIndex(i)}
                    >
                        {title}
                    </Button>
                );
            })}
        </nav>
    );
}

export function TabView({ view, visible, lazy, onlyone }) {
    const [inited, setInited] = useState(false); // lazy: locked to be true after the first render

    // onlyone will override lazy
    if (onlyone) {
        if (!visible)
            return (null);
    }
    else if (lazy) {
        if (visible && !inited)
            setInited(true);
    }


    return (
        <div style={{ display: visible ? '' : 'none' }}>
            {
                lazy ? (
                    inited ? view : null
                ) : (
                        visible ? view : null
                    )
            }
        </div>
    );
}
