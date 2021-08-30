import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Page from '../../Shared/Page/Page';
import { PERMISSION } from "../../../constants";
import Access from "../../Shared/Access/Access";
import { isProjectAccess, isRolesAccess } from "../../../helpers/Tools";
import { PROJECT_PERMISSION } from "../../../constants";
import {
    Box,
    Card,
    CardContent,
    Fab,
    Typography,
    TextField,
    CardHeader,
    Avatar,
    InputAdornment,
    CardActionArea,
    CardActions,
    Button,
    DialogContentText
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { homePageStyles } from './styles';
import { useHistory } from 'react-router-dom';
import { Clear } from '@material-ui/icons';
import AlertDialog from '../../Shared/AlertDialog';
import { ProjectService } from '../../../services';
import { getProjects } from '../../../redux/actions';
import ProjectCreateDialog from '../../Project/ProjectCreateDialog';


const HomePage = () => {
    const [searchStr, setSearchStr] = useState('');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [deleteProject, setDeleteProject] = useState(null);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const profile = useSelector(state => state.profile);
    const projects = useSelector(state => state.projects);
    const roles = useSelector(state => {
        const result = {};
        state.roles.forEach(({ name }) => result[name] = name);
        return result;
    });

    const history = useHistory();
    const dispatch = useDispatch();
    const classes = homePageStyles();

    const handleCreateProject = useCallback(() => {
        setOpenCreateModal(true);
    }, []);

    const handleEdit = useCallback((projectId) => {
        history.push(`/project-create/${projectId}`);
    }, []);

    const handleSearchChange = useCallback(({ target: { value } }) => {
        setSearchStr(value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchStr('');
    }, []);

    const handleCardClick = useCallback((projectId) => {
        history.push(`/project/${projectId}`);
    }, []);

    const highlight = useCallback((text, searchString) => {
        if (searchString) {
            const parts = text.split(new RegExp(`(${searchString})`, 'gi'));

            return (
                <span>
                    {parts.map((part, i) =>
                        <span
                            key={i}
                            style={part.toLowerCase() === searchString.toLowerCase() ?
                                {backgroundColor: '#ffff8f'} : {}}
                        >
                            {part}
                        </span>
                    )}
                </span>);
        }

        return text;
    }, []);

    const handleDelete = useCallback((project) => {
        setDeleteProject(project);
    }, []);

    const handleSubmitDelete = useCallback(() => {
        if (!deleteProject || !deleteProject.id) {
            return;
        }

        setDeleteInProgress(true);

        ProjectService
            .delete(deleteProject.id)
            .then(() => {
                dispatch(getProjects());
                setDeleteProject(null);
            })
            .finally(() => {
                setDeleteInProgress(false);
            });
    }, [deleteProject]);

    return (
        <Page withBar>
            <Typography
                className={classes.pageTitle}
                variant='h1'
            >
                <Box component='span'>
                    Добро пожаловать,
                    {' '}
                    <Typography
                        variant='h1'
                        conponent='span'
                        className={classes.subTitle}
                    >{profile?.username}</Typography>
                </Box>

                <TextField
                    size='small'
                    placeholder='начните вводить название'
                    variant='outlined'
                    label='Поиск по проектам'
                    onChange={handleSearchChange}
                    value={searchStr}
                    InputProps={{
                        endAdornment: searchStr.length ? (
                            <InputAdornment
                                position='end'
                                onClick={handleClearSearch}
                            >
                                <Clear fontSize='small' />
                            </InputAdornment>
                        ) : null
                    }}
                />
            </Typography>

            <Box
                display='flex'
                flexWrap='wrap'
            >
                {projects
                    .filter(({ name }) => name.toLowerCase().includes(searchStr.toLowerCase()))
                    .map(project => {
                        const canEditProject = isRolesAccess(roles?.admin) ||
                            isProjectAccess(PROJECT_PERMISSION.PROJECT_MANAGER, project);

                        return (
                            <Card
                                key={project.id}
                                className={classes.card}
                            >
                                <CardActionArea onClick={() => handleCardClick(project.id)}>
                                    <CardHeader
                                        avatar={
                                            <Avatar className={classes.avatar}>
                                                {project.name.charAt(0)}
                                            </Avatar>
                                        }
                                        title={highlight(project.name, searchStr)}
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="caption"
                                            component="p"
                                            color="textSecondary"
                                        >
                                            Создан: {moment(project.createdAt).format('D MMM YYYY[г.] [в] HH:mm')}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            component="p"
                                            color="textSecondary"
                                        >
                                            Обновлен: {moment(project.updatedAt).format('D MMM YYYY[г.] [в] HH:mm')}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                {canEditProject && (
                                    <CardActions className={classes.cardActions}>
                                        <Button
                                            variant='text'
                                            color='primary'
                                            size='small'
                                            onClick={() => handleEdit(project.id)}
                                        >
                                            ИЗМЕНИТЬ
                                        </Button>
                                        <Button
                                            variant='text'
                                            color='secondary'
                                            size='small'
                                            onClick={() => handleDelete(project)}
                                        >
                                            УДАЛИТЬ
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        );
                    })}
            </Box>

            <ProjectCreateDialog
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
            />

            <AlertDialog
                open={!!deleteProject}
                title='Удаление проекта'
                submitText='Удалить'
                submitColor='secondary'
                onSubmit={handleSubmitDelete}
                submitDisabled={deleteInProgress}
                cancelDisabled={deleteInProgress}
                onClose={() => setDeleteProject(null)}
                onCancel={() => setDeleteProject(null)}
            >
                <DialogContentText>
                    Вы уверены, что хотите удалить проект "<b>{deleteProject?.name}</b>"?
                </DialogContentText>
            </AlertDialog>

            <Access permissions={[ PERMISSION.createProject ]}>
                <Fab
                    className={classes.fab}
                    color='primary'
                    onClick={handleCreateProject}
                >
                    <AddIcon />
                </Fab>
            </Access>
        </Page>
    );
};

export default HomePage;
