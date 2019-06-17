import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import Select from '../../../Form/Select/Select';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';
import InputTags from '../../../Form/InputTags/InputTags';
import InputTime from '../../../Form/InputTime/InputTime';

const classes = new Bem('article-create-page');
const ProjectCreateField = ({field, value, onChange, className}) => {
    switch (field.type) {
        case 'array':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
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
        case 'uuid':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={_.isObject(value) ? value : {}}
                    onChange={val => onChange(val, field.code)}
                    requestService={field.requestService}
                    requestCancelService={field.requestCancelService}
                    withSearch
                />
            </div>;
        case 'url':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <InputLink
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case 'float':
        case 'integer':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <InputNumber
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case 'datetime':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case 'date':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case 'time':
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
                <InputTime
                    label={field.name}
                    value={value}
                />
            </div>;
        case 'text':
        default:
            return <div {...classes('field', [field.code, field.type], className)} data-id={field.code}>
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
