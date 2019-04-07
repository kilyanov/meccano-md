import React from 'react';
import PropTypes from 'prop-types'
import './select.scss';

const classes = new Bem('select');

export default class Select extends Component {
    static propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.func
    };

    render() {
        return (
            <div {...classes()}>
                Select
            </div>
        );
    }
}
