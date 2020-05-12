import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import Input from '@/components/Input';
import { SLATE_DEFAULTS, fontFamilyOptions, fontSizeOptions } from '@/utils/userSettings';
import { DropdownButtonSelect } from '@/components/DropdownButton';
import './style.scss';

import AJAX from '@/utils/ajax';
import Button from '@/components/MkButton';
import Dialog from '@/components/Dialog';
import { remote, shell } from 'electron';
import { LinkOutlined } from '@ant-design/icons';

const Settings = _ => {
    const [slateFontFamily, _setSlateFontFamily] = useState(SLATE_DEFAULTS.FONT_FAMILY);
    const setSlateFontFamily = v => { _setSlateFontFamily(v); SLATE_DEFAULTS.FONT_FAMILY = v; };
    const [slateFontSize, _setSlateFontSize] = useState(SLATE_DEFAULTS.FONT_SIZE);
    const setSlateFontSize = v => { _setSlateFontSize(v); SLATE_DEFAULTS.FONT_SIZE = v; };

    return (
        <div className="page-settings">
            <p>编辑器</p>
            <div className="form-like">
                <span></span>
                <div className="form-like">
                    <span>默认字体</span>
                    <div>
                        <DropdownButtonSelect
                            value={slateFontFamily}
                            width={120}
                            renderLabel={({ value, label }) => (<span style={{ fontFamily: value }}>{label}</span>)}
                            options={
                                fontFamilyOptions.map(v => ({
                                    label: SLATE_DEFAULTS.FONT_FAMILY === v ? v + ' (默认)' : v,
                                    value: v
                                }))
                            }
                            onChange={setSlateFontFamily}
                        />
                    </div>
                    <span>默认字号</span>
                    <div>
                        <DropdownButtonSelect
                            value={slateFontSize}
                            width={120}
                            renderLabel={({ value, label }) => (<span>{label}</span>)}
                            options={
                                fontSizeOptions.map(v => ({
                                    label: SLATE_DEFAULTS.FONT_SIZE === v ? v + ' (默认)' : v,
                                    value: v
                                }))
                            }
                            onChange={setSlateFontSize}
                        />
                    </div>
                </div>
            </div>
            <p>软件信息</p>
            <InfoPanel />
        </div>
    );
}

const InfoPanel = () => {
    return (
        <div className="form-like">
            <span></span>
            <VersionButton />
            <span></span>
            <FeedbackButton />
            <span></span>
            <div>
                <Button
                    onClick={_ => shell.openExternal('http://www.whiteswallow.ink/preonenote/docs')}
                >前往pre-onenote官网<LinkOutlined /></Button>
            </div>
            <span></span>
            <div>
                <Button
                    onClick={_ => shell.openExternal('https://www.github.com/Mookiepiece/pre-onenote')}
                >前往github项目<LinkOutlined /></Button>
            </div>
        </div>
    )
}

var version = remote.app.getVersion();
const VersionButton = () => {
    const [value, setValue] = useState({ status: 'ready', result: '' });
    const [message, setMessage] = useState(`当前版本${version}`);

    let versionButton;
    switch (value.status) {
        case 'ready':
            versionButton = (
                <Button onClick={_ => {
                    setValue({ status: 'pending', result:'' });
                    AJAX.version()
                        .then(result => {
                            setValue({ status: 'resolved', result });
                            setMessage(`当前版本${version},最新版本${result}`);
                        })
                        .catch(e => setValue({ status: 'rejected', result: '' }))
                }}>检查版本</Button>
            );
            break;
        case 'pending':
            versionButton = (<Button disabled>检查中...</Button>);
            break;
        case 'resolved':
            if (version === value.result) {
                versionButton = (<Button disabled>版本最新</Button>);
            } else {
                versionButton = (<Button onClick={_ => {
                    shell.openExternal('http://www.whiteswallow.ink/preonenote/docs');
                }}>下载新版<LinkOutlined /></Button>);
            }
            break;
        case 'rejected':
            versionButton = (<Button disabled>网络错误</Button>);
            break;
        default:
            throw new Error('[ajax] ?');
    }

    return (
        <div style={{ display: 'flex' }}>
            {versionButton}
            <p>{message}</p>
        </div>
    );
}

const FeedbackButton = () => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const [button, setButton] = useState({ text: '提交', posting: false });

    return (
        <div>
            <Button onClick={_ => setVisible(true)}>意见反馈</Button>
            <Dialog visible={visible} setVisible={setVisible}>
                <div>
                    <p>意见反馈</p>
                    <div className='form-like'>
                        <span>主题</span>
                        <Input value={title} onChange={setTitle} maxLength={50} />
                        <span>描述</span>
                        <Input value={desc} onChange={setDesc} maxLength={200} />
                    </div>
                    <Button
                        full
                        disabled={button.posting || (title.trim() === '' && desc.trim() === '')}
                        onClick={_ => {
                            setButton({ text: '提交中...', posting: true });
                            AJAX.feedback(title, desc).then(_ => {
                                setVisible(false);
                                setButton({ text: '提交', posting: false });
                            }
                            ).catch(_ => {
                                setButton({ text: '提交失败', posting: false });
                            });
                        }}>{button.text}</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default Settings;