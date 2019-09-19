import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './notifications-panel.scss';
import store from '../../../redux/store';
import {closeNotificationPanel, deleteNotification} from '../../../redux/actions/notificationsPanel';
import PanelNotification from './PanelNotification/PanelNotification';

const cls = new Bem('notifications-panel');

class NotificationsPanel extends Component {
    static propTypes = {
        notificationsPanel: PropTypes.object
    };

    state = {
        currentDateTime: moment()
    };

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
        this.currentDateTimeInterval = setInterval(() => {
            this.setState({currentDateTime: moment()});
        }, 30000);
    }

    componentWillUnmount() {
        this.hasListener = false;
        document.removeEventListener('click', this.handleClickOutside);
        this.currentDateTimeInterval = null;
    }

    handleClickOutside = (event) => {
        const isInnerClick = this.domNode &&
            this.domNode.contains(event.target) ||
            event.target.classList.contains('panel-notification__button');

        if (!isInnerClick && this.isOpen()) {
            store.dispatch(closeNotificationPanel());
        }
    };

    handleCloseNotification = ({id}) => {
        store.dispatch(deleteNotification(id));
    };

    handleTouchStart = (event) => {
        const firstTouch = event.touches[0];

        this.xDown = firstTouch.clientX;
        this.yDown = firstTouch.clientY;
    };

    handleTouchMove = (event) => {
        if (!this.xDown || !this.yDown) return;

        const firstTouch = event.touches[0];

        const xUp = firstTouch.clientX;
        const yUp = firstTouch.clientY;

        const xDiff = this.xDown - xUp;
        const yDiff = this.yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff < 0) {
            store.dispatch(closeNotificationPanel());
        }
    };

    handleTouchEnd = () => {
        /* reset values */
        this.xDown = null;
        this.yDown = null;
    };

    isOpen = () => {
        const style = window.getComputedStyle(this.domNode);

        return parseInt(style.right) === 0;
    };

    hasListener = false;

    currentDateTimeInterval = null;

    xDown = null;

    yDown = null;

    render() {
        const {notificationsPanel} = this.props;
        const {currentDateTime} = this.state;

        return (
            <aside
                {...cls('', {open: notificationsPanel.open})}
                ref={ref => this.domNode = ref}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
            >
                <section {...cls('header')}>
                    <div {...cls('header-column')}>
                        <h3 {...cls('header-title')}>Уведомления</h3>
                        <span {...cls('current-date')}>{currentDateTime.format('[Сегодня] D MMMM')}</span>
                    </div>
                    <div {...cls('header-column')}>
                        <span {...cls('header-time')}>{currentDateTime.format('HH:mm')}</span>
                    </div>
                </section>

                <section {...cls('notifications')}>
                    {notificationsPanel.notifications.map((notification) => (
                        <PanelNotification
                            key={notification.id}
                            notification={notification}
                            onClose={this.handleCloseNotification}
                        />
                    ))}
                </section>

                <section {...cls('footer')} />

                {/* <button {...cls('button-close')}>✕</button> */}
            </aside>
        );
    }
}

export default connect(({notificationsPanel}) => ({notificationsPanel}))(NotificationsPanel);
