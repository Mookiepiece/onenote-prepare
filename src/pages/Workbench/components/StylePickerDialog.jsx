import React from 'react';
import Dialog from '@/components/Dialog';

import { mockedCustomStyles } from '@/utils/userSettings';

const StylePickerDialog = ({ visible, setVisible, onApply }) => {
    return (
        <Dialog full visible={visible} setVisible={setVisible}>
            <div className="dialog-style-picker">
                {
                    mockedCustomStyles.map((leafStyle, i) => (
                        <div className="leaf-style-card" onClick={_ => {
                            onApply(i, mockedCustomStyles[i]);
                            setVisible(false);
                        }} key={i} >
                            <div></div>
                            <h6>{leafStyle.title}</h6>
                            <p>{leafStyle.group}</p>
                        </div>
                    ))
                }
            </div>
        </Dialog>
    )
};

export default StylePickerDialog;