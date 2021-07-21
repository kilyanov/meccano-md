import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ProjectService} from '@services';
import SectionTree from '../../../Shared/SectionTree/SectionTree';
import Loader from '../../../Shared/Loader/Loader';

export default class ProjectSections extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired,
        sections: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired
    };

    state = {
        inProgress: true
    };

    componentDidMount() {
        this._getSections()
    }

    handleChangeSections = (sections) => {
        this.props.onChange(sections);
    };

    _getSections = () => {
        ProjectService
            .getSections(this.props.projectId)
            .then(response => {
                this.setState({
                    inProgress: false
                }, () => this.props.onChange(response.data));
            });
    }

    render() {
        const { classes, sections, projectId } = this.props;
        const { inProgress } = this.state;

        return (
            <div {...classes('step', 'second', 'container')}>
                <h3>Структура документа</h3>

                <SectionTree
                    projectId={projectId}
                    data={sections}
                    onChange={this.handleChangeSections}
                    onUpdate={() => this._getSections()}
                />

                {inProgress && <Loader fixed />}
            </div>
        );
    }
}
