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

const cls = new Bem('article-page');

const ProjectCreateField = ({
    field,
    value,
    onChange,
    onBlur,
    onKeyDown,
    className,
    isHidden,
    onlyValue,
    autoFocus
}) => {
    const filedType = field.type.key;

    if (isHidden) return <div {...cls('hidden-field')} data-id={field.slug} />;

    switch (filedType) {
        case FIELD_TYPE.ARRAY:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
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
                        draggable={!onlyValue}
                        onlyValue={onlyValue}
                        autoFocus={autoFocus}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.UUID:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
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
                            draggable={!onlyValue}
                            canCreate={false}
                            autoFocus={autoFocus}
                            onBlur={onBlur}
                            onlyValue={onlyValue}
                            onKeyDown={onKeyDown}
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
                            draggable={!onlyValue}
                            autoFocus={autoFocus}
                            onBlur={onBlur}
                            onKeyDown={onKeyDown}
                        />
                    )}
                </Wrapper>
            );
        case FIELD_TYPE.UUID_EXT:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <AsyncCreatableSelect
                        placeholder={field.placeholder}
                        label={field.name}
                        options={field.options || []}
                        selected={value}
                        fieldKey={field.slug}
                        readOnly={field.readOnly}
                        onChange={val => onChange(val, field.slug)}
                        onBlur={onBlur}
                        requestService={field.requestService}
                        requestCancelService={field.requestCancelService}
                        depended={field.depended}
                        isDisabled={field.readOnly}
                        required={field.required}
                        editable={field.editable}
                        draggable={!onlyValue}
                        onlyValue={onlyValue}
                        autoFocus={autoFocus}
                        canCreate
                        onKeyDown={onKeyDown}
                        onCreateOption={field?.onCreateOption}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.SELECT:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <Select
                        placeholder={field.placeholder}
                        label={field.name}
                        options={field.options || []}
                        selected={value}
                        readOnly={field.readOnly}
                        onChange={val => onChange(val, field.slug)}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.URL:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputLink
                        label={field.name}
                        readOnly={field.readOnly}
                        onChange={val => onChange(val, field.slug)}
                        value={value || ''}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.FLOAT:
        case FIELD_TYPE.INT:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputNumber
                        label={field.name}
                        readOnly={field.readOnly}
                        onChange={val => onChange(+val, field.slug)}
                        value={value || ''}
                        onlyValue={onlyValue}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                        onBlur={onBlur}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.DATETIME:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputDateTimePicker
                        label={field.name}
                        readOnly={field.readOnly}
                        value={value || ''}
                        onChange={val => onChange(val, field.slug)}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.DATE:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputDatePicker
                        label={field.name}
                        readOnly={field.readOnly}
                        value={value || ''}
                        onChange={val => onChange(val, field.slug)}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.TIME:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputTime
                        label={field.name}
                        readOnly={field.readOnly}
                        value={value}
                        required={field.required}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
        case FIELD_TYPE.TEXT:
        default:
            return (
                <Wrapper
                    field={field}
                    onlyValue={onlyValue}
                    className={className}
                >
                    <InputText
                        label={field.name}
                        readOnly={field.readOnly}
                        value={value || ''}
                        onChange={val => onChange(val, field.slug)}
                        onBlur={onBlur}
                        required={field.required}
                        onlyValue={onlyValue}
                        draggable={!onlyValue}
                        autoFocus={autoFocus}
                        onKeyDown={onKeyDown}
                    />
                </Wrapper>
            );
    }
};

ProjectCreateField.propTypes = {
    className: PropTypes.string,
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
};

export default ProjectCreateField;

const Wrapper = ({ children, field, onlyValue, className }) => {
    const filedType = field.type.key;
    return (
        <div
            {...cls('field', [field.slug, filedType, onlyValue && 'only-value'], className)}
            data-id={field.slug}
        >
            {children}
        </div>
    );
};
