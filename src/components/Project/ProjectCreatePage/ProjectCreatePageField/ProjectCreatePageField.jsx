import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import Select from '../../../Form/Select/Select';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';
import InputTags from '../../../Form/InputTags/InputTags';
import InputTime from '../../../Form/InputTime/InputTime';
import {FIELD_TYPE} from '../../../../constants/FieldType';

const cls = new Bem('article-create-page');
const ProjectCreateField = ({field, value, onChange, className}) => {
    switch (field.type) {
        case FIELD_TYPE.ARRAY:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputTags
                    label={field.name}
                    tags={field.tags}
                    suggestions={field.suggestions}
                    onChange={val => onChange(val, field.code)}
                    /* eslint-disable-next-line */
                    // onSearch={field.onSearch}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                />
            </div>;
        case FIELD_TYPE.UUID:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    onChange={val => onChange(val, field.code)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    depended={field.depended}
                    withSearch
                />
            </div>;
        case FIELD_TYPE.UUID_EXT:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value}
                    onChange={val => onChange(val, field.code)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    depended={field.depended}
                    withSearch
                    canAddNewValue
                />
            </div>;
        case FIELD_TYPE.URL:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputLink
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case FIELD_TYPE.FLOAT:
        case FIELD_TYPE.INT:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputNumber
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case FIELD_TYPE.DATETIME:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case FIELD_TYPE.DATE:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case FIELD_TYPE.TIME:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputTime
                    label={field.name}
                    value={value}
                />
            </div>;
        case FIELD_TYPE.TEXT:
        default:
            return <div {...cls('field', [field.code, field.type], className)} data-id={field.code}>
                <InputText
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
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
