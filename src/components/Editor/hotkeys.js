import isHotkey from 'is-hotkey';
import { toggleBlock, toggleMark, isMarkActive, isBlockActive, getMarkActiveSet, putSelection, getSelection } from './utils';

const HOTKEYS_MARK = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const HOTKEYS_BLOCK = {
    'mod+.': 'bulleted-list',
    'mod+/': 'numbered-list'
};
const higherOrderKeydownHandler = (editor) => {
    return event => {
        for (const hotkey in HOTKEYS_MARK) {
            if (isHotkey(hotkey, event)) {
                event.preventDefault();
                toggleMark(editor, HOTKEYS_MARK[hotkey]);
            }
        }
        for (const hotkey in HOTKEYS_BLOCK) {
            if (isHotkey(hotkey, event)) {
                event.preventDefault();
                toggleBlock(editor, HOTKEYS_BLOCK[hotkey]);
            }
        }
    }
}

export default higherOrderKeydownHandler;