import React from 'react';

const Switch = ({
    value,
    onChange,
}) => {

    return (
        <div className="switch">
            <input type="checkbox" value={value} onChange={onChange} />
            <div className={value?'switch-active':'switch-inactive'} onClick={_ => onChange(!value)}></div>
        </div>
    )
}

export default Switch;