import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactTags from 'react-tag-autocomplete';
import './input-tags.scss';

const classes = new Bem('input-tags');
const Tag = ({classNames, tag, onDelete}) => (
    <div className={classNames.selectedTag} onClick={onDelete}>{tag.name}</div>
);

export default class InputTags extends Component {
    static propTypes = {
        tags: PropTypes.array,
        suggestions: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        searchPromiseFn: PropTypes.func,
        placeholder: PropTypes.string
    };

    static defaultProps = {
        placeholder: 'Добавить...'
    };

    state = {
        suggestions: this.props.suggestions || null,
        busy: false
    };

    handleInputChange = (value) => {
        if (this.props.searchPromiseFn && !this.state.busy) {
            this.setState({busy: true}, () => {
                return this.props.searchPromiseFn({search: value}).then(response => {
                    this.setState({
                        suggestions: response.data,
                        busy: false
                    });
                });
            });
        }
    };

    handleDelete = (i) => {
        console.log(i);
        const tags = this.props.tags.slice(0);

        tags.splice(i, 1);
        this.props.onChange(tags);
    };

    handleAddition = (tag) => {
        const tags = [].concat(this.props.tags, tag);

        this.props.onChange(tags);
    };

    render() {
        const {label, tags, suggestions, placeholder} = this.props;

        return (
            <div {...classes()}>
                <label {...classes('label')}>
                    {label && <span {...classes('label-text')}>{label}</span>}

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
            </div>
        );
    }
}
