import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ProjectCreateSecondStep extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired
    };

    render() {
        const {classes} = this.props;

        return (
            <div {...classes('row', '', 'row')}>
                Второй шаг
            </div>
        );
    }
}
