import React from 'react';
import { Router, Link, Redirect, createHistory, createMemorySource, LocationProvider } from '@reach/router';
import {
    TranslationOutlined,
    ScheduleOutlined,
    SettingOutlined
} from '@ant-design/icons'


import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';
import Settings from './pages/Settings/Settings';
import StyleCollection from './pages/StyleCollection/StyleCollection';
import logo from '@/images/logo.png';

import './style.scss';

//reach router setup
let source = createMemorySource("/workbench")
let history = createHistory(source);
const Main = ({ children }) => (<div className="app">{children}</div>);
const NavLink = props => (
    <Link
        {...props}
        getProps={({ isCurrent }) => {
            // the object returned here is passed to the
            // anchor element's props
            return {
                className: isCurrent ? "mk-button mk-button-default router-active" : 'mk-button mk-button-default'
            };
        }}
    />
);

const App = () => {

    return (
        <>
            <LocationProvider history={history}>
                <FrameBar />
                <img src={logo} className="app-logo" />
                <nav>
                    <NavLink to="/workbench"><TranslationOutlined /></NavLink>
                    <NavLink to="/styles"><ScheduleOutlined /></NavLink>
                    <NavLink to="/settings"><SettingOutlined /></NavLink>
                </nav>
                <Router>
                    <Main path='/'>
                        <Workbench path='workbench' />
                        <StyleCollection path='styles' />
                        <Settings path='settings' />
                    </Main>
                </Router>
            </LocationProvider>
        </>
    )
}

export default App;