import React, { useCallback, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    IconButton,
    CircularProgress
} from '@material-ui/core';
import { projectCreateDialogStyles } from './styles';
import CloseIcon from '@material-ui/icons/Close';
import { ProjectService } from '../../../services';
import { NotificationManager } from 'react-notifications';
import { useDispatch } from 'react-redux';
import { addProject } from '../../../redux/actions';
import { useHistory } from 'react-router-dom';


const ProjectCreateDialog = ({
    open,
    onClose
}) => {
    const [inProgress, setInProgress] = useState(false);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        sectionFirst: '',
        sectionSecond: '',
        sectionThird: '',
        medias: ''
    });

    const classes = projectCreateDialogStyles();

    const dispatch = useDispatch();
    const history = useHistory();

    const handleChange = useCallback(({ target: { name, value } }) => {
        setForm(f => ({
            ...f,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        setInProgress(true);

        ProjectService
            .post(form)
            .then(response => {
                const { data: project } = response;
                NotificationManager.success('Проект успешно создан', 'Создание проекта');
                dispatch(addProject(project));
                history.push(`/project-create/${project.id}`);
                onClose();
            })
            .finally(() => setInProgress(false));
    }, [form]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle disableTypography>
                <Typography variant='h6'>
                    Создание проекта
                </Typography>
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent className={classes.content}>
                    <TextField
                        autoFocus
                        label='Наименование'
                        name='name'
                        required
                        value={form.name}
                        variant='outlined'
                        fullWidth
                        onChange={handleChange}
                    />

                    <TextField
                        label='Код проекта'
                        name='slug'
                        value={form.slug}
                        variant='outlined'
                        fullWidth
                        onChange={handleChange}
                    />

                    <TextField
                        label='Описание'
                        name='description'
                        value={form.description}
                        variant='outlined'
                        fullWidth
                        multiline
                        rows={4}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    {inProgress && (
                        <CircularProgress
                            size={24}
                            color='primary'
                            variant='indeterminate'
                        />
                    )}

                    <Button
                        className={classes.button}
                        color='primary'
                        onClick={onClose}
                        disabled={inProgress}
                    >
                        Отмена
                    </Button>

                    <Button
                        className={classes.button}
                        type='submit'
                        color='primary'
                        disabled={inProgress}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectCreateDialog;
