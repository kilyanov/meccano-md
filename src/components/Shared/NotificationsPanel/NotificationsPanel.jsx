import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './notifications-panel.scss';
import store from '../../../redux/store';
import {closeNotificationPanel, deleteNotification} from '../../../redux/actions/notificationsPanel';
import PanelNotification from './PanelNotification/PanelNotification';

const classes = new Bem('notifications-panel');

class NotificationsPanel extends Component {
    static propTypes = {
        notificationsPanel: PropTypes.object
    };

    state = {
        currentDateTime: moment()
    };

    componentDidMount() {
        this.currentDateTimeInterval = setInterval(() => {
            this.setState({currentDateTime: moment()});
        }, 30000);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.notificationsPanel.open) {
            document.addEventListener('click', this.handleClickOutside);
        } else {
            document.removeEventListener('click', this.handleClickOutside);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        this.currentDateTimeInterval = null;
    }

    handleClickOutside = (event) => {
        const {notificationsPanel} = this.props;
        const isInnerClick = this.domNode && this.domNode.contains(event.target);

        if (!isInnerClick && notificationsPanel.open) {
            store.dispatch(closeNotificationPanel());
        }
    };

    handleCloseNotification = ({id}) => {
        store.dispatch(deleteNotification(id));
    };

    currentDateTimeInterval = null;

    render() {
        const {notificationsPanel} = this.props;
        const {currentDateTime} = this.state;

        return (
            <aside {...classes('', {open: notificationsPanel.open})} ref={ref => this.domNode = ref}>
                <section {...classes('header')}>
                    <div {...classes('header-column')}>
                        <h3 {...classes('header-title')}>Уведомления</h3>
                        <span {...classes('current-date')}>{currentDateTime.format('[Сегодня] D MMMM')}</span>
                    </div>
                    <div {...classes('header-column')}>
                        <span {...classes('header-time')}>{currentDateTime.format('HH:mm')}</span>
                    </div>
                </section>

                <section {...classes('notifications')}>
                    {notificationsPanel.notifications.map((notification) => (
                        <PanelNotification
                            key={notification.id}
                            notification={notification}
                            onClose={this.handleCloseNotification}
                        />
                    ))}
                </section>

                <section {...classes('footer')} />

                {/* <button {...classes('button-close')}>✕</button> */}
            </aside>
        );
    }
}

export default connect(({notificationsPanel}) => ({notificationsPanel}))(NotificationsPanel);
