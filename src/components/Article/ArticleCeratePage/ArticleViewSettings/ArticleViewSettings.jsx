import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../Shared/ConfirmModal/ConfirmModal';
import {StorageService} from '../../../../services';
import './article-view-settings.scss';
import ActiveMark from '../../../Shared/ActiveMark/ActiveMark';
import {STORAGE_KEY} from '../../../../constants/LocalStorageKeys';

const classes = new Bem('article-view-settings');

export default class ArticleViewSettings extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired
    };

    state = {
        active: StorageService.get(STORAGE_KEY.ARTICLE_VIEW_TYPE) || 1
    };

    handleChangeView = (key) => {
        this.setState({active: key});
        StorageService.set(STORAGE_KEY.ARTICLE_VIEW_TYPE, key);
        this.props.onChange(key);
        setTimeout(() => this.props.onClose(), 1000);
    };

    render() {
        const {onClose} = this.props;

        return (
            <ConfirmModal
                title='Отображение статей'
                onClose={onClose}
                buttons={[]}
                width='wide'
            >
                <div {...classes('cards')}>
                    {[1, 2, 3, 4].map(key => (
                        <div
                            {...classes('card')}
                            key={key}
                            onClick={() => this.handleChangeView(key)}
                        >
                            <img
                                {...classes('card-image')}
                                src={require(`./images/view-${key}.png`)}
                                alt='view-type'
                            />

                            {this.state.active === key && (
                                <ActiveMark {...classes('active-mark')}/>
                            )}
                        </div>
                    ))}
                </div>
            </ConfirmModal>
        );
    }
}
