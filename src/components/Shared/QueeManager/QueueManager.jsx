import React, {Component} from 'react';
import QueueManagerItem from './QueueManagerItem/QueueManagerItem';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';
import './queue-manager.scss';

const classes = new Bem('queue-manager');

export default class QueueManager extends Component {
    state = {
        queueItems: []
    };

    componentDidMount() {
        EventEmitter.on(EVENTS.QUEUE_MANAGER.PUSH, this.handlePush);
        EventEmitter.on(EVENTS.QUEUE_MANAGER.REMOVE, this.handleRemove);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.QUEUE_MANAGER.PUSH, this.handlePush);
        EventEmitter.off(EVENTS.QUEUE_MANAGER.REMOVE, this.handleRemove);
    }

    handlePush = (message) => {
        const {queueItems} = this.state;

        queueItems.unshift(message);
        this.setState({queueItems});
    };

    handleRemove = (queueId) => {
        const newState = this.state;

        newState.queueItems = newState.queueItems.filter(({id}) => id !== queueId);
        this.setState(newState);
    };

    render() {
        const {queueItems} = this.state;

        return (
            <section {...classes()}>
                {queueItems.map((queue, key) =>
                    <QueueManagerItem
                        key={key}
                        queue={queue}
                        onCLick={() => this.handleRemove(key)}
                    />
                )}
            </section>
        );
    }
}
