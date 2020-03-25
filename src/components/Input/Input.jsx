import React from 'react';

const Input = ({
    value,
    onChange,
    ...others
}) => {

    return (
        <div className="input">
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                {...others}
            />
            <span></span>
        </div>
    )
}

export default Input;