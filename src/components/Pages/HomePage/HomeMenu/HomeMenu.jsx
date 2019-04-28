import React, {PureComponent} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import ArrowIcon from '../../../Shared/SvgIcons/ArrowIcon';
import './home-menu.scss';
import { KEY_CODE } from '../../../../constants/KeyCode';
import PencilIcon from '../../../Shared/SvgIcons/PencilIcon';

const classes = new Bem('home-menu');

export default class HomeMenu extends PureComponent {
    static propTypes = {
        list: PropTypes.array,
        onClick: PropTypes.func
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event) => {
        const activeElement = document.activeElement;
        const listItems = Array.from(this.list.childNodes);

        let activeItemIndex = listItems.findIndex(child => child === activeElement);

        let subList = listItems[activeItemIndex] && listItems[activeItemIndex].querySelector('.home-menu__sub-list');

        // Find active element in Sub Lists
        if (
            activeElement.parentElement &&
            activeElement.parentElement.classList.contains('home-menu__sub-list')
        ) {
            subList = activeElement.parentElement;
            activeItemIndex = listItems.findIndex(child => child === subList.parentNode);
        }

        const subListChilds = subList && Array.from(subList.childNodes);
        const activeChildIndex = subListChilds && subListChilds.findIndex(child => child === document.activeElement);

        switch (event.keyCode) {
            case KEY_CODE.arrows.down:
                if (subListChilds && subListChilds.length && this.props.list[activeItemIndex].open) {
                    if (activeChildIndex !== -1) {
                        if (subListChilds[activeChildIndex + 1]) {
                            subListChilds[activeChildIndex + 1].focus();
                        } else this.setNextItem(activeItemIndex);
                    } else subListChilds[0].focus();
                } else this.setNextItem(activeItemIndex);
                break;
            case KEY_CODE.arrows.up:
                if (subListChilds && subListChilds.length && this.props.list[activeItemIndex].open) {
                    if (activeChildIndex !== -1) {
                        if (subListChilds[activeChildIndex - 1]) {
                            subListChilds[activeChildIndex - 1].focus();
                        } else this.setPrevItem(activeItemIndex + 1);
                    } else subListChilds[0].focus();
                } else this.setPrevItem(activeItemIndex);
                break;
            case KEY_CODE.arrows.right:
                if (activeItemIndex !== -1) {
                    if (subListChilds.length) {
                        this.props.list[activeItemIndex].open = true;
                        this.lastFocused = listItems[activeItemIndex];
                        this.forceUpdate();
                    }
                }
                break;
            case KEY_CODE.arrows.left:
                if (activeItemIndex !== -1) {
                    if (subListChilds.length) {
                        this.props.list[activeItemIndex].open = false;
                        this.forceUpdate();
                    }
                }
                break;
            case KEY_CODE.enter:
                if (activeItemIndex !== -1 && activeChildIndex === -1) {
                    if (subListChilds.length) {
                        this.props.list[activeItemIndex].open = !this.props.list[activeItemIndex].open;
                        this.forceUpdate();
                    }
                }
                break;
            default:
                break;
        }
    };

    setNextItem(activeItemIndex) {
        const listItems = Array.from(this.list.childNodes);

        if (activeItemIndex !== -1) {
            if (listItems[activeItemIndex + 1]) {
                listItems[activeItemIndex + 1].focus();
            } else {
                listItems[0].focus();
            }
        } else listItems[0].focus();
    }

    setPrevItem(activeItemIndex) {
        const listItems = Array.from(this.list.childNodes);

        if (activeItemIndex !== -1) {
            if (listItems[activeItemIndex - 1]) {
                listItems[activeItemIndex - 1].focus();
            } else {
                listItems[listItems.length - 1].focus();
            }
        } else listItems[listItems.length - 1].focus();
    }

    modifyChildren = (child) => {
        const props = {className: 'home-menu__item-icon'};

        return React.cloneElement(child, props);
    };

    itemRefs = {};

    childRefs = {};

    lastFocused = null;

    render() {
        const {list, onClick} = this.props;

        if (this.lastFocused) {
            this.lastFocused.focus();
        }

        return (
            <ul {...classes()} ref={node => this.list = node}>
                {(list || []).map((item, itemKey) => (
                    <li
                        ref={node => this.itemRefs[itemKey] = node}
                        {...classes('item', {open: item.open})}
                        key={itemKey}
                        tabIndex={0}
                    >
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
                                <li
                                    {...classes('sub-list-item')}
                                    key={childIndex}
                                    ref={node => this.childRefs[`${itemKey}${childIndex}`] = node}
                                    tabIndex={0}
                                >
                                    <Link to={child.link} {...classes('item-link')} onClick={() => onClick(item.name)}>
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
