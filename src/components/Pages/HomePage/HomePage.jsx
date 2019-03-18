import React, {Component} from 'react';
import './home-page.scss';
import ProjectList from './ProjectList/ProjectList';
import {ProjectService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import Logo from '../../Shared/Logo/Logo';
import ArticlesIcon from '../../Shared/SvgIcons/ArticlesIcon';
import ProjectsIcon from '../../Shared/SvgIcons/ProjectsIcon';
import UsersIcon from '../../Shared/SvgIcons/UsersIcon';
import SettingsIcon from '../../Shared/SvgIcons/SettingsIcon';

class HomePage extends Component {
    state = {
        projects: []
    };

    componentDidMount() {
        this.getProjects();
    }

    handleClick = (name) => {
        if (this.dialogModal) {
            this.dialogModal
                .open({
                    title: 'Диалоговое окно',
                    content: `Много диалоговых окон не бывает ${name}`
                })
                .then(param => console.log('onSubmit', param))
                .catch(param => console.log('onClose', param));
        }
    };

    getProjects = () => {
        ProjectService.get()
            .then(response => this.setState({projects: response.data}))
            .catch(err => console.log(err));
    };

    projects = [{
        id: 'articles',
        icon: <ArticlesIcon/>,
        name: 'Статьи',
        children: []
    }, {
        id: 'projects',
        icon: <ProjectsIcon/>,
        name: 'Проекты',
        children: [{
            name: 'd_Minkomsvyasy',
            link: '/project/1'
        }, {
            name: 'd_Project',
            link: '/project/2'
        }, {
            name: 'd_Project',
            link: '/project/3'
        }]
    }, {
        id: 'users',
        icon: <UsersIcon/>,
        name: 'Пользователи'
    }, {
        id: 'settings',
        icon: <SettingsIcon/>,
        name: 'Настройки'
    }];

    render() {
        const classes = new Bem('home-page');

        return (
            <div {...classes('', '', ['container', 'page'])}>
                <div {...classes('logo')}>
                    <Logo/>
                </div>

                <h1 {...classes('title')}>Добро пожаловать, Юзверь!</h1>
                <h5 {...classes('sub-title')}>
                    Выберите ваш текущий проект, или <a {...classes('link')} role='button'>создайте новый</a>
                </h5>

                <div {...classes('row', '', ['row', 'row--align-h-center'])}>
                    <div {...classes('column', '', 'col-lg-6')}>
                        <ProjectList list={this.projects} onClick={this.handleClick}/>
                    </div>
                </div>

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </div>
        );
    }
}

export default HomePage;
