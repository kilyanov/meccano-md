import React, { useEffect, useState } from 'react';
import BEMHelper from "react-bem-helper";
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import ColorPicker from "rc-color-picker";
import { TEMPLATE_TYPE } from "@const/TemplateType";
import { ProjectService } from "@services";
import { NotificationManager } from "react-notifications";
import Loader from "@components/Shared/Loader/Loader";
import './key-word-colors.scss';

const cls = new BEMHelper('key-word-colors');

export default function ProjectKeyWordColors({ projectId, onClose }) {
    const [ colors, setColors ] = useState({});
    const [ inProgress, setInProgress ] = useState(true);

    const handleSetColor = (key, prop, { color }) => {
        setColors(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [`${prop}Color`]: color
            }
        }));
    };
    const handleSubmit = () => {
        setInProgress(true);

        const items = [];

        Object.keys(colors).forEach(key => {
            const colorItem = {
                template: key,
                color_font: colors[key].textColor.replace('#', ''),
                color_fill: colors[key].fillColor.replace('#', '')
            };

            if (colors[key].id) {
                colorItem.id = colors[key].id;
            }

            items.push(colorItem);
        });

        const createItems = items.filter(({ id }) => !id);
        const updateItems = items.filter(({ id }) => !!id);

        if (createItems.length) {
            ProjectService.wordSetting
                .create(projectId, createItems)
                .then(() => NotificationManager.success('Успешно создано', 'Создание выделения цветом'))
                .catch(e => console.log(e))
                .finally(() => setInProgress(false));
        }

        if (updateItems.length) {
            ProjectService.wordSetting
                .update(projectId, updateItems)
                .then(() => NotificationManager.success('Успешно обновлено', 'Обновление выделения цветом'))
                .catch(e => console.log(e))
                .finally(() => setInProgress(false));
        }
    };
    const renderItem = (key) => (
        <section { ...cls('item') } key={key}>
            <p { ...cls('item-title') }>{ key.toUpperCase() }</p>
            <div { ...cls('item-data') }>
                <div { ...cls('label') }>Цвет текста</div>
                <div { ...cls('value') }>
                    <ColorPicker
                        {...cls('item-field')}
                        color={colors[key]?.textColor || ''}
                        enableAlpha={false}
                        defaultColor='#ffffff'
                        alpha={colors[key]?.textAlpha || 100}
                        mode='RGB'
                        onChange={value => handleSetColor(key, 'text', value)}
                    />
                </div>
            </div>
            <div { ...cls('item-data') }>
                <div { ...cls('label') }>Цвет заливки</div>
                <div { ...cls('value') }>
                    <ColorPicker
                        {...cls('item-field')}
                        color={colors[key]?.fillColor || ''}
                        enableAlpha={false}
                        defaultColor='#ffffff'
                        alpha={colors[key]?.fillAlpha || 100}
                        mode='RGB'
                        onChange={value => handleSetColor(key, 'fill', value)}
                    />
                </div>
            </div>
        </section>
    );

    useEffect(() => {
        ProjectService.wordSetting
            .get(projectId)
            .then(response => {
                const result = {};

                response.data.forEach(item => {
                    result[item.template] = {
                        id: item.id,
                        textColor: `#${item.color_font}`,
                        fillColor: `#${item.color_fill}`
                    };
                });

                console.log(result);

                if (result) {
                    setColors(result);
                }
            })
            .finally(() => setInProgress(false));
    }, []);

    return (
        <ConfirmModal
            title='Цветовое выделение ключевых слов'
            onClose={onClose}
            submitText='Сохранить'
            onSubmit={handleSubmit}
        >
            <section { ...cls('section') }>
                {Object.keys(TEMPLATE_TYPE).map(key => renderItem(key))}
            </section>

            {inProgress && <Loader />}
        </ConfirmModal>
    );
}
