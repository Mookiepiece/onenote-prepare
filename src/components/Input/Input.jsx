import React, { useEffect, useState } from 'react';

const Input = React.forwardRef(({
    value,
    onChange,
    full = false,
    onEnterKey,
    width,
    maxLength = 20,
    ...others
}, ref) => {
    let className = `input${full ? ' full' : ''}`;

    //merge enter key down (keyCode: 13) to on key down
    let { onKeyDown } = others;
    if (onKeyDown) {
        if (onEnterKey) onKeyDown = e => e.keyCode === 13 ? onEnterKey() : onKeyDown(e);
    } else {
        if (onEnterKey) onKeyDown = e => e.keyCode === 13 && onEnterKey();
    }

    return (
        <div className={className} style={{ width }}>
            <input
                value={value}
                onChange={e => onChange(e.target.value.substr(-maxLength))}
                {...others}
                onKeyDown={onKeyDown}
                ref={ref}
            />
        </div>
    )
})

export const CachedInput = React.forwardRef(({
    value,
    rule,
    onChange,
    full = false,
    width,
    ...others
}, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(_ => {
        setDisplayValue(value.toString());
    }, [value]);

    let className = `input${full ? ' full' : ''}`;

    let applyInput = _ => {
        let result = rule(displayValue);
        if (result !== null) {
            onChange(result);
            setDisplayValue(result.toString());
        }
    }

    let onEnterKey = applyInput;
    //merge enter key down (keyCode: 13) to on key down
    let { onKeyDown } = others;
    if (onKeyDown) {
        if (onEnterKey) onKeyDown = e => e.keyCode === 13 ? onEnterKey() : onKeyDown(e);
    } else {
        if (onEnterKey) onKeyDown = e => e.keyCode === 13 && onEnterKey();
    }

    return (
        <div className={className} style={{ width }}>
            <input
                value={displayValue}
                onChange={e => setDisplayValue(e.target.value)}
                onBlur={applyInput}
                {...others}
                onKeyDown={onKeyDown}
                ref={ref}
            />
        </div>
    )
})

export default Input;