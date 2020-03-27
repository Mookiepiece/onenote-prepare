import React from 'react';

const Switch = ({
    value,
    onChange,
    activeColor,
    inactiveColor,
    reversed = false,
    disabled = false
}) => {

    let style = {};
    activeColor && (style = { '--active-color': activeColor });
    inactiveColor && (style = { '--inactive-color': inactiveColor });

    return (
        <div
            className={`switch ${reversed ? 'reversed' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={_ => !disabled && onChange(!value)}
        >
            <input type="checkbox" value={value} onChange={onChange} />
            <div className={value ? 'switch-active' : 'switch-inactive'} style={style}></div>
        </div >
    )
}

export default Switch;