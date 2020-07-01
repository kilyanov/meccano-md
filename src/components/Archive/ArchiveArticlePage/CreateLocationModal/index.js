import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BEMHelper from "react-bem-helper";
import ConfirmModal from "../../../Shared/ConfirmModal/ConfirmModal";
import Form from "../../../Form/Form/Form";
import InputText from "../../../Form/InputText/InputText";
import Loader from "../../../Shared/Loader/Loader";
import AsyncCreatableSelect from "../../../Form/AsyncCreatebleSelect/AsyncCreateableSelect";
import {LocationService} from "../../../../services";
import {NotificationManager} from "react-notifications";

const cls = new BEMHelper('create-location-modal');

export default class CreateLocationModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    };

    static defaultProps = {
        onSubmit: () => {}
    };

    state = {
        form: {
            city: '',
            selectedRegion: '',
            selectedFederal: null,
            selectedCountry: null
        },
        inProgress: false
    };

    handleChangeForm = (prop, value) => {
        this.setState(state => {
            state.form[prop] = value;

            if (prop === 'selectedFederal') {
                state.form.selectedCountry = null;
            }

            if (prop === 'selectedRegion') {
                state.form.selectedFederal = null;
                state.form.selectedCountry = null;
            }

            return state;
        });
    };

    handleSubmit = () => {
        const { form } = this.state;

        if (!form.city) {
            return NotificationManager.error('Название города не может быть пустым', 'Ошибка');
        }

        if (!form.selectedRegion && !form.selectedFederal && !form.selectedCountry) {
            return NotificationManager.error('Выберите Страну, ФО или Регин', 'Ошибка');
        }

        const requestForm = {
            name: form.city
        };

        requestForm.redion_id = _.get(form, 'selectedRegion.value');
        requestForm.federal_id = _.get(form, 'selectedFederal.value');
        requestForm.country_id = _.get(form, 'selectedCountry.value');

        for (const prop of Object.keys(requestForm)) {
            if (!requestForm[prop]) {
                delete requestForm[prop];
            }
        }

        this.setState({inProgress: true}, () => {
            LocationService.city.create(requestForm)
                .then(response => {
                    NotificationManager.success('Успешно сохранено', 'Сохранено');
                    this.setState({ inProgress: false }, () => {
                        this.props.onSubmit(response);
                        this.props.onClose();
                    });
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    render() {
        const {form, inProgress} = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Добавление местоположения'
                onClose={this.props.onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form
                    ref={ref => this.form = ref}
                    onSubmit={this.handleSubmit}
                    validate
                >
                    <InputText
                        autoFocus
                        label='Название города'
                        required
                        value={form.city}
                        onChange={value => this.handleChangeForm('city', value)}
                    />

                    <AsyncCreatableSelect
                        label='Регион'
                        required
                        selected={form.selectedRegion}
                        menuPosition='fixed'
                        onChange={value => this.handleChangeForm('selectedRegion', value)}
                        requestService={LocationService.region.get}
                    />

                    <AsyncCreatableSelect
                        label='Федеральный округ'
                        required
                        disabled={!!form.selectedRegion}
                        selected={form.selectedFederal}
                        menuPosition='fixed'
                        onChange={value => this.handleChangeForm('selectedFederal', value)}
                        requestService={LocationService.federal.get}
                    />

                    <AsyncCreatableSelect
                        label='Страна'
                        required
                        disabled={!!form.selectedRegion || !!form.selectedFederal}
                        selected={form.selectedCountry}
                        menuPosition='fixed'
                        onChange={value => this.handleChangeForm('selectedCountry', value)}
                        requestService={LocationService.country.get}
                    />
                </Form>

                {inProgress && <Loader />}
            </ConfirmModal>
        );
    }
}
