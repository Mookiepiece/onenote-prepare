import React from 'react';

const Switch = ({
    value,
    onChange,
}) => {

    return (
        <div className="switch" onClick={_ => onChange(!value)} >
            <input type="checkbox" value={value} onChange={onChange} />
            <div className={value ? 'switch-active' : 'switch-inactive'} ></div>
        </div >
    )
}

export default Switch;