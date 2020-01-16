import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import Select from '../../../Form/Select/Select';
import InputTags from '../../../Form/InputTags/InputTags';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';
import InputTime from '../../../Form/InputTime/InputTime';
import {FIELD_TYPE} from '../../../../constants/FieldType';

const cls = new Bem('article-create-page');
const ProjectCreateField = ({field, value, onChange, className}) => {
    const filedType = field.type.key;

    switch (filedType) {
        case FIELD_TYPE.ARRAY:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputTags
                    onChange={val => onChange(val, field.slug)}
                    options={field.options || []}
                    placeholder={field.placeholder}
                    label={field.name}
                    value={value}

                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
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
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    onChange={val => onChange(val, field.slug)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    depended={field.depended}
                />
            </div>;
        case FIELD_TYPE.UUID_EXT:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    onChange={val => onChange(val, field.slug)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    depended={field.depended}
                    withSearch
                    canAddNewValue
                />
            </div>;
        case FIELD_TYPE.URL:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputLink
                    label={field.name}
                    onChange={val => onChange(val, field.slug)}
                    value={value || ''}
                />
            </div>;
        case FIELD_TYPE.FLOAT:
        case FIELD_TYPE.INT:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputNumber
                    label={field.name}
                    onChange={val => onChange(val, field.slug)}
                    value={value || ''}
                />
            </div>;
        case FIELD_TYPE.DATETIME:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
                />
            </div>;
        case FIELD_TYPE.DATE:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
                />
            </div>;
        case FIELD_TYPE.TIME:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputTime
                    label={field.name}
                    value={value}
                />
            </div>;
        case FIELD_TYPE.TEXT:
        default:
            return <div {...cls('field', [field.slug, filedType], className)} data-id={field.slug}>
                <InputText
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.slug)}
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
