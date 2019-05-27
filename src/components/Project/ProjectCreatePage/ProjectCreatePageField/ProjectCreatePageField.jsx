import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../../../Form/InputText/InputText';
import InputDatePicker from '../../../Form/InputDatePicker/InputDatePicker';
import Select from '../../../Form/Select/Select';
import InputLink from '../../../Form/InputLink/InputLink';
import InputNumber from '../../../Form/InputNumber/InputNumber';
import InputTags from '../../../Form/InputTags/InputTags';

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
        case 'section_main_id':
        case 'section_sub_id':
        case 'section_three_id':
        case 'source_id':
            return <div {...classes('field', field.code, className)}>
                <Select
                    placeholder={field.placeholder}
                    label={field.name}
                    options={field.options || []}
                    selected={value || {}}
                    onChange={val => onChange(val, field.code)}
                    /* eslint-disable-next-line */
                    onSearch={field.onSearch}
                    /* eslint-disable-next-line */
                    onCancelSearch={field.onCancelSearch}
                    withSearch
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
        case 'genre':
            return <div {...classes('field', field.code, className)}>
                <InputTags
                    label={field.name}
                    tags={field.tags}
                    suggestions={field.suggestions}
                    onChange={val => onChange(val, field.code)}
                />
            </div>;
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
