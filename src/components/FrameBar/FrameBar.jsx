import React, { useState, useEffect } from 'react';
import './style.scss';
import { BlockOutlined, BorderOutlined, CloseOutlined, MinusOutlined } from '@ant-design/icons'

import { remote } from 'electron';
import Button from '@/components/Button';

let currentWindow = remote.getCurrentWindow();

function useWindowMaximize() {
    let [windowMaximize, _setWindowMaximize] = useState(currentWindow.isMaximized());

    const setWindowMaximize = (bool) => {
        if (bool) {
            currentWindow.maximize();
            _setWindowMaximize(true);
            document.documentElement.style.setProperty('--frame-bar-drag-place', '0');
        } else {
            currentWindow.unmaximize();
            _setWindowMaximize(false);
            document.documentElement.style.setProperty('--frame-bar-drag-place', '4px');
        }
    }

    const handleMaximize = _ => {
        _setWindowMaximize(true);
        document.documentElement.style.setProperty('--frame-bar-drag-place', '0');
    };
    const handleUnmaximize = _ => {
        _setWindowMaximize(false);
        document.documentElement.style.setProperty('--frame-bar-drag-place', '4px');
    };

    useEffect(_ => {
        currentWindow.on('maximize', handleMaximize);
        currentWindow.on('unmaximize', handleUnmaximize);
        if (currentWindow.isMaximized()) {
            document.documentElement.style.setProperty('--frame-bar-drag-place', '0');
        } else {
            document.documentElement.style.setProperty('--frame-bar-drag-place', '4px');
        }
        return _ => {
            currentWindow.off('maximize', handleMaximize);
            currentWindow.off('unmaximize', handleUnmaximize);
        }
    }, []);


    return [windowMaximize, setWindowMaximize];
}

export default function FrameBar() {
    let [windowMaximize, setWindowMaximize] = useWindowMaximize();
    const currentWindow = remote.getCurrentWindow();
    return (
        <header className="frame-bar">
            <div className="frame-bar-drag-place"></div>
            <div className="frame-bar-no-drag-place"></div>
            <div role="os-menu">

                {/* minimize button */}
                <Button
                    onClick={_ => currentWindow.minimize()}
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
                            unfocusable
                        >
                            <BorderOutlined style={{

                            }} />
                        </Button>
                        :
                        <Button
                            onClick={_ => setWindowMaximize(false)}
                            unfocusable
                        >
                            <BlockOutlined />
                        </Button>
                }

                {/* close button */}
                <Button
                    onClick={_ => currentWindow.close()}
                    unfocusable
                >
                    <CloseOutlined />
                </Button>
            </div>
        </header>
    )
}