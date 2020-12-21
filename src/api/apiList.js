import {ParseToRequest} from '../helpers/Tools';

export const List = {
    article: {
        article: '/article',
        type: '/article/type',
        rating: '/article/rating',
        heading: '/article/heading',
        author: '/article/author',
        genre: '/article/genre',
        color: '/article/color'
    },
    archive: {
        archive: '/archive'
    },
    city: '/city',
    country: '/country',
    federal: '/federal',
    region: '/region',
    source: {
        source: '/source',
        type: '/source/type',
        category: '/source/category'
    },
    auth: {
        login: '/auth/login'
    },
    project: {
        project: '/project',
        sections: '/project/section',
        fieldValue: '/project/field-value',
        wordSearch: '/project/word-search',
        importWordSearch: '/project/word-search/import',
        field: '/project/field'
    },
    user: {
        user: '/user',
        profile: '/user/profile',
        create: '/user/create',
        roles: '/user/roles',
        type: '/user/type',
        project: '/user/project'
    },
    export:  '/export',
    transfer: {
        import: '/transfer/import',
        export: '/transfer/export',
        type: '/transfer/type',
        document: '/transfer/document'
    },
    file: {
        download: '/file/download'
    }
};

export const createURLGenerator = (serviceName) => {
    if (!List.hasOwnProperty(serviceName)) {
        return console.error(`Имя сервиса ${serviceName} не найдено в списке`, 'apiList.js');
    }

    return property => {
        if (_.isObject(List[serviceName]) && !List[serviceName].hasOwnProperty(property)) {
            return console.error(`Свойство ${property} не найдено в списке`, 'apiList.js');
        }

        let url = '';

        if (_.isObject(List[serviceName])) {
            const isFoundPrpp = List[serviceName].hasOwnProperty(property);

            if (!isFoundPrpp) return console.error(`Свойство ${property} не найдено в списке`, 'apiList.js');

            url += List[serviceName][property];
        }

        if (_.isString(List[serviceName])) {
            url += List[serviceName];
        }

        /*
            args:
                form <Object>
                id <String>
         */
        return (...args) => {
            let result = url;
            let form = null;

            args.forEach(arg => {
                if (arg && _.isObject(arg)) form = arg;
                if (arg && _.isString(arg)) {
                    result += `/${arg}`;
                }
            });

            if (form) result += ParseToRequest(form);

            return result;
        };
    };
};

export default List;
