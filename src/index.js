import React from 'react';
import { render } from 'react-dom';
import App from './App.jsx';
import "./styles/default.scss";
import { SLATE_DEFAULTS } from './utils/userSettings.js';

window.onload = _ => {
    document.body.addEventListener('dragstart', e => e.preventDefault()); //no drag
    SLATE_DEFAULTS.init();

    render(
        React.createElement(App),
        document.getElementById('app')
    );
}
