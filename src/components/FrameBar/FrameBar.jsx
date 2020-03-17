import React, { useState, useEffect } from 'react';
import './style.scss';
import { BlockOutlined, BorderOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons'

import { remote } from 'electron';
import Button from '@/components/MkButton';

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
                <Button type="alpha" unfocusable>one</Button>
                <Button type="alpha" unfocusable>two</Button>
            </div>
            <div role="os-menu">

                {/* minimize button */}
                <Button
                    onClick={_ => currentWindow.minimize()}
                    type="alpha"
                    unfocusable
                >
                    <MinusOutlined />
                </Button>

                {/* maximize button */}
                {
                    !windowMaximize
                        ?
                        <Button
                            onClick={_ => setWindowMaximize(true)}
                            type="alpha"
                            unfocusable
                        >
                            <BorderOutlined style={{

                            }} />
                        </Button>
                        :
                        <Button
                            onClick={_ => setWindowMaximize(false)}
                            type="alpha"
                            unfocusable
                        >
                            <BlockOutlined />
                        </Button>
                }

                {/* close button */}
                <Button
                    onClick={_ => currentWindow.close()}
                    type="alpha"
                    unfocusable
                >
                    <CloseOutlined />
                </Button>
            </div>
        </header>
    )
}