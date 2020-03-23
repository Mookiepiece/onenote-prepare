import React from 'react';
import Dialog from "@/components/Dialog";

import M from '../transforms';

const DialogMatchPicker = ({ visible, setVisible, onSelect, onApply }) => {


    return (
        <Dialog visible={visible} setVisible={setVisible}>
            <div className="dialog-select-transform">
                {
                    M.map((m, i) => (<MatchCard key={i} match={m} onClick={_ => onApply(i)} />))
                }
            </div>
        </Dialog>
    )
};

const MatchCard = ({ match, onClick }) => {
    return (
        <div className="dialog-select-transform-option" onClick={onClick}>
            <div></div>
            <h6>{match.title}</h6>
            <p>{match.desc}</p>
        </div>
    )
}

export default DialogMatchPicker;