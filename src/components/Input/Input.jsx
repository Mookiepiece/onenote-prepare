import React from 'react';

const Input = React.forwardRef(({
    value,
    onChange,
    full = false,
    onEnterKey,
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
        <div className={className}>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                {...others}
                onKeyDown={onKeyDown}
                ref={ref}
            />
        </div>
    )
})

export default Input;