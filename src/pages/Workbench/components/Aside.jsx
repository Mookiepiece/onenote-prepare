import React, { useState, useReducer } from 'react';
import Button from "@/components/MkButton";
import Dialog from "@/components/Dialog";
import { Transforms } from 'slate';

// console.log([...Editor.nodes(editor, {
//     at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1])
// })]);

const M = [
    {
        title: "match first ### in every line",
        desc: 'a match to any first ### in every line',
        steps: [
            {
                type: 're',
                el: 'pre',
                func: (editor) => {
                    const children = editor.children;
                    let childrenAlt = [...children];

                    const ranges = [];

                    //递归遍历树
                    const v = (el, path, children, childrenAlt) => {

                        if (!el.text) {
                            if (!el.type || el.type === 'pre') {
                                //pre里面只能有一层span了，故遍历一层拿出text
                                const innerText = el.children.reduce((result, leaf) => result + leaf.text, '');

                                let reIndex = innerText.indexOf('###');
                                if (reIndex > -1) {
                                    ranges.push({
                                        anchor: { path, offset: innerText.indexOf('###') },
                                        focus: { path, offset: innerText.indexOf('###') + 3 },
                                    });
                                }
                            } else {
                                el.children && el.children.forEach((el, index) => v(el, [...path, index], children, childrenAlt));
                            }
                        }
                    };
                    children.forEach((el, index) => v(el, [index], children, childrenAlt));


                    ranges.forEach(at => {
                        Transforms.setNodes(editor, {
                            bling: true,
                        }, { at });
                    });

                    return false;
                },
                un: (editor) => {
                    Transforms.setNodes(editor, {
                        bling: false,
                    }, { at: Editor.range(editor, Editor.edges(editor)[0], Editor.edges(editor)[1]) });
                }
            }
        ]
    },
]

const Aside = () => {
    const [dialogVisible, setDialogVisible] = useState();
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'DELETE':
                state = {
                    ...state,
                    v: [...v].splice(action.index, 1)
                };
            case 'PUSH':
                state = {
                    ...state,
                    v: [...v].push(action.value)
                };
        }
    }, {
        v: []
    });


    return (
        <aside>
            <Button full onClick={_ => setDialogVisible(true)}>add rule</Button>
            <Dialog visible={dialogVisible} setVisible={setDialogVisible}>
                <p>helolo</p>
            </Dialog>
        </aside>
    )
}

const MatchCard = (match) => {

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