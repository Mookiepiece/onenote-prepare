import React, { useState, useContext } from 'react';
import {
    TranslationOutlined,
    ScheduleOutlined,
    SettingOutlined
} from '@ant-design/icons';

import store from './redux';
import { Provider } from 'react-redux';

import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';
import Settings from './pages/Settings/Settings';
import StyleCollection from './pages/StyleCollection/StyleCollection';
import logo from '@/images/logo.png';

import './style.scss';

const routerContext = React.createContext(0);

const NavLink = ({ index, children }) => {
    const [routerValue, setRouterValue] = useContext(routerContext);
    const isCurrent = routerValue === index;
    return (
        <a
            onClick={e => { e.preventDefault(); setRouterValue(index); }}
            className={isCurrent ? "mk-button mk-button-default router-active" : 'mk-button mk-button-default'}
        >
            {children}
        </a>
    );
}

const Page = ({ index, children }) => {
    const [routerValue] = useContext(routerContext);
    const isCurrent = routerValue === index;
    return (
        <div className="page" style={{ display: isCurrent ? '' : 'none' }}>{children}</div>
    )
}

const App = () => {
    const useRouterValueState = useState(0);

    return (
        <>
            <Provider store={store}>
                <routerContext.Provider value={useRouterValueState}>
                    <FrameBar />
                    <img src={logo} className="app-logo" />
                    <nav>
                        <NavLink index={0} ><TranslationOutlined /></NavLink>
                        <NavLink index={1} ><ScheduleOutlined /></NavLink>
                        <NavLink index={2} ><SettingOutlined /></NavLink>
                    </nav>
                    <Page index={0}>
                        <Workbench />
                    </Page>
                    <Page index={1}>
                        <StyleCollection />
                    </Page>
                    <Page index={2}>
                        <Settings />
                    </Page>
                </routerContext.Provider>
            </Provider>
        </>
    )
}

export default App;