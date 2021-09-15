import React, { useCallback, useEffect, useState } from 'react';
import Page from '../../Shared/Page/Page';
import { useParams } from 'react-router-dom';
import { ArticleService, ProjectService } from '../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { setAppProgress } from '../../../redux/actions';
import ProjectSortTable from './ProjectSortTable';
import Fab from '@material-ui/core/Fab';
import SaveIcon from '@material-ui/icons/Save';
import { projectSortStyles } from './styles';

const ProjectSort = () => {
    const { projectId } = useParams();

    const [sections, setSections] = useState([]);
    const [articles, setArticles] = useState([]);
    const [needSave, setNeedSave] = useState(false);
    const [saveInProgress, setSaveInProgress] = useState(false);

    const userType = useSelector(state => state.userType);
    const dispatch = useDispatch();

    const classes = projectSortStyles();

    useEffect(() => {
        dispatch(setAppProgress({
            inProgress: true,
            withBlockedOverlay: true
        }));

        ProjectService.sections
            .get(projectId)
            .then((response) => {
                if (response?.data?.length) {
                    setSections(response.data);
                }
            })
            .finally(() => {
                dispatch(setAppProgress({
                    inProgress: false,
                    withBlockedOverlay: false
                }));
            });
    }, []);

    const handleSChange = useCallback((sorted) => {
        setArticles(sorted);
        setNeedSave(!!sorted.length);
    }, [needSave]);

    const handleSave = useCallback(() => {
        dispatch(setAppProgress({ inProgress: true }));
        setSaveInProgress(true);

        if (!userType?.id) {
            return;
        }

        ArticleService
            .updateMany({ articles }, projectId, userType.id)
            .finally(() => {
                setSaveInProgress(false);
                setNeedSave(false);
                dispatch(setAppProgress({ inProgress: false }));
            });
    }, [articles, projectId, userType]);


    if (!projectId) {
        return null;
    }

    return (
        <Page
            title='Сортировка статей'
            withBar
            withBackButton
            withBreadCrumbs
        >
            <ProjectSortTable
                sections={sections}
                onChange={handleSChange}
            />

            <Fab
                className={classes.fab}
                variant='extended'
                size='large'
                color='primary'
                onClick={handleSave}
                disabled={!needSave || saveInProgress}
            >
                <SaveIcon className={classes.extendedIcon} />
                Сохранить
            </Fab>
        </Page>
    );
};

export default ProjectSort;
