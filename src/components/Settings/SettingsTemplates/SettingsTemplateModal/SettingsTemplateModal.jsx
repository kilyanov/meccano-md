import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../Shared/ConfirmModal/ConfirmModal';
import InputText from '../../../Form/InputText/InputText';
import Select from '../../../Form/Select/Select';

const cls = new Bem('settings-template-modal');
const types = [
    {name: 'HTML', value: 'html'},
    {name: 'EXCEL', value: 'xlsx'},
    {name: 'WORD', value: 'docx'}
];

export default class SettingsTemplateModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        let form = {name: '', type: null};

        if (props.item) {
            form = {
                ...props.item,
                type: types.find(({value}) => value === props.item.type.toLowerCase())
            };
        }

        this.state = {
            form
        };
    }

    handleSubmit = () => {
        const form = {...this.state.form};

        if (form.type) form.type = form.type.value;

        this.props.onSubmit(form);
        this.props.onClose();
    };

    handelChangeForm = (value, type) => {
        this.setState(prev => prev.form[type] = value);
    };

    render() {
        const {onClose} = this.props;
        const {form} = this.state;

        return (
            <ConfirmModal
                title={this.props.item ? 'Изменить' : 'Добавить'}
                width={'wide'}
                onClose={onClose}
                onSubmit={this.handleSubmit}
            >
                <div {...cls('row', '', 'row')}>
                    <InputText
                        {...cls('field', 'name', 'col-md-6')}
                        autoFocus
                        label='Нзвание'
                        value={form.name}
                        onChange={value => this.handelChangeForm(value, 'name')}
                    />

                    <Select
                        {...cls('field', 'type', 'col-md-6')}
                        label='Тип'
                        fixedPosList
                        options={types}
                        onChange={value => this.handelChangeForm(value, 'type')}
                        selected={form.type || {}}
                    />
                </div>

                <h4>Поля</h4>
            </ConfirmModal>
        );
    }
}
