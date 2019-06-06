import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './unselected-property.scss';
import CheckIcon from '../../../../Shared/SvgIcons/CheckIcon';

const classes = new Bem('unselected-property');

export default class UnselectedProperty extends Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        selected: PropTypes.bool,
        onDoubleClick: PropTypes.func.isRequired
    };

    render() {
        const {item, selected, onDoubleClick} = this.props;

        return (
            <div
                {...classes('', {selected})}
                data-id={item.code}
                onDoubleClick={() => onDoubleClick(item.code)}
            >
                {item.name}

                <span {...classes('selected-icon')}>
                    <CheckIcon/>
                </span>
            </div>
        );
    }
}
