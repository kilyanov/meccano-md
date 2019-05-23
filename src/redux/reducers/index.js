import {combineReducers} from 'redux';
import {profile} from './user';
import {projects} from './project';
import {articles} from './article';
import {city} from './city';
import {country} from './country';
import {federal} from './federal';
import {region} from './region';
import {source} from './source';

const reducer = combineReducers({
    profile,
    projects,
    articles,
    city,
    country,
    federal,
    region,
    source
});

export default reducer;
