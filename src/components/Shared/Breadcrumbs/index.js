import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProjectsIcon from '../SvgIcons/ProjectsIcon';
import StorageIcon from '../SvgIcons/StorageIcon';
import DocumentIcon from '../SvgIcons/DocumentIcon';
import BEMHelper from 'react-bem-helper';
import './breadcrumbs.scss';

const cls = new BEMHelper('breadcrumbs');
const projectIcon = <svg data-icon="folder-close" width="16" height="16" viewBox="0 0 16 16"><desc>folder-close</desc><path d="M-.01 14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7h-16v7zm15-10H7.41L5.7 2.3a.965.965 0 00-.71-.3h-4c-.55 0-1 .45-1 1v3h16V5c0-.55-.45-1-1-1z" fill-rule="evenodd"></path></svg>;
const archiveIcon = <svg data-icon="database" width="16" height="16" viewBox="0 0 20 20"><desc>database</desc><path d="M2.01 5.1v5.4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V5.1c-1.49 1.13-4.51 1.9-8 1.9-3.48 0-6.5-.77-8-1.9zm8 .9c4.42 0 8-1.12 8-2.5s-3.58-2.5-8-2.5-8 1.12-8 2.5S5.6 6 10.01 6zm-8 6.1v5.4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-5.4c-1.49 1.13-4.51 1.9-8 1.9-3.48 0-6.5-.77-8-1.9z" fill-rule="evenodd"></path></svg>;
const articleIcon = <svg data-icon="document" width="16" height="16" viewBox="0 0 16 16"><desc>document</desc><path d="M9 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5L9 0zm3 14H4V2h4v4h4v8z" fill-rule="evenodd"></path></svg>;

export default function Breadcrumbs({ location }) {
    if (!location || !location.pathname) return null;

    const splitted = location.pathname.split('/').filter(i => !!i);
    const crumbs = [{
        label: '',
        link: '/',
        type: 'main'
    }];
    const currentProject = useSelector(state => state.currentProject);
    const currentArchive = useSelector(state => state.currentArchive);
    const currentArticle = useSelector(state => state.currentArticle);

    if ((splitted[0] === 'project' || splitted[0] === 'archive') && currentProject) {
        crumbs.push({
            label: currentProject.name,
            link: `/project/${currentProject.id}`,
            disabled: splitted.length === 2,
            type: 'project'
        });

        if (splitted[0] === 'archive' && currentArchive) {
            crumbs.push({
                label: currentArchive.name || 'Безымянный архив',
                link: `/archive/${currentProject.id}/${currentArchive.id}`,
                disabled: splitted.length === 3,
                type: 'archive'
            });
        }
    }

    if (splitted.includes('article') && currentArticle) {
        crumbs.push({
            label: currentArticle.title,
            link: splitted[0] === 'archive'
                ? `/archive/${currentArchive.id}/article/${currentArticle.id}`
                : `/project/${currentProject.id}/article/${currentArticle.id}`,
            disabled: true,
            type: 'article'
        });
    }

    console.log(crumbs);

    return (
        <section { ...cls() }>
            {crumbs.map((crumb, index) => (
                <div
                    { ...cls('item', { disabled: crumb.disabled }) }
                    key={index}
                >
                    <Link
                        { ...cls('item-link') }
                        to={crumb.link}
                        disabled={crumb.disabled}
                    >
                        {crumb.type === 'main' && <span { ...cls('item-icon', 'main') } />}
                        {crumb.type === 'project' && <span { ...cls('item-icon', 'project') } >{projectIcon}</span>}
                        {crumb.type === 'archive' && <span { ...cls('item-icon', 'archive') }>{archiveIcon}</span>}
                        {crumb.type === 'article' && <span { ...cls('item-icon', 'article') }>{articleIcon}</span>}
                        <span { ...cls('item-label') }>{crumb.label}</span>
                    </Link>
                </div>
            ))}
        </section>
    )
}