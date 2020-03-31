import {CityService} from "./CityService";

export default {
    cities: () => {
        return new Promise(resolve => {
            resolve(IDBIndex)
        }).then(() => {
            return CityService.get()
        }).then(res => {

        })
    }
}
