import React, { useState, useContext } from 'react';
import {
    TranslationOutlined,
    ScheduleOutlined,
    SettingOutlined,
    AppstoreOutlined
} from '@ant-design/icons';

import store from './redux';
import { Provider } from 'react-redux';

import FrameBar from './components/FrameBar/FrameBar';
import Workbench from './pages/Workbench/Workbench';
import StyleCollection from './pages/StyleCollection/StyleCollection';
import Toolbox from './pages/Toolbox/Toolbox';
import Settings from './pages/Settings/Settings';

import logo from '@/images/logo.png';

import './style.scss';

const routerContext = React.createContext(0);

export const useRouterContext = _ => {
    return useContext(routerContext);
}

const NavLink = ({ index, children }) => {
    const [routerValue, setRouterValue] = useRouterContext();
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
    const [routerValue] = useRouterContext();
    const isCurrent = routerValue === index;
    return (
        <div className="page" style={{ display: isCurrent ? '' : 'none' }}>{children}</div>
    )
}

const RouterProvider = ({ children }) => {
    // https://zhuanlan.zhihu.com/p/50336226

    const useRouterValueState = useState(0);

    return (
        <Provider store={store}>
            <routerContext.Provider value={useRouterValueState}>
                {children}
            </routerContext.Provider>
        </Provider>
    )
}

const App = () => {
    return (
        <>
            <RouterProvider>
                <FrameBar />
                <img src={logo} className="app-logo" />
                <nav>
                    <NavLink index={0} ><TranslationOutlined /></NavLink>
                    <NavLink index={1} ><ScheduleOutlined /></NavLink>
                    <NavLink index={2} ><AppstoreOutlined /></NavLink>
                    <NavLink index={3} ><SettingOutlined /></NavLink>
                </nav>
                <Page index={0}>
                    <Workbench />
                </Page>
                <Page index={1}>
                    <StyleCollection />
                </Page>
                <Page index={2}>
                    <Toolbox />
                </Page>
                <Page index={3}>
                    <Settings />
                </Page>
            </RouterProvider>
        </>
    )
}

// const routerTitleMap = new Map([
//     [0, '工作台'],
//     [1, '样式'],
//     [2, '工具箱'],
//     [3, '设置'],
// ])

// function AppTitle() {
//     const [routerValue] = useContext(routerContext);
//     const pageName = routerTitleMap.get(routerValue);

//     return (
//         <div className="app-title">
//             {'preonenote-' + pageName}
//         </div>
//     )
// }

export default App;