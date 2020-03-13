import React, { useState, useEffect } from 'react';
import './style.scss';
import { BlockOutlined, BorderOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons'

import { remote } from 'electron';

let currentWindow = remote.getCurrentWindow();

function useWindowMaximize() {
    let [windowMaximize, _setWindowMaximize] = useState(currentWindow.isMaximized());

    const setWindowMaximize = (bool) => {
        if (bool) {
            currentWindow.maximize();
            _setWindowMaximize(true);
        } else {
            currentWindow.unmaximize();
            _setWindowMaximize(false);
        }
    }

    const setTrue = _ => _setWindowMaximize(true);
    const setFalse = _ => _setWindowMaximize(false);

    useEffect(_ => {
        currentWindow.on('maximize', setTrue);
        currentWindow.on('unmaximize', setFalse);
        return _ => {
            currentWindow.off('maximize', setTrue);
            currentWindow.off('unmaximize', setFalse);
        }
    }, []);


    return [windowMaximize, setWindowMaximize];
}

export default function FrameBar() {
    let [windowMaximize, setWindowMaximize] = useWindowMaximize();
    const currentWindow = remote.getCurrentWindow();
    return (
        <header className="frame-bar">
            <div role="frame-bar-menu">
                <button tabIndex='-1' className="button button-alpha unfocusable">one</button>
                <button tabIndex='-1' className="button button-alpha unfocusable">two</button>
            </div>
            <div role="os-menu">

                {/* minimize button */}
                <button
                    onClick={_ => currentWindow.minimize()}
                    tabIndex='-1'
                    className="button button-alpha unfocusable">
                    <MinusOutlined />
                </button>

                {/* maximize button */}
                {
                    !windowMaximize
                        ?
                        <button
                            onClick={_ => setWindowMaximize(true)}
                            tabIndex='-1'
                            className="button button-alpha unfocusable"
                        >
                            <BorderOutlined style={{

                            }} />
                        </button>
                        :
                        <button
                            onClick={_ => setWindowMaximize(false)}
                            tabIndex='-1'
                            className="button button-alpha unfocusable"
                        >
                            <BlockOutlined />
                        </button>
                }

                {/* close button */}
                <button
                    onClick={_ => currentWindow.close()}
                    tabIndex='-1'
                    className="button button-alpha unfocusable"
                >
                    <CloseOutlined />
                </button>
            </div>
        </header>
    )
}