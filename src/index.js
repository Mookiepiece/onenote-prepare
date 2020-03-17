import React from 'react';
import { render } from 'react-dom';
import App from './App.jsx';
import "./styles/default.scss";

window.onload = _ => render(
    React.createElement(App),
    document.getElementById('app')
);