import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ProjectService, UserService} from "../../../services";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import Select from 'react-select';
import {ReactSelectStyles} from "../../../constants/ReactSelectStyles";
import Loader from "../../Shared/Loader/Loader";
import {THEME_TYPE} from "../../../constants";
import {connect} from "react-redux";
import {NotificationManager} from "react-notifications";

class ArticleTransferModal extends Component {
    static propTypes = {
        theme: PropTypes.string,
        onClose: PropTypes.func.isRequired,
        onUpdateParent: PropTypes.func.isRequired
    };

    state = {
        users: [],
        selectedUser: null,
        inProgress: true
    };

    componentDidMount() {
        UserService.project.getList(this.props.projectId).then(response => {
            this.setState({
                users: response.data.map(({user}) => ({label: user.username, value: user.id})),
                inProgress: false
            });
        });
    }

    handleSubmit = () => {
        const { articleIds } = this.props;
        const { selectedUser } = this.state;

        if (articleIds.length && selectedUser) {
            const form = {
                articleIds,
                properties: {
                    user_id: selectedUser.value
                }
            };

            this.setState({inProgress: true}, () => {
                ProjectService.updateMany(form, this.props.projectId).then(() => {
                    NotificationManager.success(
                        `Статьи успешно назначены пользователю "${selectedUser.label}"`,
                        'Передача статей'
                    );
                    this.setState({
                        inProgress: false,
                        selectedUser: null
                    }, () => {
                        this.props.onUpdateParent();
                        this.props.onClose();
                    });
                });
            });
        }
    };

    render() {
        const { theme } = this.props;
        const {users, selectedUser, inProgress} = this.state;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <ConfirmModal
                title='Передача статей'
                onClose={this.props.onClose}
                onSubmit={this.handleSubmit}
                submitText='Передать'
            >
                <Select
                    value={selectedUser}
                    placeholder='Выберите пользователя'
                    classNamePrefix='select'
                    options={users}
                    onChange={value => this.setState({selectedUser: value})}
                    isSearchable
                    isClearable
                    isDisabled={this.isEdit || inProgress}
                    menuPosition='fixed'
                    styles={ReactSelectStyles(isDarkTheme)}
                />

                {inProgress && <Loader />}
            </ConfirmModal>
        );
    }
}

function mapStateToProps(state) {
    return {
        theme: state.theme
    };
}

export default connect(mapStateToProps)(ArticleTransferModal);
