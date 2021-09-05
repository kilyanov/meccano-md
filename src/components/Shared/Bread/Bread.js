import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArchiveService, ArticleService, ProjectService } from '../../../services';
import { setCurrentArchive, setCurrentArticle, setCurrentProject } from '../../../redux/actions';
import { Breadcrumbs, Link, Typography } from '@material-ui/core';


const Bread = () => {
    const params = useParams();
    const dispatch = useDispatch();

    console.log('params', params);

    const [data, setData] = useState({
        article: null,
        project: null,
        archive: null
    });

    const {
        storeArticle,
        storeProject,
        storeArchive,
        userType
    } = useSelector(state => ({
        storeArticle: state.currentArticle,
        storeProject: state.currentProject,
        storeArchive: state.currentArchive,
        userType: state.userType
    }));

    useEffect(() => {
        let article = !_.isEmpty(storeArticle) && storeArticle;
        let archive = !_.isEmpty(storeArchive) && storeArchive;
        let project = !_.isEmpty(storeProject) && storeProject;

        if (!project && params.projectId) {
            ProjectService
                .get(null, params.projectId)
                .then(response => {
                    if (response.data) {
                        dispatch(setCurrentProject(response.data));
                        project = response.data;
                    }
                });
        }

        if (!archive && params.archiveId && params.projectId) {
            ArchiveService
                .get(params.projectId, params.archiveId)
                .then(response => {
                    if (response.data) {
                        dispatch(setCurrentArchive(response.data));
                        archive = response.data;
                    }
                });
        }

        if (!article && params.articleId && userType) {
            ArticleService
                .get(params.articleId, { user_type: userType?.id })
                .then(response => {
                    if (response.data) {
                        dispatch(setCurrentArticle(response.data));
                        article = response.data;
                    }
                });
        }

        setData(d => ({ ...d, article, project, archive }));
    }, [storeArticle, storeProject, storeArchive, userType, params]);

    const { project, archive, article } = data;

    return (
        <Breadcrumbs>
            <Link
                color='inherit'
                href='/'
            >
                Главная
            </Link>

            {project && (
                <Link
                    color='inherit'
                    href={`/project/${project.id}`}
                >
                    {project.name}
                </Link>
            )}

            {archive && (
                <Link
                    color='inherit'
                    href={`/archive/${project.id}/${archive.id}`}
                >
                    {archive.description || 'Безымянный архив'}
                </Link>
            )}

            {article && (
                <Typography color="textPrimary">{article.title}</Typography>
            )}
        </Breadcrumbs>
    );
};

export default Bread;
