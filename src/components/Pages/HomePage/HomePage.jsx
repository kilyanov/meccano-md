import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import HomeMenu from './HomeMenu/HomeMenu';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import Logo from '../../Shared/Logo/Logo';
import ArticlesIcon from '../../Shared/SvgIcons/ArticlesIcon';
import ProjectsIcon from '../../Shared/SvgIcons/ProjectsIcon';
import UsersIcon from '../../Shared/SvgIcons/UsersIcon';
import SettingsIcon from '../../Shared/SvgIcons/SettingsIcon';

import './home-page.scss';
import ProjectCreateModal from '../../Project/ProjectCreateModal/ProjectCreateModal';

class HomePage extends Component {
    static propTypes = {
        profile: PropTypes.object,
        projects: PropTypes.array
    };

    static defaultProps = {
        projects: []
    };

    state = { showProjectCreateModal: false };

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

    getMenu = () => (
        [{
            id: 'articles',
            icon: <ArticlesIcon/>,
            name: 'Статьи',
            children: []
        }, {
            id: 'projects',
            icon: <ProjectsIcon/>,
            name: 'Проекты',
            children: this.props.projects.map(({id, name}) => ({name, link: `/project/${id}`}))
        }, {
            id: 'users',
            icon: <UsersIcon/>,
            name: 'Пользователи'
        }, {
            id: 'settings',
            icon: <SettingsIcon/>,
            name: 'Настройки'
        }]
    );

    render() {
        const classes = new Bem('home-page');
        const { profile } = this.props;
        const { showProjectCreateModal } = this.state;
        const menu = this.getMenu();

        return (
            <div {...classes('', '', ['container', 'page'])}>
                <div {...classes('logo')}>
                    <Logo/>
                </div>

                <h1 {...classes('title')}>Добро пожаловать, {_.get(profile, 'username', '')}!</h1>
                <h5 {...classes('sub-title')}>
                    Выберите ваш текущий проект, или
                    {' '}
                    <a
                        {...classes('link')}
                        role='button'
                        onClick={() => this.setState({ showProjectCreateModal: true })}
                    >создайте новый</a>
                </h5>

                <div {...classes('row', '', ['row', 'row--align-h-center'])}>
                    <div {...classes('column', '', 'col-md-6')}>
                        <HomeMenu list={ menu } onClick={ this.handleClick }/>
                    </div>
                </div>

                {showProjectCreateModal && (
                    <ProjectCreateModal
                        onClose={() => this.setState({ showProjectCreateModal: false })}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </div>
        );
    }
}

export default connect(({profile, projects}) => ({
    profile,
    projects
}))(HomePage);
