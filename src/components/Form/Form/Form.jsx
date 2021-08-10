import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants';

export default class Form extends Component {
    static propTypes = {
        validate: PropTypes.bool,
        className: PropTypes.string,
        children: PropTypes.node,
        onSubmit: PropTypes.func.isRequired,
        onFailure: PropTypes.func
    };

    static defaultProps = {
        onFailure: () => {}
    };

    componentDidMount() {
        if (this.props.validate) {
            EventEmitter.on(EVENTS.FORM.ON_VALIDATE_SUCCESS, this.validateForm.bind(null, 'success'));
            EventEmitter.on(EVENTS.FORM.ON_VALIDATE_FAILURE, this.validateForm.bind(null, 'failure'));
        }
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE_SUCCESS, this.validateForm);
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE_FAILURE, this.validateForm);
    }

    handleOnSubmit = (event) => {
        if (event) event.preventDefault();

        const {onSubmit, validate} = this.props;

        if (validate) {
            this.elementsCount.success = 0;
            this.elementsCount.failure = 0;
            EventEmitter.emit(EVENTS.FORM.ON_VALIDATE);
        } else onSubmit();

        return false;
    };

    validateForm = (type) => {
        if (!this.form) return;

        const validatedElements = this.form.querySelectorAll('.validated');
        const countValidatedElements = validatedElements.length;

        this.elementsCount[type]++;

        if (this.elementsCount.success + this.elementsCount.failure === countValidatedElements) {
            if (this.elementsCount.success === countValidatedElements) {
                console.log('SUBMIT FORM SUCCESS');
                this.props.onSubmit();
            } else {
                console.log('SUBMIT FORM FAILURE');
                this.props.onFailure();
            }
        }
    };

    elementsCount = {
        success: 0,
        failure: 0
    };

    submit = () => {
        this.handleOnSubmit();
    };

    render() {
        const cls = new Bem('form');

        return (
            <form
                ref={node => this.form = node}
                {...cls('', '', this.props.className)}
                onSubmit={this.handleOnSubmit}
            >
                {this.props.children}
            </form>
        );
    }
}
