import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    NavLink,
    Redirect
} from "react-router-dom";

import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';

export default class App extends React.Component {

    render() {
        return (
            <>
                <FrameBar />
                <Router>
                    <>
                        <nav className="clearfix">
                            <NavLink to="/workbench" className="button button-default">Workbench</NavLink>
                            <NavLink to="/gallery" className="button button-default">Gallery</NavLink>
                            <NavLink to="/toolkit" className="button button-default">Toolkit</NavLink>
                        </nav>
                        <div className="main hahaha">
                            <Switch>
                                <Route path='/workbench'><Workbench /></Route>
                                <Route path='/gallery'>2</Route>
                                <Route path='/Toolkit'>3</Route>
                                <Redirect to='/workbench' />
                            </Switch>
                        </div>
                    </>
                </Router>
            </>
        )
    }
}