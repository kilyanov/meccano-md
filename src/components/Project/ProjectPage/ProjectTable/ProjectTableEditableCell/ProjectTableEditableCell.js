import React, { useCallback, useEffect, useRef, useState } from 'react';
import BEMHelper from 'react-bem-helper';
import ArticleField from '../../../../Article/ArticleField/ArticleField';
import { KEY_CODE } from '../../../../../constants';
import { capitalize } from '../../../../../helpers/Tools';
import './editable-cell.scss';

const cls = new BEMHelper('editable-cell');

const getFieldPropWithoutId = (prop) => {
    let arr = prop.split('_');

    arr = arr.slice(0, arr.length - 1);
    return arr.reduce((acc, curr) => {
        let newAcc = acc;
        newAcc += !newAcc ? curr : capitalize(curr);
        return newAcc;
    }, '');
};

const DISABLED_CELLS = [
    'section_main_id',
    'section_sub_id',
    'section_three_id',
    "createdAt",
    "updatedAt",
    "complete_monitor",
    "complete_analytic",
    "complete_client"
];

const SELECTED_FIELD_TYPES = [
    'uuid',
    'uuidExt'
];

export default function ProjectTableEditableCell({
    field,
    article,
    columnValue,
    roles,
    onChange
    // sections,
    // sectionsTwo,
    // sectionsThree,
}) {
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({ ...article });
    const currentCellRef = useRef(null);

    useEffect(() => {
        const newForm = _.cloneDeep(article);

        if (field.slug?.endsWith('_id')) {
            newForm[field.slug] = newForm[getFieldPropWithoutId(field.slug)]?.id;
        }

        if (field.type?.key === 'array') {
            newForm[field.slug] = newForm[field.slug]
                .map(({ id, name }) => ({ label: name, value: id }));
        }

        setForm(newForm);
    }, [article, field]);

    const handleKeyDown = useCallback((event) => {
        if (event.keyCode === KEY_CODE.enter) {
            event.preventDefault();
            // Ref передается для реализации фокуса следующей ячейки по Enter
            onChange({
                value: form[field.slug],
                prop: field.slug,
                needSave: true,
                ref: currentCellRef.current
            });
            setIsEdit(false);
        }
    }, [form, field]);

    const handleClick = useCallback(() => {
        if (!DISABLED_CELLS.includes(field.slug)) {
            setIsEdit(!isEdit);
        }
    }, []);

    const handleChange = useCallback((val, prop) => {
        setForm({ ...form, [prop]: _.get(val, 'value', val) });

        if (SELECTED_FIELD_TYPES.includes(field.type.key)) {
            onChange({
                value: { id: val.value, name: val.label },
                prop: getFieldPropWithoutId(prop),
                needSave: false
            });
            onChange({
                value: val.value,
                prop,
                needSave: true
            });
            setIsEdit(false);
        }

        if (field.type?.key === 'array') {
            const res = val.map(({ label, value }) => ({ name: label, id: value }));
            setIsEdit(false);
            return onChange({ value: res, prop, needSave: true });
        }
    }, [form]);

    const handleBlur = useCallback(() => {
        setIsEdit(false);
    }, []);

    return (
        <div
            { ...cls('wrap') }
            tabIndex={0}
            onFocus={handleClick}
            onClick={handleClick}
            ref={currentCellRef}
        >
            {isEdit ? (
                <ArticleField
                    field={field}
                    article={form}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    roles={roles}
                    onlyValue
                    autoFocus
                />
            ) : (
                <span { ...cls('text') }>
                    {columnValue}
                </span>
            )}
        </div>
    );
}
