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
import Page from '../../Shared/Page/Page';
import DocumentIcon from '../../Shared/SvgIcons/DocumentIcon';
import {PERMISSION} from "../../../constants/Permissions";
import Access from "../../Shared/Access/Access";
import Loader from "../../Shared/Loader/Loader";
import {isProjectAccess, isRolesAccess} from "../../../helpers/Tools";
import {PROJECT_PERMISSION} from "../../../constants/ProjectPermissions";

class HomePage extends Component {
    static propTypes = {
        profile: PropTypes.object,
        projects: PropTypes.array
    };

    static defaultProps = {
        profile: {},
        projects: []
    };

    state = {
        showProjectCreateModal: false
    };

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

    getMenu = () => {
        const {roles} = this.props;

        return (
            [{
                id: 'articles',
                icon: <EarthIcon/>,
                name: 'Статьи',
                children: [],
                permissions: ['HIDDEN']
            }, {
                id: 'projects',
                icon: <ProjectsIcon/>,
                name: 'Проекты',
                permissions: [PERMISSION.all],
                children: this.props.projects.map(project => {
                    const canEditProject = isRolesAccess(roles.admin) ||
                        isProjectAccess(PROJECT_PERMISSION.PROJECT_MANAGER, project);

                    return {
                        name: project.name,
                        link: `/project/${project.id}`,
                        editLink: canEditProject ? `/project-create/${project.id}` : ''
                    };
                })
            }, {
                id: 'documents',
                icon: <DocumentIcon/>,
                name: 'Документы',
                link: '/documents',
                permissions: [PERMISSION.viewDocuments, PERMISSION.editDocuments]
            }, {
                id: 'users',
                icon: <UsersIcon/>,
                name: 'Пользователи',
                link: '/users',
                permissions: [PERMISSION.viewUsers, PERMISSION.editUsers]
            }, {
                id: 'settings',
                icon: <SettingsIcon/>,
                name: 'Настройки',
                link: '/settings',
                permissions: [PERMISSION.viewSettings, PERMISSION.editSettings]
            }]
        );
    };

    render() {
        const cls = new Bem('home-page');
        const {showProjectCreateModal} = this.state;
        const {profile} = this.props;
        const menu = this.getMenu();

        return (
            <Page {...cls()} withBar>
                {_.get(profile, 'username') && (
                    <h1 {...cls('title')}>Добро пожаловать, {profile.username}!</h1>
                )}
                <Access permissions={[PERMISSION.createProject]}>
                    <h5 {...cls('sub-title')}>
                        Выберите ваш текущий проект, или
                        {' '}
                        <a
                            {...cls('link')}
                            role='button'
                            onClick={() => this.setState({ showProjectCreateModal: true })}
                        >создайте новый</a>
                    </h5>
                </Access>

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

                {_.isEmpty(profile) && <Loader />}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </Page>
        );
    }
}

const roles = {};
const mapStateToProps = (state) => {
    state.roles.forEach(({name}) => roles[name] = name);

    return {
        profile: state.profile,
        projects: state.projects,
        roles
    };
};

export default connect(mapStateToProps)(HomePage);
