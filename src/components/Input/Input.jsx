import React from 'react';

const Input = ({
    value,
    onChange,
    s,
    l,
    ...others
}) => {

    let className = 'input';
    if (s) {
        className += ' input-size-small'
    } else if (l) {
        className += ' input-size-large'
    }

    return (
        <div className={className}>
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