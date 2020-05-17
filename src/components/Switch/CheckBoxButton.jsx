import React from 'react';

import Button from '@/components/Button';

const CheckboxButton = ({
    value,
    onChange,
    children
}) => {


    return (

        <div
            className="checkbox-button"
            onClick={_ => onChange(!value)}
        >
            <input type="checkbox" value={value} onChange={onChange} />
            <Button>
                <div className={value ? 'checkbox-button-active' : 'checkbox-button-inactive'}></div>
                {children}
            </Button>
        </div >
    )
}

export default CheckboxButton;