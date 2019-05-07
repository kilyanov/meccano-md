import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';

export default class Form extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node,
        onSubmit: PropTypes.func.isRequired
    };

    handleOnSubmit = (event) => {
        if (event) event.preventDefault();

        const {children} = this.props;

        React.Children.forEach(children, child => {
            this.r(child);
        });

        this.props.onSubmit();

        return false;
    };

    inputs = [];

    r = (elem) => {
        if (!elem) return;

        const children = _.get(elem, 'props.children', []);

        if (elem.type.prototype instanceof InputText) {
            this.inputs.push(elem);
        }

        if (children.length) {
            children.forEach(child => {
                if (child.type.prototype instanceof InputText) {
                    this.inputs.push(child);
                } else this.r(child);
            });
        } else return;
    };

    submit = () => {
        this.handleOnSubmit();
    };

    render() {
        const classes = new Bem('form');

        return (
            <form
                ref={node => this.form = node}
                {...classes('', '', this.props.className)}
                onSubmit={this.handleOnSubmit}
            >
                {this.props.children}
            </form>
        );
    }
}
