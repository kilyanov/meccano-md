import React, {PureComponent} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import ArrowIcon from '../../../Shared/SvgIcons/ArrowIcon';
import './project-list.scss';

const classes = new Bem('project-list');

export default class ProjectList extends PureComponent {
    static propTypes = {
        list: PropTypes.array,
        onClick: PropTypes.func
    };

    modifyChildren = (child) => {
        const props = {className: 'project-list__item-icon'};

        return React.cloneElement(child, props);
    };

    render() {
        const {list, onClick} = this.props;

        return (
            <ul {...classes()}>
                {(list || []).map((item, itemKey) => (
                    <li {...classes('item', {open: item.open})} key={itemKey}>
                        <div
                            {...classes('item-caption')}
                            onClick={() => {
                                item.open = !item.open;
                                this.forceUpdate();
                            }}
                        >
                            {item.icon && this.modifyChildren(item.icon)}
                            <span {...classes('item-title')}>{item.name}</span>
                            {(item.children && !!item.children.length) &&
                                <ArrowIcon {...classes('arrow-icon')}/>}
                        </div>

                        <ul {...classes('sub-list')}>
                            {item.children && item.children.map((child, childIndex) => (
                                <li {...classes('sub-list-item')} key={childIndex}>
                                    <Link to={child.link} {...classes('item-link')} onClick={() => onClick(item.name)}>
                                        <span {...classes('child-title')}>{child.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        );
    }
}
