import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactTags from 'react-tag-autocomplete';
import './input-tags.scss';
import Loader from '../../Shared/Loader/Loader';

const classes = new Bem('input-tags');
const Tag = ({classNames, tag, onDelete}) => (
    <div className={classNames.selectedTag} onClick={onDelete}>{tag.name}</div>
);

export default class InputTags extends Component {
    static propTypes = {
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
        placeholder: 'Добавить...'
    };

    state = {
        suggestions: [],
        inProgress: false
    };

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

    debouncedSearch = _.debounce((value) => {
        if (this.props.requestCancelService) this.props.requestCancelService();

        this.setState({inProgress: true}, () => {
            this.props.requestService({'query[name]': value}).then(response => {
                // filter selected
                const suggestions = response.data.filter(({name}) => !this.props.tags.find(tag => tag.name !== name));

                this.setState({
                    inProgress: false,
                    suggestions
                });
            });
        });
    }, 1000);

    render() {
        const {label, tags, placeholder} = this.props;
        const {inProgress} = this.state;
        const suggestions = this.props.suggestions || this.state.suggestions;

        return (
            <div {...classes()}>
                <label {...classes('label')}>
                    {label && <span {...classes('label-text', '', 'drag-handle')}>{label}</span>}

                    <ReactTags
                        {...classes('field')}
                        autofocus={false}
                        tags={tags}
                        suggestions={suggestions}
                        /* eslint-disable */
                        handleDelete={this.handleDelete}
                        handleAddition={this.handleAddition}
                        handleInputChange={this.handleInputChange}
                        /* eslint-enable */
                        placeholder={placeholder}
                        allowNew
                        tagComponent={Tag}
                    />
                </label>

                {inProgress && (
                    <Loader
                        {...classes('loader')}
                        radius={5}
                        strokeWidth={2}
                    />
                )}
            </div>
        );
    }
}
