import React from 'react';
import Dialog from '@/components/Dialog';

import { customTableStyles } from '@/utils/userSettings';

const TableStylePickerDialog = ({ visible, setVisible, onApply }) => {
    return (
        <Dialog fullW visible={visible} setVisible={setVisible}>
            <div className="dialog-table-style-picker">
                {
                    customTableStyles.map((tableStyle, i) => (
                        <div className="table-style-card" onClick={_ => {
                            onApply(i, customTableStyles[i]);
                            setVisible(false);
                        }} key={i} >
                            <div>
                                <img src={tableStyle.image} />
                            </div>
                            <h6>{tableStyle.title}</h6>
                            <p>{tableStyle.group}</p>
                        </div>
                    ))
                }
            </div>
        </Dialog>
    )
};

export default TableStylePickerDialog;