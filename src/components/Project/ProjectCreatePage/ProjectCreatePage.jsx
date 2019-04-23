import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Page from '../../Shared/Page/Page';
import Button from '../../Shared/Button/Button';
import './project-create-page.scss';
import ProjectCreateFirstStep from './ProjectCreateFirstStep';
import ProjectCreateSecondStep from './ProjectCreateSecondStep';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('project-create-page');

class ProjectCreatePage extends Component {
    static propTypes = {
        projects: PropTypes.array.isRequired
    };

    state = {
        step: this.props.match.params.step,
        projectId: this.props.match.params.id,
        inProgress: false
    };

    getProject = () => {
        if (this.project && this.project.id === this.projectId) {
            return this.project;
        } else if (this.props.projects.length) {
            this.project = this.props.projects.find(({id}) => id === this.projectId);

            return this.project;
        }
    };

    step = +this.props.match.params.step;

    projectId = this.props.match.params.id;

    project = null;

    render() {
        const { inProgress } = this.state;
        const project = this.getProject();

        return (
            <Page
                withBar
                withContainerClass={false}
                {...classes()}
            >
                <section {...classes('header')}>
                    <div {...classes('container', '', 'container')}>
                        <div {...classes('breadcrumbs')}>
                            Создание проекта: {this.step === 1 ?
                                'Шаг 1 - Настройка полей' : 'Шаг 2: Создание структуры'}
                        </div>

                        {project && <h2 {...classes('title')}>{project.name}</h2>}
                    </div>
                </section>

                <section {...classes('body')}>
                    {(project && this.step === 1) && (
                        <ProjectCreateFirstStep
                            classes={classes}
                            project={project}
                        />
                    )}

                    {(project && this.step === 2) && (
                        <ProjectCreateSecondStep
                            classes={classes}
                            project={project}
                        />
                    )}
                </section>

                <section {...classes('footer')}>
                    <div {...classes('container', '', 'container')}>
                        <Button
                            {...classes('cancel-button')}
                            style='inline'
                            text='Отменить создание'
                        />
                        <Button
                            {...classes('submit-button')}
                            style='success'
                            text='Далее'
                        />
                    </div>
                </section>

                {(!project || inProgress) && <Loader/>}
            </Page>
        );
    }
}

export default connect(({projects}) => ({projects}))(ProjectCreatePage);
