import React from 'react';
import Dialog from "@/components/Dialog";

import { M } from '../transforms';

const MatchPickerDialog = ({ visible, setVisible, onSelect, onApply }) => {

    return (
        <Dialog fullW visible={visible} setVisible={setVisible}>
            <div className="dialog-select-transform">
                {
                    M.map((match, i) => (
                        <div className="dialog-select-transform-option" onClick={_ => onApply(i)} key={i}>
                            <div></div>
                            <h6>{match.title}</h6>
                            <p>{match.desc}</p>
                        </div>
                    ))
                }
            </div>
        </Dialog>
    )
};

export default MatchPickerDialog;