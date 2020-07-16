import React, {Component} from 'react';
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import Form from "../../../../Form/Form/Form";
import InputText from "../../../../Form/InputText/InputText";
import Select from "../../../../Form/Select/Select";
import Loader from "../../../../Shared/Loader/Loader";
import {NotificationManager} from "react-notifications";
import {LocationService} from "../../../../../services";
import { isAccess } from "../../../../../helpers/Tools";
import { PERMISSION } from "../../../../../constants";

const defaultForm = {
    name: '',
    country_id: '',
    federal_district_id: ''
};

export default class LocationCityModal extends Component {
    static defaultProps = {
        onSubmit: () => {}
    }

    state = {
        form: this.props.item || {...defaultForm},
        regionItems: [],
        countryItems: [],
        inProgress: true
    };

    componentDidMount() {
        Promise.all([
            LocationService.region.get(),
            LocationService.country.get()
        ]).then(([
            regionResponse,
            countryResponse
        ]) => {
            this.setState({
                regionItems: regionResponse.data.map(({id, name}) => ({name, value: id})),
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
        const requestForm = {
            name: form.name
        }

        if (form.region_id) {
            requestForm.region_id = form.region_id;
        }

        if (form.country_id) {
            requestForm.country_id = form.country_id;
        }

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({inProgress: true}, () => {
            LocationService.city[method](requestForm, form.id)
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
        const { form, regionItems, countryItems, inProgress } = this.state;
        const selectedRegion = regionItems.find(({value}) => value === form.region_id);
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
                        label='Название'
                        required
                        value={form.name}
                        onChange={value => this.handleChangeForm(value, 'name')}
                        disabled={!this.canEdit}
                    />

                    <Select
                        label='Регион'
                        required={!form.country_id}
                        options={regionItems}
                        selected={selectedRegion}
                        onChange={({value}) => this.handleChangeForm(value, 'region_id')}
                        fixedPosList
                        disabled={!this.canEdit}
                    />

                    <Select
                        label='Страна'
                        required={!form.region_id}
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
