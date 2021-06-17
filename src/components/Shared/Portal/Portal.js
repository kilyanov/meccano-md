import { Component } from 'react'
import { createPortal } from 'react-dom'

class Portal extends Component {
    render() {
        const { children, target = document.body } = this.props;
        return createPortal(children, target);
    }
}

export default Portal
