import React from 'react';
import PropTypes from 'prop-types';
import Reprint from './Reprint';
import './reprints.scss';

const cls = new Bem('reprints');

function Reprints({ reprints, onFieldChange }) {
    return (
        <div {...cls()}>
            {reprints.length
                ? reprints.map((reprint) => <Reprint key={reprint.id} onFieldChange={onFieldChange} {...reprint}/>)
                : <p {...cls('no-reprints')}>Нет перепечаток</p>
            }
        </div>
    );
}

Reprints.propTypes = {
    reprints: PropTypes.array,
    onFieldChange: PropTypes.func
};

export default Reprints;
