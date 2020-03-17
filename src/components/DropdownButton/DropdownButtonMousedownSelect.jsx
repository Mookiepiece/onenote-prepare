import React, { useState } from 'react';

import Button from '@/components/MkButton';
import DropdownButtonMousedown from './DropdownButtonMousedown';

const DropdownButtonMousedownSelect = ({
    options = [],
    action,
    renderLabel = ({ label }) => (<span>{label}</span>),
    ...others
}) => {
    const [active, setActive] = useState(false)
    return (
        <DropdownButtonMousedown
            active={active}
            setActive={_=>setActive(_)}

            {...others}

            renderDropdown={
                setPanelActive => options.map((option) => (
                    <Button
                        full
                        key={option.value}
                        onMouseDown={
                            event => {
                                event.preventDefault();
                                action(option.value);
                                setPanelActive(false);
                            }
                        }
                    >{renderLabel(option)}</Button>
                ))
            }
        />)
}

export default DropdownButtonMousedownSelect;