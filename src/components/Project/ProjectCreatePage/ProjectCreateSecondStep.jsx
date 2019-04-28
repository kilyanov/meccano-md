import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {ProjectService} from '../../../services';
import SectionTree from '../../Shared/SectionTree/SectionTree';

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

    render() {
        const {classes} = this.props;
        const {sections} = this.state;

        return (
            <div {...classes('step', 'second', 'container')}>
                <h3>Структура документа</h3>

                <SectionTree
                    data={sections}
                    onChage={this.handleChangeSections}
                />
            </div>
        );
    }
}
