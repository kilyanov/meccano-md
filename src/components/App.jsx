import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {AuthService, DocumentService, StorageService} from "../services";
import {EventEmitter} from "../helpers";
import {NotificationContainer} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import '../assets/styles/main.scss';
import {storeMainActions} from '../redux/storeMainActions';
import {InitScrollbar} from '../helpers/Tools';
import {EVENTS} from '../constants/Events';
import OperatedNotification from './Shared/OperatedNotifiction/OperatedNotification';
import QueueManager from './Shared/QueeManager/QueueManager';
import NotificationsPanel from './Shared/NotificationsPanel/NotificationsPanel';
import store from '../redux/store';
import {switchTheme} from '../redux/actions/theme';
import {THEME_TYPE} from '../constants/ThemeType';
import Notification from "../helpers/Notification";
import {DOCUMENT_STATUS} from "../constants/DocumentStatus";
import {saveAs} from "file-saver";
import {getDocuments} from "../redux/actions/document";
import {profile} from "../redux/reducers/profile";

const cls = new Bem('app');

export default class App extends Component {
    static propTypes = {
        children: PropTypes.node,
        profile: PropTypes.object
    };

    constructor(props) {
        super(props);

        const self = this;

        AuthService.checkAuthorization();

        EventEmitter.setMaxListeners(0);
        EventEmitter.on(EVENTS.REDIRECT, (url, callback) => {
            self.setState({redirect: url}, () => {
                self.setState({redirect: false}, callback);
            });
        });

        EventEmitter.on(EVENTS.OPERATED_NOTIFICATION.SHOW, notification => this.setState({notification}));
        EventEmitter.on(EVENTS.OPERATED_NOTIFICATION.HIDE, () => this.setState({notification: null}));
    }

    state = {
        redirect: false,
        notification: null,
        theme: '',
        profile: {}
    };

    componentDidMount() {
        if (AuthService.isAuth()) {
            storeMainActions();
        }

        if (this.containerRef) {
            InitScrollbar(this.bodyRef);
        }

        const storeState = this.getCurrentStateFromStore();

        if (storeState.theme) {
            this.setState({theme: storeState.theme});
        }

        this.unsubscribeStore = store.subscribe(this.updateStateFromStore);

        const theme = StorageService.get('theme');

        if (theme && theme !== THEME_TYPE.LIGHT) {
            store.dispatch(switchTheme());
        }
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.REDIRECT, () => {});
        EventEmitter.off(EVENTS.OPERATED_NOTIFICATION.SHOW, () => {});
        EventEmitter.off(EVENTS.OPERATED_NOTIFICATION.HIDE, () => {});
        window.removeEventListener('load', () => {});
        this.unsubscribeStore();
    }

    handleScroll = (event) => {
        const {target} = event;
        const isEndPage = target.scrollTop === target.scrollHeight - target.clientHeight;

        if (isEndPage) EventEmitter.emit(EVENTS.APP_CONTAINER_SCROLL_END);
    };

    handleDownloadDocument = (transactionId) => {
        DocumentService.download(transactionId).then(response => {
            const blob = new Blob([response.data], {type: 'application/octet-stream'});

            saveAs(blob, response.headers['x-filename']);
        });
    };

    getCurrentStateFromStore = () => {
        return {
            theme: store.getState().theme,
            profile: store.getState().profile
        };
    };

    getDocumentsForUser = () => {
        const {profile} = this.state;

        if (_.isEmpty(profile) || !profile.id) return;

        const form = {
            sort: '-updated_at',
            userId: profile.id,
            page: 1,
            pageSize: 5
        };

        DocumentService.get('', form)
            .then(response => {
                if (response.data && response.data.length) {
                    response.data.forEach(document => {
                        document.date = document.updatedAt;
                        Notification.toPanel({
                            category: 'Документы',
                            title: document.name,
                            // link: `/documents/${document.transactionId}`,
                            transactionId: document.transactionId,
                            message: DOCUMENT_STATUS[document.status],
                            buttons: [{
                                label: 'Скачать',
                                onClick: () => this.handleDownloadDocument(document.transactionId)
                            }]
                        });
                    });
                }
            });
    };

    updateStateFromStore = () => {
        const currentState = this.getCurrentStateFromStore();

        if (this.state.theme !== currentState.theme) {
            this.setState({theme: currentState.theme});
        }

        if (currentState.profile && currentState.profile.id !== this.state.profile.id) {
            this.setState({profile: currentState.profile}, () => {
                store.dispatch(getDocuments(currentState.profile.id));

                if (currentState.profile.types && currentState.profile.types.length) {
                    const storageUserType = StorageService.get('user_type');

                    if (!storageUserType || !currentState.profile.types.find(({id}) => id === storageUserType)) {
                        StorageService.set('user_type', currentState.profile.types[0].id);
                    }
                }
                // this.getDocumentsForUser();
            });
        }
    };

    render() {
        const {children} = this.props;
        const {redirect, notification, theme} = this.state;

        return redirect ? (
            <Redirect push to={redirect}/>
        ) : (
            <Fragment>
                <div
                    {...cls('', {blur: false, [theme]: !!theme})}
                    ref={node => this.containerRef = node}
                    onScroll={this.handleScroll}
                >
                    <NotificationContainer/>
                    <QueueManager/>

                    {children}

                    {notification && (
                        <OperatedNotification
                            /* eslint-disable */
                            onSubmit={notification.onSubmit}
                            onCancel={notification.onCancel}
                            /* eslint-enable */
                            message={notification.message}
                            title={notification.title}
                            submitButtonText={notification.submitButtonText}
                            cancelButtonText={notification.cancelButtonText}
                            type={notification.type}
                            closeOnClick={notification.closeOnClick}
                            timeOut={notification.timeOut}
                        />
                    )}
                </div>
                <NotificationsPanel/>
            </Fragment>
        );
    }
}
