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
const defaultColor = '#fff';

export default function ProjectKeyWordColors({ projectId, onClose }) {
    const [ colors, setColors ] = useState({});
    const [ inProgress, setInProgress ] = useState(true);
    const [ hasChanges, setHasChanges ] = useState(false)

    const handleSetColor = (key, prop, { color }) => {
        setColors(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [`color_${prop}`]: color
            }
        }));
        setHasChanges(true);
    };
    const handleSubmit = () => {
        const items = [];

        Object.keys(colors).forEach(key => {
            const colorItem = {
                template: key,
                color_font: colors[key]?.color_font?.replace('#', ''),
                color_fill: colors[key]?.color_fill?.replace('#', '')
            };

            if (colors[key].id) {
                colorItem.id = colors[key].id;
            }

            items.push(colorItem);
        });

        const createItems = items.filter(({ id }) => !id);
        const updateItems = items.filter(({ id }) => !!id);

        if (createItems.length || updateItems.length) {
            setInProgress(true);
        }

        if (createItems.length) {
            ProjectService.wordSetting
                .create(projectId, createItems)
                .then((response) => {
                    const result = prepareData(response.data);

                    setColors(c => ({ ...c, ...result }));
                    NotificationManager.success('Успешно создано', 'Создание выделения цветом');
                })
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
    const handleReset = (key) => {
        const id = colors[key]?.id;

        if (!key || !colors[key] || !id) {
            return;
        }

        setInProgress(true);

        ProjectService.wordSetting
            .delete(projectId, id)
            .then(() => {
                const newColors = { ...colors };

                delete newColors[key];

                if (!Object.keys(newColors).length) {
                    setHasChanges(false);
                }

                setColors(newColors);
            })
            .finally(() => setInProgress(false));
    };
    const renderItem = (key) => (
        <section { ...cls('item') } key={key}>
            <div { ...cls('item-head') }>
                <p { ...cls('item-title') }>{ key.toUpperCase() }</p>
                <button
                    { ...cls('item-button') }
                    disabled={!colors[key]?.id}
                    onClick={() => handleReset(key)}
                >Сброс</button>
            </div>
            <div { ...cls('item-data') }>
                <div { ...cls('label') }>Цвет текста</div>
                <div { ...cls('value') }>
                    <ColorPicker
                        {...cls('item-field')}
                        color={colors[key]?.color_font || defaultColor}
                        enableAlpha={false}
                        defaultColor={defaultColor}
                        mode='RGB'
                        onChange={value => handleSetColor(key, 'font', value)}
                    />
                </div>
            </div>
            <div { ...cls('item-data') }>
                <div { ...cls('label') }>Цвет заливки</div>
                <div { ...cls('value') }>
                    <ColorPicker
                        {...cls('item-field')}
                        color={colors[key]?.color_fill || defaultColor}
                        enableAlpha={false}
                        defaultColor={defaultColor}
                        mode='RGB'
                        onChange={value => handleSetColor(key, 'fill', value)}
                    />
                </div>
            </div>
        </section>
    );
    const prepareData = (data) => {
        const result = {};

        data.forEach(item => {
            result[item.template] = {
                id: item.id,
                color_font: `#${item.color_font || 'fff'}`,
                color_fill: `#${item.color_fill || 'fff'}`
            };
        });

        return result;
    };

    useEffect(() => {
        ProjectService.wordSetting
            .get(projectId)
            .then(response => {
                const result = prepareData(response.data);

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
            submitDisabled={!hasChanges}
        >
            <section { ...cls('section') }>
                {Object.keys(TEMPLATE_TYPE).map(key => renderItem(key))}
            </section>

            {inProgress && <Loader />}
        </ConfirmModal>
    );
}
