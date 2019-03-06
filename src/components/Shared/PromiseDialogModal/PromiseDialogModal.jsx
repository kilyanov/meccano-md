import React, {Fragment, PureComponent} from 'react';
import './dialog-modal.scss';
import Button from '../Button/Button';

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
            cancelText = 'Отмена'
        } = props;

        return new Promise((resolve, reject) => {
            const classes = new Bem('dialog-modal');
            const modal = (
                <Fragment>
                    <div {...classes('header')}>
                        <h4 {...classes('title')}>{title}</h4>
                        {subTitle && <h6 {...classes('sub-title')}>{subTitle}</h6>}
                    </div>

                    <div {...classes('body')}>
                        {content}
                    </div>

                    <div {...classes('footer')}>
                        <Button
                            {...classes('button')}
                            text={cancelText}
                            style='inline'
                            onClick={() => {
                                reject(props);
                                this.close();
                            }}
                        />

                        <Button
                            {...classes('button')}
                            text={submitText}
                            style='success'
                            onClick={() => {
                                resolve(props);
                                if (closeOnSubmit) this.close();
                            }}
                        />
                    </div>
                </Fragment>
            );

            this.setState({opened: true, modal});
        });
    };

    close = () => {
        this.setState({opened: false});
    };

    classes = new Bem('dialog-modal');

    render() {
        const {opened, modal} = this.state;

        return <div {...this.classes('', {opened})}>{modal}</div>;
    }
}
