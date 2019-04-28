import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import InputText from '../../../Form/InputText/InputText';

const classes = new Bem('section-tree-add-item');

export default class SectionTreeAddItem extends Component {
    static propTypes = {
        item: PropTypes.object,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    state = {
        name: _.get(this.props, 'item.name') || ''
    };

    handleChange = (name) => {
        this.setState({name});
    };

    handleSubmit = () => {
        const {name} = this.state;

        this.props.onSubmit(name);
        this.props.onClose();
    };

    render() {
        const {onClose, item} = this.props;
        const {name} = this.state;

        return (
            <ConfirmModal
                {...classes()}
                onClose={onClose}
                submitText={item ? 'Обновить' : 'Добавить'}
                onSubmit={this.handleSubmit}
                width='small'
            >
                <InputText
                    autoFocus
                    {...classes('field')}
                    label='Название'
                    value={name}
                    onChange={this.handleChange}
                />
            </ConfirmModal>
        );
    }
}
