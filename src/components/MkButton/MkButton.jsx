import React from 'react';

const MkButton = React.forwardRef(({
    className = "",
    type = "default",
    active,
    unfocusable,
    full,
    children,
    size = "small",
    ...others
}, ref) => {
    className = className + ' ' + "mk-button";

    if (active) {
        className += ' ' + "active";
    }
    if (unfocusable) {
        className += ' ' + "unfocusable";
    }
    if (full) {
        className += ' ' + "mk-button-fullwidth";
    }

    className += ' ' + (_ => {
        switch (type) {
            case 'alpha':
                return 'mk-button-alpha';
            case 'plain':
                return 'mk-button-plain'
            default:
                return "mk-button-default";
        }
    })();

    className += ' ' + (_ => {
        switch (size) {
            case 'l':
                return 'mk-button-large';
            default:
                return "";
        }
    })();


    return (
        <button ref={ref} className={className} tabIndex={unfocusable ? '-1' : null} {...others}>
            {children}
        </button>
    )
})

export default MkButton;