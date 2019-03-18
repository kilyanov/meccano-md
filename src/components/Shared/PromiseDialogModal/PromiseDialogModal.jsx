import React, {PureComponent} from 'react';
import './dialog-modal.scss';
import Button from '../Button/Button';

const classes = new Bem('dialog-modal');

export default class PromiseDialogModal extends PureComponent {
    state = {
        modal: null,
        opened: false
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
        const {opened, modal} = this.state;

        return <div {...classes('', {opened})}>
            {modal}
            {opened && <div {...classes('overlay')} />}
        </div>;
    }
}
