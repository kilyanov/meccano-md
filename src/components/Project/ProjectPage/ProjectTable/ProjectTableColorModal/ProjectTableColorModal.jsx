import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ConfirmModal from "../../../../Shared/ConfirmModal/ConfirmModal";
import BEMHelper from "react-bem-helper";
import {ArticleService} from "../../../../../services";
import ColorPicker from 'rc-color-picker';
import Loader from "../../../../Shared/Loader/Loader";
import 'rc-color-picker/assets/index.css';
import './project-table-color-modal.scss';
import {setArticleColors} from "../../../../../redux/actions/articleColors";

const cls = new BEMHelper('project-table-color-modal');
const TYPES = {
    'complete_monitor': 'Готовность для мониторщика',
    'complete_analytic': 'Готовность для аналитика',
    'complete_client': 'Готовность для клиента'
};

class ProjectTableColorModal extends Component {
    static propTypes = {
        articleColors: PropTypes.array
    };

    constructor(props) {
        super(props);

        const colors = {};

        if (props && props.articleColors && props.articleColors.length) {
            props.articleColors.forEach(item => {
                colors[item.type] = {...item, ...this.parseColor(item.color)};
            });
        }

        this.state = {
            colors,
            inProgress: false
        };
    }

    handleSetColor = ({color, alpha}, key) => {
        const hexAlpha = Math.round(alpha * 255 / 100).toString(16);

        this.setState(state => {
            if (!state.colors[key]) state.colors[key] = {};

            state.colors[key].color = color + hexAlpha;
            state.colors[key].alpha = alpha;
            return state;
        });
    };

    handleSubmit = (type) => {
        const { projectId } = this.props;
        const { colors } = this.state;
        const form = {type, color: colors[type].color};

        this.setState({inProgress: true}, () => {
            ArticleService.color[colors[type].id ? 'update' : 'create'](projectId, form, colors[type].id)
                .then(this.getArticleColors);
        });
    };

    getArticleColors = () => {
        ArticleService.color.get(this.projectId).then(response => {
            if (response.data) {
                this.props.onSetArticleColors(response.data);
                this.setState({inProgress: false});
            }
        });
    };

    parseColor = (color) => {
        const parsed = {
            color: color.substr(0, 7),
            alpha: color.substr(7) || 'ff'
        };

        parsed.alpha = Math.round(parseInt(parsed.alpha, 16) / 255 * 100);

        return parsed;
    };

    render() {
        const { onClose } = this.props;
        const { colors, inProgress } = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Цветовое выделение строк'
                onClose={onClose}
                buttons={[]}
            >
                {Object.keys(TYPES).map(key => (
                    <div {...cls('item')} key={key}>
                        <div {...cls('item-label')}>{TYPES[key]}</div>
                        <div {...cls('item-value')}>
                            <ColorPicker
                                {...cls('item-field')}
                                color={colors[key] && colors[key].color || ''}
                                defaultColor='#ffffff'
                                alpha={colors[key] && colors[key].alpha || 100}
                                mode='RGB'
                                onChange={value => this.handleSetColor(value, key)}
                                onClose={() => this.handleSubmit(key)}
                            />
                        </div>
                    </div>
                ))}

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}

function mapStateTpProps(state) {
    return {
        articleColors: state.articleColors
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetArticleColors: (colors) => dispatch(setArticleColors(colors))
    };
}

export default connect(mapStateTpProps, mapDispatchToProps)(ProjectTableColorModal);
