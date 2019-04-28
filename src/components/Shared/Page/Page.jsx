import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Tools } from '../../../helpers/Tools';
import TopBar from '../TopBar/TopBar';
import './page.scss';

const classes = new Bem('page');

export default class Page extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node,
        withBar: PropTypes.bool,
        withContainerClass: PropTypes.bool
    };

    static defaultProps = {
        withContainerClass: true
    };

    componentDidMount() {
        // Tools.initScrollbar(this.pageRef);
    }

    componentDidUpdate() {
        // Tools.initScrollbar(this.pageRef);
    }

    render() {
        const {className, children, withBar, withContainerClass} = this.props;

        return (
            <div
                {...classes('', {'with-bar': withBar})}
                ref={node => this.pageRef = node}
            >
                {withBar && (
                    <TopBar/>
                )}

                <div
                    {...classes('content', '', {
                        container: withContainerClass,
                        [className]: !!className
                    })}
                >
                    {children}
                </div>
            </div>
        );
    }
}
