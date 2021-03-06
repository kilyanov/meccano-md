import React, {Component} from 'react';
import {connect} from 'react-redux';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import store from '../../../../redux/store';
import {closeSettingsMenu} from '../../../../redux/actions';
import {isMobileScreen} from '../../../../helpers/Tools';
import './left-sidebar.scss';

const cls = new Bem('left-sidebar');
class SettingsLeftSidebar extends Component {
    componentDidMount() {
        store.dispatch(closeSettingsMenu());
    }

    render() {
        const {settingsMenu = {open: false}} = this.props;
        const isOpen = isMobileScreen() && settingsMenu.open;

        return (
            <aside {...cls('', {open: isOpen})}>
                <SettingsMenu />
            </aside>
        );
    }
}

const mapStateToProps = ({settingsMenu}) => ({settingsMenu});

export default connect(mapStateToProps)(SettingsLeftSidebar);
