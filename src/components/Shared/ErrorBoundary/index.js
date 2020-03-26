import React from 'react';
import './error-boundary.scss';

const cls = new Bem('error-boundary');

export default class ErrorBoundary extends React.Component {
    state = {
        error: null,
        errorInfo: null,
    };

    componentDidCatch(error, errorInfo) {
        // Можно также сохранить информацию об ошибке в соответствующую службу журнала ошибок
        this.setState({error, errorInfo});
    }

    render() {
        const { error, errorInfo } = this.state;
        const { children } = this.props;
        const isError = errorInfo || error;

        return (
            <>
                {isError ? (
                    <div {...cls()}>
                        <div {...cls('header')}>
                            <h3 {...cls('header-title')}>Внимание. Что-то пошло не так.</h3>
                        </div>
                        <div {...cls('body')}>
                            <details style={ { whiteSpace: 'pre-wrap' } }>
                                { error && error.toString() }
                                <br/>
                                { errorInfo.componentStack }
                            </details>
                        </div>
                    </div>
                ): children}
            </>
        );
    }
}
