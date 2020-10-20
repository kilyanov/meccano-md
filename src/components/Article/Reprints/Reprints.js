import React from 'react';
import PropTypes from 'prop-types';
import Reprint from './Reprint/Reprint';
import Button from '../../Shared/Button/Button';

import './reprints.scss';

const cls = new Bem('reprints');

function Reprints({ reprints, onFieldChange, onAddReprint, onDeleteReprint }) {
    return (
        <div {...cls()}>
            {reprints.length
                ? reprints.map((reprint, index) => {
                    return (
                        <Reprint
                            key={index}
                            index={index}
                            onFieldChange={onFieldChange}
                            onDeleteReprint={onDeleteReprint}
                            {...reprint}
                            date={new Date(reprint.date)}
                        />
                    );
                })
                : <p {...cls('no-reprints')}>Нет перепечаток</p>
            }
            <Button
                {...cls('add-button')}
                text="Добавить перепечатку"
                onClick={onAddReprint}
            />
        </div>
    );
}

Reprints.propTypes = {
    reprints: PropTypes.array,
    onFieldChange: PropTypes.func,
    onAddReprint: PropTypes.func,
    onDeleteReprint: PropTypes.func
};

export default Reprints;
