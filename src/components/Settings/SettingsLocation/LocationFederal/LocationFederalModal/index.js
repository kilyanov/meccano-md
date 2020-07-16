import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {LocationService} from "../../../../../services";
import {NotificationManager} from "react-notifications";
import Form from "../../../../Form/Form/Form";
import InputText from "../../../../Form/InputText/InputText";
import Select from "../../../../Form/Select/Select";
import Loader from "../../../../Shared/Loader/Loader";
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import { isAccess } from "../../../../../helpers/Tools";
import { PERMISSION } from "../../../../../constants";

const defaultForm = {
    name: '',
    country_id: ''
};

export default class LocationFederalModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired
    };

    static defaultProps = {
        onSubmit: () => {}
    }

    state = {
        form: this.props.item || {...defaultForm},
        countryItems: [],
        inProgress: true
    };

    componentDidMount() {
        LocationService.country.get()
            .then(countryResponse => {
                this.setState({
                    countryItems: countryResponse.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            });
    }

    handleChangeForm = (value, prop) => {
        this.setState(prev => prev.form[prop] = value);
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, 'name', 'country_id');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({inProgress: true}, () => {
            LocationService.federal[method](requestForm, form.id)
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

    canEdit = isAccess(PERMISSION.editSettings);

    render() {
        const { form, inProgress, countryItems } = this.state;
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                width='small'
                onClose={this.props.onClose}
                onSubmit={() => this.form.submit()}
                submitDisabled={!this.canEdit}
            >
                <Form
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                    validate
                >
                    <InputText
                        autoFocus
                        required
                        label='Название'
                        value={form.name}
                        onChange={value => this.handleChangeForm(value, 'name')}
                        disabled={!this.canEdit}
                    />

                    <Select
                        label='Страна'
                        required
                        options={countryItems}
                        selected={selectedCountry}
                        onChange={({value}) => this.handleChangeForm(value, 'country_id')}
                        fixedPosList
                        disabled={!this.canEdit}
                    />
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
