import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './home-page.scss';
import {connect} from 'react-redux';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import EarthIcon from '../../Shared/SvgIcons/EarthIcon';
import ProjectsIcon from '../../Shared/SvgIcons/ProjectsIcon';
import UsersIcon from '../../Shared/SvgIcons/UsersIcon';
import SettingsIcon from '../../Shared/SvgIcons/SettingsIcon';
import ProjectCreateModal from '../../Project/ProjectCreateModal/ProjectCreateModal';
import VerticalMenu from '../../Shared/VerticalMenu/VerticalMenu';
import {ProjectService} from '../../../services';
import Loader from '../../Shared/Loader/Loader';
import Page from '../../Shared/Page/Page';
import DocumentIcon from '../../Shared/SvgIcons/DocumentIcon';

class HomePage extends Component {
    static propTypes = {
        profile: PropTypes.object
    };

    state = {
        projects: [],
        inProgress: true,
        showProjectCreateModal: false
    };

    componentDidMount() {
        ProjectService.get().then(response => {
            this.setState({
                projects: response.data,
                inProgress: false
            });
        }).catch(() => this.setState({inProgress: false}));
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

    getMenu = () => (
        [{
            id: 'articles',
            icon: <EarthIcon/>,
            name: 'Статьи',
            children: []
        }, {
            id: 'projects',
            icon: <ProjectsIcon/>,
            name: 'Проекты',
            children: this.state.projects.map(({id, name}) => ({
                name,
                link: `/project/${id}`,
                editLink: `/project-create/${id}`
            }))
        }, {
            id: 'documents',
            icon: <DocumentIcon/>,
            name: 'Документы',
            link: '/documents'
        }, {
            id: 'users',
            icon: <UsersIcon/>,
            name: 'Пользователи'
        }, {
            id: 'settings',
            icon: <SettingsIcon/>,
            name: 'Настройки',
            link: '/settings'
        }]
    );

    render() {
        const cls = new Bem('home-page');
        const {profile} = this.props;
        const {showProjectCreateModal, inProgress} = this.state;
        const menu = this.getMenu();

        return (
            <Page {...cls()} withBar>
                <h1 {...cls('title')}>Добро пожаловать, {_.get(profile, 'username', '')}!</h1>
                <h5 {...cls('sub-title')}>
                    Выберите ваш текущий проект, или
                    {' '}
                    <a
                        {...cls('link')}
                        role='button'
                        onClick={() => this.setState({ showProjectCreateModal: true })}
                    >создайте новый</a>
                </h5>

                <div {...cls('row', '', ['row', 'row--align-h-center'])}>
                    <div {...cls('column', '', 'col-md-6')}>
                        <VerticalMenu list={menu} onClick={this.handleClick}/>
                    </div>
                </div>

                {showProjectCreateModal && (
                    <ProjectCreateModal
                        onClose={() => this.setState({ showProjectCreateModal: false })}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>

                {inProgress && <Loader/>}
            </Page>
        );
    }
}

export default connect(({profile}) => ({profile}))(HomePage);
