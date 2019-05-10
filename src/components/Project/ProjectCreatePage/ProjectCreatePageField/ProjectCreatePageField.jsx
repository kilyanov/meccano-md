import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import Select from '../../../Form/Select/Select';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';

const classes = new Bem('article-create-page');
const ProjectCreateField = ({field, value, onChange, className}) => {
    switch (field.code) {
        case 'date':
            return  <div {...classes('field', field.code, className)}>
                <InputDatePicker
                    label={field.name}
                    value={value || ''}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case 'source_id':
            return <div {...classes('field', field.code, className)}>
                <Select
                    placeholder='Выберите источник...'
                    label={field.name}
                    options={field.options || []}
                    selected={value || []}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
        case 'url':
            return <div {...classes('field', field.code, className)}>
                <InputLink
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case 'rating_id':
        case 'number':
            return <div {...classes('field', field.code, className)}>
                <InputNumber
                    label={field.name}
                    onChange={val => onChange(val, field.code)}
                    value={value || ''}
                />
            </div>;
        case 'authors':
            return  value.map(v => v).join(', ');
        default:
            return <div {...classes('field', field.code, className)}>
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
