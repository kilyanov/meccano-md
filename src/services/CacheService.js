import {DBService} from "./DBService";
import {SourceService} from "./SourceService";
import {DB_STORE} from "../constants/DB_STORE";

export const CacheService = {};

Object.keys(DB_STORE).forEach(storeName => {
    CacheService[storeName] = (callback) => {
        DBService
            .getStore(storeName)
            .then(dbResponse => {
                callback(dbResponse);
                return dbResponse;
            })
            .then((dbResponse) => {
                SourceService
                    .get()
                    .then(({ data }) => {
                        if (data && data.length !== dbResponse.length) {
                            DBService.clearStore(storeName);
                            DBService.setStore(storeName, data);
                        }

                        return callback(data);
                    });
            });
    };
});
