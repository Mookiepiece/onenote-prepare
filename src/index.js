import React from 'react';
import { render } from 'react-dom';
import App from './App.jsx';
import "./styles/index.scss";

window.onload = _ => {
    document.body.addEventListener('dragstart', e => e.preventDefault()); //no drag

    render(
        React.createElement(App),
        document.getElementById('app')
    );
}
