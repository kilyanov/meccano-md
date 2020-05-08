import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {LocationService} from "../../../../../services";
import Form from "../../../../Form/Form/Form";
import InputText from "../../../../Form/InputText/InputText";
import Select from "../../../../Form/Select/Select";
import Loader from "../../../../Shared/Loader/Loader";
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import {NotificationManager} from "react-notifications";

const defaultForm = {
    name: '',
    country_id: '',
    federal_district_id: ''
};

export default class LocationRegionModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    };

    static defaultProps = {
        onSubmit: () => {}
    }

    state = {
        form: this.props.item || {...defaultForm},
        countryItems: [],
        federalItems: [],
        inProgress: true
    };

    componentDidMount() {
        LocationService.country.get()
            .then(countryResponse => {
                this.setState({
                    countryItems: countryResponse.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;
        const isCountryChange = prop === 'country_id';

        if (value && prop) {
            newState.form[prop] = value;
            newState.inProgress = isCountryChange;

            if (isCountryChange) {
                newState.form.federal_district_id = '';
                newState.federalItems = [];
            }
        }

        this.setState(newState, () => {
            if (isCountryChange) {
                this.getFederalItems();
            }
        });
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, 'name', 'country_id', 'federal_district_id');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({inProgress: true}, () => {
            LocationService.region[method](requestForm, form.id)
                .then(response => {
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

    getFederalItems = (countryId = this.state.form.country_id) => {
        LocationService.federal.get({'query[country_id]': countryId})
            .then(response => {
                this.setState({
                    federalItems: response.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            })
            .catch(() => this.setState({modalInProgress: false}));
    };

    render() {
        const { form, countryItems, federalItems, inProgress } = this.state;
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);
        const selectedFederal = federalItems.find(({value}) => value === form.federal_district_id);

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                width='small'
                onClose={this.props.onClose}
                onSubmit={() => this.form.submit()}
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
                    />

                    <Select
                        label='Страна'
                        required
                        options={countryItems}
                        selected={selectedCountry}
                        onChange={({value}) => this.handleChangeForm(value, 'country_id')}
                        fixedPosList
                    />

                    {!!form.country_id && (
                        <Select
                            label='Федеральный округ'
                            required
                            options={federalItems}
                            selected={selectedFederal}
                            onChange={({value}) => this.handleChangeForm(value, 'federal_district_id')}
                            fixedPosList
                        />
                    )}
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
