

import React from 'react';
import { render } from 'react-dom';
import App from '@/App.jsx';
import '@/styles/default.scss';
import {remote} from 'electron';

window.onload = _ => render(
    React.createElement(App),
    document.getElementById('app')
);

window.D={
    reloadIgnoringCache(){
        remote.getCurrentWindow().webContents.reloadIgnoringCache();
    }
}