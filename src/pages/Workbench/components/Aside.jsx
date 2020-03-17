import React, { useState } from 'react';
import {Modal, Button} from 'antd';

const Aside = () => {
    const [addDialogVisible,setAddDialogVisible] = useState(false);


    return (
        <aside>
            <Button onClick={_=>setAddDialogVisible(true)} block>modal</Button>
            <Modal
                title="Basic Modal"
                visible={addDialogVisible}
                onOk={_=>setAddDialogVisible(false)}
                onCancel={_=>setAddDialogVisible(false)}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </aside>
    )
}

export default Aside;

// type styleMatch{
//     qsa:String
// }

// type textMatch{
//     re:RegExp
// }

// type match {
//     type:'string'|'style'
//      
// // }

// type transform{

// }