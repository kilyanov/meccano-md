import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import InputTags from '../../../Form/InputTags/InputTags';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';
import InputTime from '../../../Form/InputTime/InputTime';
import {FIELD_TYPE} from '@const';
import InputDateTimePicker from "../../../Form/InputDateTimePicker/InputDatePicker";
import AsyncCreatableSelect from "../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect";
import Select from '../../../Form/Select/ReactSelect/ReactSelect';

const cls = new Bem('article-create-page');
const ProjectCreateField = ({field, value, onChange, className, isHidden}) => {
    const filedType = field.type.key;

    if (isHidden) return <div {...cls('hidden-field')} data-id={field.slug} />;

    switch (filedType) {
        case FIELD_TYPE.ARRAY:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputTags
                    onChange={val => onChange(val, field.slug)}
                    options={field.options || []}
                    placeholder={field.placeholder}
                    label={field.name}
                    required={field.required}
                    value={value}
                    readOnly={field.readOnly}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    draggable
                />

                {/*
                <InputTags
                    label={field.name}
                    tags={field.tags}
                    suggestions={field.suggestions}
                    onChange={val => onChange(val, field.slug)}
                    eslint-disable-next-line
                    onSearch={field.onSearch}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                />
                */}

            </div>;
        case FIELD_TYPE.UUID:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                {field.requestService ? (
                    <AsyncCreatableSelect
                        placeholder={field.placeholder}
                        label={field.name}
                        options={field.options || []}
                        selected={value}
                        fieldKey={field.slug}
                        readOnly={field.readOnly}
                        onChange={val => onChange(val, field.slug)}
                        requestService={field.requestService}
                        requestCancelService={field.requestCancelService}
                        depended={field.depended}
                        isDisabled={field.readOnly}
                        required={field.required}
                        draggable
                        canCreate={false}
                    />
                ) : (
                    <Select
                        placeholder={field.placeholder}
                        label={field.name}
                        options={field.options || []}
                        selected={value}
                        readOnly={field.readOnly}
                        disabled={field.disabled}
                        required={field.required}
                        onChange={val => onChange(val, field.slug)}
                        draggable
                    />
                )}
            </div>;
        case FIELD_TYPE.UUID_EXT:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <AsyncCreatableSelect
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    fieldKey={field.slug}
                    readOnly={field.readOnly}
                    onChange={val => onChange(val, field.slug)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    depended={field.depended}
                    isDisabled={field.readOnly}
                    required={field.required}
                    editable={field.editable}
                    draggable
                    canCreate
                    onCreateOption={field?.onCreateOption}
                />
            </div>;
        case FIELD_TYPE.SELECT:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    readOnly={field.readOnly}
                    onChange={val => onChange(val, field.slug)}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.URL:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputLink
                    label={field.name}
                    readOnly={field.readOnly}
                    onChange={val => onChange(val, field.slug)}
                    value={value || ''}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.FLOAT:
        case FIELD_TYPE.INT:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputNumber
                    label={field.name}
                    readOnly={field.readOnly}
                    onChange={val => onChange(val, field.slug)}
                    value={value || ''}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.DATETIME:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputDateTimePicker
                    label={field.name}
                    readOnly={field.readOnly}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.DATE:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputDatePicker
                    label={field.name}
                    readOnly={field.readOnly}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.TIME:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputTime
                    label={field.name}
                    readOnly={field.readOnly}
                    value={value}
                    required={field.required}
                    draggable
                />
            </div>;
        case FIELD_TYPE.TEXT:
        default:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputText
                    label={field.name}
                    readOnly={field.readOnly}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
                    required={field.required}
                    draggable
                />
            </div>;
    }
};

ProjectCreateField.propTypes = {
    className: PropTypes.string,
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
};

export default ProjectCreateField;
