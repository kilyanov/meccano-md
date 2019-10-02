import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactTags from 'react-tag-autocomplete';
import './input-tags.scss';
import Loader from '../../Shared/Loader/Loader';
import {InitScrollbar} from '../../../helpers/Tools';

const cls = new Bem('input-tags');
const Tag = ({classNames, tag, onDelete}) =>
    <div className={classNames.selectedTag} onClick={onDelete}>{tag.name}</div>;

export default class InputTags extends Component {
    static propTypes = {
        allowNew: PropTypes.bool,
        tags: PropTypes.array,
        suggestions: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        onSearch: PropTypes.func,
        onCancelSearch: PropTypes.func,
        placeholder: PropTypes.string,
        requestService: PropTypes.func,
        requestCancelService: PropTypes.func
    };

    static defaultProps = {
        allowNew: true,
        placeholder: 'Добавить...'
    };

    state = {
        suggestions: [],
        pagination: {
            page: 1,
            perPage: 10
        },
        inProgress: false
    };

    componentDidMount() {
        if (this.props.requestService) {
            this.props.requestService().then(response => {
                console.log(response);
            });
        }
    }

    handleInputChange = (value) => {
        if (this.props.requestService) {
            this.debouncedSearch(value);
        }
    };

    handleDelete = (i) => {
        const tags = this.props.tags.slice(0);

        tags.splice(i, 1);
        this.props.onChange(tags);
    };

    handleAddition = (tag) => {
        const tags = [].concat(this.props.tags, tag);

        this.props.onChange(tags);
    };

    getList = (isPagination = false) => {
        if (!this.props.requestService) return;

        const form = {
            page: this.state.pagination.page,
            'per-page': this.state.pagination.perPage
        };

        this.props.requestService(form).then(response => {
            const pagination = {
                pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                page: +_.get(response.headers, 'x-pagination-current-page'),
                perPage: +_.get(response.headers, 'x-pagination-per-page'),
                totalCount: +_.get(response.headers, 'x-pagination-total-count')
            };
            const options = response.data.map(option => ({
                name: _.get(option, 'name'),
                value: _.get(option, 'id')
            }));

            if (!this.isMount) return;

            this.setState({
                options: isPagination ? _.uniqBy(this.state.options.concat(options), 'value') : options,
                pagination,
                inProgress: false
            }, () => {
                this.initScrollBar();
            });
        }).catch(() => this.setState({inProgress: false}));
    };

    initScrollBar = () => {
        if (!this.listRef) return;

        const scroll = InitScrollbar(this.listRef);

        if (scroll) this.scrollBar = scroll;
        else if (this.scrollBar) this.scrollBar.update();
    };

    debouncedSearch = _.debounce((value) => {
        if (this.props.requestCancelService) this.props.requestCancelService();

        this.setState({inProgress: true}, () => {
            this.props.requestService({'query[name]': value}).then(response => {
                this.setState({
                    suggestions: response.data,
                    inProgress: false
                });
            });
        });
    }, 300);

    render() {
        const {label, tags, placeholder, allowNew} = this.props;
        const {inProgress} = this.state;
        const suggestions = this.props.suggestions || this.state.suggestions;

        return (
            <div {...cls()}>
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', 'drag-handle')}>{label}</span>}

                    <ReactTags
                        {...cls('field')}
                        autofocus={false}
                        tags={tags}
                        suggestions={suggestions}
                        /* eslint-disable */
                        handleDelete={this.handleDelete}
                        handleAddition={this.handleAddition}
                        handleInputChange={this.handleInputChange}
                        /* eslint-enable */
                        placeholder={placeholder}
                        allowNew={allowNew}
                        tagComponent={Tag}
                    />
                </label>

                {inProgress && (
                    <Loader
                        {...cls('loader')}
                        radius={5}
                        strokeWidth={2}
                    />
                )}
            </div>
        );
    }
}
