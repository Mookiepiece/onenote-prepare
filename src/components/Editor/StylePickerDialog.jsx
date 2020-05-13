import React from 'react';
import Dialog from '@/components/Dialog';

import { customStyles } from '@/utils/userSettings';
import { renderLeaf as Leaf } from '@/components/Editor/createEditor';

const StylePickerDialog = ({ visible, setVisible, onApply }) => {
    return (
        <Dialog fullWidth visible={visible} setVisible={setVisible}>
            <div className="dialog-style-picker">
                {
                    customStyles.map((leafStyle, i) => (
                        <div className="leaf-style-card" onClick={_ => {
                            onApply(i, customStyles[i]);
                            setVisible(false);
                        }} key={i} >
                            <div>
                                <span>
                                    <Leaf leaf={{
                                        ...leafStyle.style,
                                        fontSize: leafStyle.style.fontSize ?
                                            leafStyle.style.fontSize > 12 ?
                                                Math.floor(12 + 1.2 * Math.sqrt(leafStyle.style.fontSize - 12)) :
                                                leafStyle.style.fontSize
                                            : undefined
                                    }}>文字</Leaf>
                                </span>
                                <span>{leafStyle.style.fontSize ? leafStyle.style.fontSize + 'pt' : ''}</span>
                            </div>
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