import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './unselected-property.scss';
import CheckIcon from '../../../../Shared/SvgIcons/CheckIcon';

const cls = new Bem('unselected-property');

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
                {...cls('', {selected})}
                data-id={item.slug}
                onDoubleClick={() => onDoubleClick(item.slug)}
            >
                {item.name}

                <span {...cls('selected-icon')}>
                    <CheckIcon/>
                </span>
            </div>
        );
    }
}
