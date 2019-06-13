import React, {PureComponent} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import './vertical-menu.scss';
import PencilIcon from '../../Shared/SvgIcons/PencilIcon';

const classes = new Bem('vertical-menu');

export default class VerticalMenu extends PureComponent {
    static propTypes = {
        activeId: PropTypes.string,
        className: PropTypes.string,
        list: PropTypes.array,
        onClick: PropTypes.func,
        autoOpen: PropTypes.bool // auto open parents with children
    };

    componentDidMount() {
        if (this.props.autoOpen) {
            // setTimeout(() => {
            this.props.list.forEach(item => {
                if (item.children && item.children.length) {
                    item.open = true;
                }
            });
            this.forceUpdate();
            // }, 500);
        }
    }

    modifyChildren = (child) => {
        const props = classes('item-icon');

        return React.cloneElement(child, props);
    };

    itemRefs = {};

    childRefs = {};

    lastFocused = null;

    render() {
        const {activeId, list, className} = this.props;

        if (this.lastFocused) {
            this.lastFocused.focus();
        }

        return (
            <ul {...classes('', '', className)} ref={node => this.list = node}>
                {(list || []).map((item, itemKey) => (
                    <li
                        ref={node => this.itemRefs[itemKey] = node}
                        {...classes('item', {active: !!activeId && activeId === item.id, open: item.open})}
                        key={itemKey}
                        tabIndex={0}
                    >
                        {item.link ? (
                            <Link
                                to={item.link}
                                {...classes('item-caption')}
                                onClick={() => {
                                    item.open = !item.open;
                                    this.forceUpdate();
                                }}
                            >
                                {item.icon && this.modifyChildren(item.icon)}

                                <span {...classes('item-link')}>{item.name}</span>

                                {(item.children && !!item.children.length) &&
                                <ArrowIcon {...classes('arrow-icon')}/>}
                            </Link>
                        ) : (
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
                        )}

                        <ul {...classes('sub-list')}>
                            {item.children && item.children.map((child, childIndex) => (
                                <li
                                    {...classes('sub-list-item', {active: activeId && activeId === child.id})}
                                    key={childIndex}
                                    ref={node => this.childRefs[`${itemKey}${childIndex}`] = node}
                                    tabIndex={0}
                                >
                                    <Link
                                        to={child.link}
                                        {...classes('item-link')}
                                    >
                                        <span {...classes('child-title')}>{child.name}</span>
                                    </Link>

                                    {child.editLink && (
                                        <Link to={child.editLink} {...classes('item-button')}>
                                            <PencilIcon size={{width: 16, height: 16}}/>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        );
    }
}
