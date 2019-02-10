import types from "../../../constants/ActionTypes";
import CountryService from "../../../services/CountryService";

export const getCountries = () => ({
    type: types.REQUEST,
    actions: [
        types.country.COUNTRY_LOADING,
        types.country.COUNTRY_LOADED,
        types.country.COUNTRY_LOAD_FAILURE
    ],
    promise: CountryService.getCountries()
});
