import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {ProjectService} from '../../../services';
import SectionTree from '../../Shared/SectionTree/SectionTree';
import {EventEmitter} from '../../../helpers';

export default class ProjectCreateSecondStep extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired
    };

    state = {
        sections: [],
        inProgress: true
    };

    componentDidMount() {
        ProjectService.getSections(this.props.project.id).then(response => {
            console.log(response);
            this.setState({
                sections: response.data,
                inProgress: false
            });
        });
    }

    handleChangeSections = (sections) => {
        this.setState({sections});
    };

    submit = () => {
        const {project} = this.props;
        const {sections} = this.state;

        if (sections && sections.length) {
            ProjectService.createSections(project.id, sections).then(response => {
                console.log(response);
                setTimeout(() => EventEmitter.emit('redirect', `/project/${project.id}`), 2000);
            });
        }
    };

    render() {
        const {classes} = this.props;
        const {sections} = this.state;

        return (
            <div {...classes('step', 'second', 'container')}>
                <h3>Структура документа</h3>

                <SectionTree
                    data={sections}
                    onChange={this.handleChangeSections}
                />
            </div>
        );
    }
}
