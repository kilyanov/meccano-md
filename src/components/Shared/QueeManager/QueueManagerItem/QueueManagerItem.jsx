import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../Loader/Loader';
import './queue-manager-item.scss';

const classes = new Bem('queue-manager-item');
const QueueManagerItem = ({queue, onCLick = () => {}}) => {
    return (
        <div {...classes()} onClick={onCLick}>
            <span {...classes('text')}>{queue.text}</span>
            <Loader {...classes('loader')} strokeWidth={3} radius={10}/>
        </div>
    );
};

QueueManagerItem.propTypes = {
    queue: PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    })
};

export default QueueManagerItem;
