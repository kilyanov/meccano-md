import React, { useState } from 'react';
import BEMHelper from "react-bem-helper";
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import ColorPicker from "rc-color-picker";

const cls = new BEMHelper('key-word-colors');
const items = [
    {
        label: ''
    }
];

export default function ProjectKeyWordColors({ projectId, onClose }) {
    const [ colors, setColors ] = useState({});
    const renderItem = (item) => (
        <div { ...cls('item') }>
            <div { ...cls('label') }>{ item.label }</div>
            <div { ...cls('value') }>
                <ColorPicker
                    {...cls('item-field')}
                    color={colors[item.key] && colors[item.key].color || ''}
                    defaultColor='#ffffff'
                    alpha={colors[item.key] && colors[item.key].alpha || 100}
                    mode='RGB'
                    onChange={value => this.handleSetColor(value, item.key)}
                    onClose={() => this.handleSubmit(item.key)}
                />
            </div>
        </div>
    );

    return (
        <ConfirmModal
            title='Цветовое выделение ключевых слов'
            onClose={onClose}

        >
            <section { ...cls('section') }>
                <div { ...cls('item') }>
                    <div { ...cls('label') }></div>
                    <div { ...cls('value') }>
                        <ColorPicker
                            {...cls('item-field')}
                            color={colors[key] && colors[key].color || ''}
                            defaultColor='#ffffff'
                            alpha={colors[key] && colors[key].alpha || 100}
                            mode='RGB'
                            onChange={value => this.handleSetColor(value, key)}
                            onClose={() => this.handleSubmit(key)}
                        />
                    </div>
                </div>
            </section>
            <section { ...cls('section') }>

            </section>
            <section { ...cls('section') }>

            </section>
        </ConfirmModal>
    )
}
