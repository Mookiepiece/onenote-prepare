import React from 'react';
import { Router, Link, Redirect, createHistory, createMemorySource, LocationProvider } from '@reach/router';

import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';
import Settings from './pages/Settings/Settings';

import './style.scss';

//reach router setup
let source = createMemorySource("/workbench")
let history = createHistory(source);
const Main = ({ children }) => (<div>{children}</div>);
const NavLink = props => (
    <Link
        {...props}
        getProps={({ isCurrent }) => {
            // the object returned here is passed to the
            // anchor element's props
            return {
                className: isCurrent ? "button button-default active" : 'button button-default'
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
                    <NavLink to="/settings">Settings</NavLink>
                </nav>
                <Router>
                    <Main path='/'>
                        <Workbench path='workbench' />
                        <Settings path='settings' />
                    </Main>
                </Router>
            </LocationProvider>
        </>
    )
}

export default App;