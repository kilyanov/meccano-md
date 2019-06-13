import React, {Component} from 'react';
import './settings-export.scss';
import SettingsPage from '../../SettingsPage/SettingsPage';

export default class SettingsExport extends Component {
    state = {
        showItemModal: false,
        selectedItem: null
    };

    render() {
        return (
            <SettingsPage
                title='Шаблоны'
                subtitle='Экспорт'
                withAddButton
                onAdd={() => this.setState({showItemModal: true, selectedItem: null})}
            >
                asd
            </SettingsPage>
        );
    }
}
