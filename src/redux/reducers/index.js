import {combineReducers} from 'redux';
import {profile} from "./user";
import {projects} from "./project";
import {articles} from "./article";

const reducer = combineReducers({
    profile,
    projects,
    articles
});

export default reducer;
