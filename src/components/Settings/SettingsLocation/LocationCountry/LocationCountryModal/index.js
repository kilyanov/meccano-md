import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Form from "../../../../Form/Form/Form";
import InputText from "../../../../Form/InputText/InputText";
import Loader from "../../../../Shared/Loader/Loader";
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import {NotificationManager} from "react-notifications";
import {LocationService} from "../../../../../services";

const defaultForm = {name: ''};

export default class LocationCountryModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired
    };

    static defaultProps = {
        onSubmit: () => {}
    }

    state = {
        form: this.props.item || {...defaultForm},
        inProgress: false
    };

    handleChangeInput = (value) => {
        this.setState(prev => prev.form.name = value);
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = form;

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({inProgress: true}, () => {
            LocationService.country[method](requestForm, form.id)
                .then(response => {
                    NotificationManager.success('Успешно сохранено', 'Сохранено');
                    this.setState({
                        form: {...defaultForm},
                        inProgress: false
                    }, () => {
                        this.props.onSubmit(response);
                        this.props.onClose();
                    });
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    render() {
        const { form, inProgress } = this.state;

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                width='small'
                onClose={this.props.onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form
                    validate
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                >
                    <InputText
                        label='Название'
                        value={form.name}
                        onChange={this.handleChangeInput}
                        autoFocus
                        required
                    />
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
