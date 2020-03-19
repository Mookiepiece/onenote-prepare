import React from 'react';

const Input = ({
    value,
    onChange
}) => {

    return (
        <div className="input">
            <input value={value} onChange={e => {
                onChange(e.target.value);
            }} />
            <span></span>
        </div>
    )
}

export default Input;