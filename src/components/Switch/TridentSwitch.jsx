import React from 'react';

const renderButtonDefault = _ => (null)

const TridentSwitch = ({
    value,
    onChange,
    renderButton = renderButtonDefault
}) => {

    let circleClassName = 'switch-display';
    switch (value[0]) {
        case -1:
            circleClassName += ' switch-negative';
            break;
        case 0:
            circleClassName += ' switch-inactive';
            break;
        case 1:
            circleClassName += ' switch-active';
            break;
    }

    return (
        <div className="switch trident-switch">
            <input value={value} onChange={onChange} />
            <div className="s s1" onClick={_ => onChange(-1)}></div>
            <div className="s s2" onClick={_ => onChange(0)}></div>
            <div className="s s3" onClick={_ => onChange(1)}></div>
            <div className={circleClassName}>
                <div></div>
            </div>
        </div>
    )
}

export default TridentSwitch;