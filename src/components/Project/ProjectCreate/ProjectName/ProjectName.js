import React, { useCallback, useState } from 'react';
import { TextField } from '@material-ui/core';
import { projectNameStyles } from './styles';


const ProjectName = () => {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        sectionFirst: '',
        sectionSecond: '',
        sectionThird: '',
        medias: ''
    });

    const classes = projectNameStyles();

    const handleChange = useCallback(({ target: { name, value } }) => {
        if (!name || !form[name]) {
            return;
        }

        setForm(f => ({
            ...f,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
    }, []);

    return (
        <form
            className={classes.form}
            onSubmit={handleSubmit}
        >
            <TextField
                autoComplete='off'
                label='Название проекта'
                value={form.name}
                onChange={handleChange}
                name='name'
                variant='outlined'
                required
                fullWidth
            />

            <TextField
                autoComplete='off'
                label='Код проекта'
                value={form.slug}
                onChange={handleChange}
                name='name'
                variant='outlined'
                fullWidth
            />

            <TextField
                autoComplete='off'
                label='Описание проекта'
                value={form.description}
                onChange={handleChange}
                multiline
                name='description'
                rows={4}
                variant='outlined'
                fullWidth
            />
        </form>
    );
};

export default ProjectName;
