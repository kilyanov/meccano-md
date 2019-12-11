import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../../Shared/ConfirmModal/ConfirmModal";
import InputText from "../../../Form/InputText/InputText";
import {FIELD_TYPE} from "../../../../constants/FieldType";
import Select from "../../../Form/Select/Select";
import Form from "../../../Form/Form/Form";
import {ProjectService} from "../../../../services";
import {Notify} from "../../../../helpers";
import Loader from "../../../Shared/Loader/Loader";

const cls = new Bem('create-field-modal');

export default class CreateFieldModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onCreateField: PropTypes.func.isRequired,
        onEditField: PropTypes.func.isRequired,
        fieldId: PropTypes.string,
    };

    state = {
        form: {
            name: '',
            slug: '',
            type: ''
        },
        inProgress: !!this.props.fieldId
    };

    componentDidMount() {
        if (this.props.fieldId) {
            ProjectService.field.get(this.props.fieldId)
                .then(response => {
                    this.setState({
                        form: response.data,
                        inProgress: false
                    });
                })
                .catch(() => this.setState({inProgress: false}));
        }
    }

    handleChangeForm = (prop, value) => {
        this.setState(({form}) => form[prop] = value);
    };

    handleSubmit = () => {
        const {fieldId} = this.props;
        const {form} = this.state;
        const isEdit = !!fieldId;
        const method = isEdit ? 'update' : 'create';

        this.setState({inProgress: true}, () => {
            ProjectService.field[method](form, fieldId)
                .then(response => {
                    Notify.success(
                        `Поле успешно ${isEdit ? 'Изменено' : 'Создано'}`,
                        `${isEdit ? 'Редактирование' : 'Создание'} поля`
                    );
                    this.setState({
                        form: response.data,
                        inProgress: false
                    });

                    this.props[isEdit ? 'onEditField' : 'onCreateField'](response.data);
                    this.props.onClose();
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    fieldTypes = Object.keys(FIELD_TYPE).map(key => ({name: key, value: FIELD_TYPE[key]}));

    render() {
        const {onClose, fieldId} = this.props;
        const {form, inProgress} = this.state;
        const isEdit = !!fieldId;

        return (
            <ConfirmModal
                {...cls()}
                title={`${isEdit ? 'Редактирование' : 'Создание'} поля`}
                onClose={onClose}
                submitText='Сохранить'
                onSubmit={() => this.form.submit()}
            >
                <Form ref={ref => this.form = ref} onSubmit={this.handleSubmit}>
                    <InputText
                        {...cls('field')}
                        label='Название *'
                        value={form.name}
                        onChange={value => this.handleChangeForm('name', value)}
                        required
                    />
                    <Select
                        {...cls('field')}
                        label='Тип поля *'
                        options={this.fieldTypes}
                        selected={this.fieldTypes.find(({value}) => value === form.type)}
                        onChange={({value}) => this.handleChangeForm('type', value)}
                        required
                        fixedPosList
                    />
                    <InputText
                        {...cls('field')}
                        label='Код'
                        value={form.slug}
                        onChange={value => this.handleChangeForm('slug', value)}
                    />
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
