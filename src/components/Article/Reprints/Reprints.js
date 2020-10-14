import React from 'react';
import PropTypes from 'prop-types';
import Reprint from './Reprint';
import './reprints.scss';

const cls = new Bem('reprints');

function Reprints({ reprints }) {
    return (
        <div {...cls()}>
            {reprints.length
                ? reprints.map((reprint) => <Reprint key={reprint.id} {...reprint}/>)
                : <p {...cls('no-reprints')}>Нет перепечаток</p>
            }
        </div>
    );
}

Reprints.propTypes = {
    reprints: PropTypes.array
};

export default Reprints;
