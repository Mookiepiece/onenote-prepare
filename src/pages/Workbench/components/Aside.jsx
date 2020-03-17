import React, { useState } from 'react';
import Button from "@/components/MkButton";
import Dialog from "@/components/Dialog";
const Aside = () => {
    const [dialogVisible,setDialogVisible] = useState();

    return (
        <aside>
            <Button full onClick={_=>setDialogVisible(true)}>add rule</Button>
            <Dialog visible={dialogVisible} setVisible={setDialogVisible}>
                <p>helolo</p>
            </Dialog>
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