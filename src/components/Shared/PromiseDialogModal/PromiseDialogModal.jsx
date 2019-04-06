import React, {PureComponent} from 'react';
import './dialog-modal.scss';
import Button from '../Button/Button';
import { KEY_CODE } from '../../../constants/KeyCode';

const classes = new Bem('dialog-modal');

export default class PromiseDialogModal extends PureComponent {
    state = {
        modal: null,
        opened: false,
        pulse: false
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleDocumentKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
    }

    handleDocumentKeyDown = (event) => {
        if (event.keyCode === KEY_CODE.esc) {
            this.close();
        }
    };

    handleClick = () => {
        this.setState({pulse: true});
        setTimeout(() => this.setState({pulse: false}), 1000);
    };

    open = (props) => {
        const {
            title,
            subTitle,
            content = '',
            closeOnSubmit = true,
            submitText = 'Ok',
            cancelText = 'Отмена',
            style
        } = props;

        return new Promise((resolve, reject) => {
            const modal = (
                <div {...classes('container', {[style]: !!style})}>
                    <div {...classes('header')}>
                        <h4 {...classes('title')}>{title}</h4>
                        {subTitle && <h6 {...classes('sub-title')}>{subTitle}</h6>}
                    </div>

                    <div {...classes('body')}>
                        {content}
                    </div>

                    <div {...classes('footer')}>
                        <Button
                            {...classes('button', 'cancel')}
                            text={cancelText}
                            style='inline'
                            onClick={() => {
                                reject(props);
                                this.close();
                            }}
                        />

                        <Button
                            {...classes('button', 'submit')}
                            text={submitText}
                            style='success'
                            onClick={() => {
                                resolve(props);
                                if (closeOnSubmit) this.close();
                            }}
                        />
                    </div>
                </div>
            );

            this.setState({opened: true, modal});
        });
    };

    close = () => {
        this.setState({
            opened: false,
            modal: null
        });
    };

    render() {
        const {opened, modal, pulse} = this.state;

        return (
            <div {...classes('', {opened})} onClick={this.handleClick}>
                <div {...classes('container-wrapper', {pulse})}>
                    {modal}
                </div>
            </div>
        );
    }
}
