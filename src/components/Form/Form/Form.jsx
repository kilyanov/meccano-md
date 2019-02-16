import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Form extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node,
        onSubmit: PropTypes.func.isRequired
    };

    handleOnSubmit = (event) => {
        event.preventDefault();
        this.props.onSubmit();
    };

    render() {
        const classes = new Bem('form');

        return (
            <form
                {...classes('', '', this.props.className)}
                onSubmit={this.handleOnSubmit}
            >
                {this.props.children}
            </form>
        );
    }
}
