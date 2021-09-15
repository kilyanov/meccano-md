import React, { useCallback, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { AuthService, StorageService } from '../../../services';
import { STORAGE_KEY } from '../../../constants';
import { useHistory } from 'react-router-dom';
import { loginStyles } from './styles';
import Logo from '../../Shared/Logo/Logo';
import FixedLoader from '../../Shared/FixedLoader';


const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [inProgress, setInProgress] = useState(false);

    const history = useHistory();
    const classes = loginStyles();

    const handleChange = useCallback(({ target: { name, value } }) => {
        setForm(f => ({
            ...f,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        setInProgress(true);

        if (!form.username || !form.password) {
            return;
        }

        AuthService
            .login(form)
            .then(response => {
                if (response.data.token) {
                    let lastPathName = StorageService.get(STORAGE_KEY.LAST_PATHNAME);

                    if (lastPathName && lastPathName === '/login') {
                        lastPathName = '/';
                    }

                    history.push(lastPathName || '/');
                }
            });
    }, [form]);

    return (
        <Container className={classes.container}>
            <Box className={classes.root}>

                <Logo className={classes.logo}/>

                <form
                    className={classes.form}
                    onSubmit={handleSubmit}
                >
                    <TextField
                        autoFocus
                        label='Логин'
                        name='username'
                        required
                        variant='outlined'
                        value={form.username}
                        onChange={handleChange}
                    />
                    <TextField
                        label='Пароль'
                        type='password'
                        name='password'
                        required
                        variant='outlined'
                        value={form.password}
                        onChange={handleChange}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        size='large'
                    >
                        Войти
                    </Button>
                </form>
            </Box>

            {inProgress && <FixedLoader />}
        </Container>
    );
};

export default Login;
