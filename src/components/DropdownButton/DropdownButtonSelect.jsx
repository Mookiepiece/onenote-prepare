import React, { useState } from 'react';

import Button from '@/components/MkButton';
import DropdownButton from './DropdownButton';
import './style.scss';

const DropdownButtonSelect = ({
    options = [],
    onChange,
    renderLabel = ({ label }) => (<span>{label}</span>),
    ...others
}) => {
    const [active, setActive] = useState(false)
    return (
        <DropdownButton
            active={active}
            setActive={v => setActive(v)}

            {...others}

            renderDropdown={
                setPanelActive => options.map((option) => (
                    <Button
                        full
                        key={option.value}
                        onMouseDown={
                            event => {
                                event.preventDefault();
                                onChange(option.value);
                                setPanelActive(false);
                            }
                        }
                    >{renderLabel(option)}</Button>
                ))
            }
        />)
}

export default DropdownButtonSelect;