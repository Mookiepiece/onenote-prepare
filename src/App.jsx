import React from 'react';
import { Router, Link, Redirect, createHistory, createMemorySource, LocationProvider } from '@reach/router';

import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';
import Settings from './pages/Settings/Settings';
import StyleCollection from './pages/StyleCollection/StyleCollection';

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
                <nav className="clearfix">
                    <NavLink to="/workbench">Workbench</NavLink>
                    <NavLink to="/styles">StyleCollection</NavLink>
                    <NavLink to="/settings">Settings</NavLink>
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