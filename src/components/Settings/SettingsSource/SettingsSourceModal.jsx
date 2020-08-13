import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Form from '../../Form/Form/Form';
import InputText from '../../Form/InputText/InputText';
import Select from '../../Form/Select/Select';
import Loader from '../../Shared/Loader/Loader';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import {LocationService, SourceService} from '../../../services';
import {NotificationManager} from 'react-notifications';
import { isAccess } from "../../../helpers/Tools";
import { PERMISSION } from "../../../constants";

const defaultForm = {
    name: '',
    source_type_id: '',
    country_id: '',
    region_id: '',
    city_id: '',
    category: ''
};

export default class SettingsSourceModal extends Component {
    static propTypes = {
        item: PropTypes.object,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        typeItems: PropTypes.array,
        countryItems: PropTypes.array
    };

    state = {
        form: this.props.item || _.clone(defaultForm),
        federalItems: [],
        regionItems: [],
        cityItems: [],
        inProgress: !!this.props.item
    };

    componentDidMount() {
        if (this.props.item) {
            SourceService
                .get(
                    {expand: 'country,type,region,city,federalDistrict'},
                    this.props.item.id
                ).then(response => {
                    const newForm = {
                        source_type_id: _.get(response.data, 'type.id'),
                        country_id: _.get(response.data, 'country.id'),
                        federal_district_id: _.get(response.data, 'federalDistrict.id'),
                        region_id: _.get(response.data, 'region.id'),
                        city_id: _.get(response.data, 'city.id'),
                        ...response.data
                    };

                    delete newForm.type;
                    delete newForm.country;
                    delete newForm.federalDistrict;
                    delete newForm.region;
                    delete newForm.city;

                    this.setState({
                        form: newForm,
                        inProgress: false
                    }, () => {
                        const {form} = this.state;

                        if (form.country_id) {
                            this.getFederalDistricts(form.country_id);
                        }
                        if (form.country_id || form.federal_district_id) {
                            this.getRegions(form.country_id, form.federal_district_id);
                        }
                        if (form.region_id) this.getCities(form.region_id);
                    });
                })
                .catch(() => this.setState({inProgress: false}));
        }
    }

    handleChangeForm = (value, prop) => {
        const newState = _.clone(this.state);
        const isCountryChange = prop === 'country_id';
        const isRegionChange = prop === 'region_id';
        const isFederalChange = prop === 'federal_district_id';

        if (prop && value) {
            newState.form[prop] = value;
            newState.inProgress = isCountryChange || isFederalChange || isRegionChange;

            if (isCountryChange) {
                newState.form.federal_district_id = '';
                newState.federalItems = [];
            }

            if (isCountryChange || isFederalChange) {
                newState.form.region_id = '';
                newState.regionItems = [];
            }

            if (isCountryChange || isFederalChange || isRegionChange) {
                newState.form.city_id = '';
                newState.cityItems = [];
            }

            this.setState(newState, () => {
                if (isCountryChange && value) {
                    this.getFederalDistricts(value);
                    this.getRegions(value);
                }

                if (isFederalChange && value) {
                    this.getRegions(null, value);
                }

                if (isRegionChange && value) {
                    this.getCities(value);
                }
            });
        }
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, [
            'name',
            'city_id',
            'country_id',
            'federal_district_id',
            'region_id',
            'source_type_id',
            'category'
        ]);

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({inProgress: true}, () => {
            SourceService[method](requestForm, form.id).then(response => {
                NotificationManager.success('Успешно сохранено', 'Сохранено');
                this.props.onSubmit(response.data);
                this.setState({
                    form: _.clone(defaultForm),
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    getFederalDistricts = (countryId) => {
        LocationService
            .federal
            .get({'query[country_id]': countryId})
            .then(response => {
                this.setState({
                    federalItems: response.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    getRegions = (countryId, federalDistrictId) => {
        const form = {};

        if (countryId && !federalDistrictId) {
            form['query[country_id]'] = countryId;
        }

        if (federalDistrictId) {
            form['query[federal_district_id]'] = federalDistrictId;
        }

        LocationService.region.get(form).then(response => {
            this.setState({
                regionItems: response.data.map(({id, name}) => ({name, value: id})),
                inProgress: false
            });
        }).catch(() => this.setState({inProgress: false}));
    };

    getCities = (regionId) => {
        LocationService
            .city
            .get({'query[region_id]': regionId})
            .then(response => {
                this.setState({
                    cityItems: response.data.map(({id, name}) => ({name, value: id})),
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    canEdit = isAccess(PERMISSION.editSettings);

    render() {
        const {typeItems, countryItems} = this.props;
        const {form, federalItems, regionItems, cityItems, inProgress} = this.state;
        const selectedType = typeItems.find(({value}) => value === form.source_type_id);
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);
        const selectedFederal = federalItems.find(({value}) => value === form.federal_district_id);
        const selectedRegion = regionItems.find(({value}) => value === form.region_id);
        const selectedCity = cityItems.find(({value}) => value === form.city_id);

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                width='small'
                onClose={this.props.onClose}
                onSubmit={() => this.form.submit()}
                submitDisabled={!this.canEdit}
            >
                <Form
                    validate
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
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
                        label='Тип источника'
                        required
                        options={typeItems}
                        selected={selectedType}
                        onChange={({value}) => this.handleChangeForm(value, 'source_type_id')}
                        fixedPosList
                        disabled={!this.canEdit}
                    />

                    <Select
                        label='Страна'
                        // required
                        options={countryItems}
                        selected={selectedCountry}
                        onChange={({value}) => this.handleChangeForm(value, 'country_id')}
                        fixedPosList
                        disabled={!this.canEdit}
                    />

                    {(!!form.country_id && !!federalItems.length) && (
                        <Select
                            label='Федеральный округ'
                            required
                            options={federalItems}
                            selected={selectedFederal}
                            onChange={({value}) => this.handleChangeForm(value, 'federal_district_id')}
                            fixedPosList
                            disabled={!this.canEdit}
                        />
                    )}

                    {!!form.country_id && (
                        <Select
                            label='Регион'
                            required
                            options={regionItems}
                            selected={selectedRegion}
                            onChange={({value}) => this.handleChangeForm(value, 'region_id')}
                            fixedPosList
                            disabled={!this.canEdit}
                        />
                    )}

                    {!!form.region_id && (
                        <Select
                            label='Город'
                            required
                            options={cityItems}
                            selected={selectedCity}
                            onChange={({value}) => this.handleChangeForm(value, 'city_id')}
                            fixedPosList
                            disabled={!this.canEdit}
                        />
                    )}
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
