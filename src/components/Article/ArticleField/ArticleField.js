import React, { useCallback, useEffect } from 'react';
import { PROJECT_PERMISSION } from '@const';
import { SourceService, ArticleService, LocationService } from '@services';
import { isProjectAccess, isRolesAccess } from '@helpers/Tools';
import { connect } from 'react-redux';
import ProjectCreateField from '../../Project/ProjectCreatePage/ProjectCreatePageField/ProjectCreatePageField';
import { KEY_CODE } from '../../../constants';


function ArticleField({
    autoFocus,
    field,
    roles,
    article,
    sections = [],
    sectionsTwo = [],
    sectionsThree = [],
    onChange,
    onBlur,
    onKeyDown,
    onlyValue
}) {
    const getValue = useCallback((prop) => (
        _.isObject(prop) ? prop.value : prop
    ), []);

    const handleChange = useCallback((value, prop) => {
        onChange(value, prop);
    }, [onChange]);

    const handleKeyDown = useCallback((e) => {
        if (e.keyCode === KEY_CODE.esc && onBlur) {
            onBlur();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown, false);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [handleKeyDown]);

    field.readOnly = !isProjectAccess([ PROJECT_PERMISSION.EDIT ]) && !isRolesAccess(roles?.admin);

    switch (field.slug) {
        case 'source_id':
            field.requestService = SourceService.get;
            field.requestCancelService = SourceService.cancelLast;
            field.editable = true;
            break;
        case 'source_type_id':
            field.requestService = SourceService.type.get;
            field.requestCancelService = SourceService.cancelLast;
            break;
        case 'source_category_id':
            field.requestService = SourceService.category.get;
            field.requestCancelService = SourceService.cancelLast;
            break;
        case 'section_main_id':
            field.options = sections.map(section => ({
                label: section.name,
                value: section.id,
                sectionsTwo: section.sectionsTwo
            }));
            break;
        case 'section_sub_id':
            field.options = sectionsTwo.map(section => ({
                label: section.name,
                value: section.id,
                sectionsThree: section.sectionsThree
            }));
            field.isHidden = !sectionsTwo.length || false;
            break;
        case 'section_three_id':
            field.options = sectionsThree.map(({ name, id }) => ({ label: name, value: id }));
            field.isHidden = !sectionsThree.length || false;
            break;
        case 'genre_id':
            field.requestService = ArticleService.genre;
            field.requestCancelService = ArticleService.cancelLast;
            break;
        case 'type_id':
            field.requestService = ArticleService.types;
            field.requestCancelService = ArticleService.cancelLast;
            break;
        case 'heading_id':
            field.requestService = ArticleService.heading;
            field.requestCancelService = ArticleService.cancelLast;
            break;
        case 'rating_id':
            field.requestService = ArticleService.rating;
            field.requestCancelService = ArticleService.cancelLast;
            break;
        case 'country_id':
            field.requestService = LocationService.country.get;
            field.requestCancelService = LocationService.cancelLast;
            break;
        case 'federal_district_id':
            field.requestService = LocationService.federal.get;
            field.requestCancelService = LocationService.cancelLast;
            field.depended = [ {
                name: 'query[country_id]',
                value: getValue(article.country_id)
            } ];
            break;
        case 'region_id':
            field.requestService = LocationService.region.get;
            field.requestCancelService = LocationService.cancelLast;
            field.depended = [ {
                name: 'query[federal_district_id]',
                value: getValue(article.federal_district_id)
            }, {
                name: 'query[country_id]',
                value: getValue(article.country_id)
            } ];
            break;
        case 'city_id':
            field.requestService = LocationService.city.get;
            field.requestCancelService = LocationService.cancelLast;
            field.depended = [ {
                name: 'query[region_id]',
                value: getValue(article.region_id)
            } ];
            break;
        case 'authors':
            field.options = article.authors;
            field.requestService = ArticleService.author;
            field.requestCancelService = ArticleService.cancelLast;
            break;
        case 'createdAt':
        case 'updatedAt':
            // Из-за лентяев в бэкенде
            field.readOnly = true;
            break;
        default:
            break;
    }

    return (
        <ProjectCreateField
            key={field.slug}
            field={field}
            placeholder={field.name}
            value={article[field.slug] || ''}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            isHidden={field?.isHidden}
            onlyValue={onlyValue}
            autoFocus={autoFocus}
        />
    );
}

function mapStateToProps(state) {
    const roles = {};

    state.roles.forEach(({ name }) => roles[name] = name);

    return {
        roles
    };
}

export default connect(mapStateToProps)(ArticleField);
