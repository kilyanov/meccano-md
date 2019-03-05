import React, {Component} from 'react';
import './style.scss';
import ProjectList from './ProjectList/ProjectList';
import {ProjectService} from '../../../services';

class HomePage extends Component {
    state = {
        projects: []
    };

    componentDidMount() {
        this.getProjects();
    }

    getProjects = () => {
        ProjectService.get().then(response => this.setState({projects: response.data}));
    };

    projects = [{name: 'd_Mars_sources'}, {name: 'd_Mars_sources'}, {name: 'd_Mincomsvyasy'}];

    render() {
        const classes = new Bem('home-page');

        return (
            <div {...classes('', '', ['container', 'page'])}>
                <h1 {...classes('title')}>Добро пожаловать, Юзверь!</h1>
                <h5 {...classes('sub-title')}>
                    Выберите ваш текущий проект, или <a {...classes('link')} role='button'>создайте новый</a>
                </h5>

                <div {...classes('row', '', ['row', 'row--align-h-center'])}>
                    <div {...classes('column', '', 'col-lg-6')}>
                        <ProjectList list={this.projects}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;
