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

        // let invalid = false;

        // this.inputs.forEach(input => {
        //     let ref ;
        //
        //     input.ref = r => ref = r;
        //
        //     debugger;
        //     if (!input.validate()) invalid = true;
        // });

        // if (!invalid)
        this.props.onSubmit();

        return false;
    };

    inputs = [];

    r = (elem) => {
        if (!elem) return;

        if (
            elem.type instanceof Function &&
            _.get(elem.type.prototype, 'constructor.name') === InputText.name) {
            this.inputs.push(elem);
        }

        const children = _.get(elem, 'props.children');

        if (children) {
            if (children instanceof Array) {
                children.forEach(this.r);
            }
            if (children instanceof Object) {
                this.r(children);
            }
        }
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
