import React from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Button from '../Button/Button';
import BEMHelper from 'react-bem-helper';
import InfoIcon from '../SvgIcons/InfoIcon';
import './buttons-modal.scss';

const cls = new BEMHelper('buttons-modal');

export default function ButtonsModal({
    Icon = InfoIcon,
    title,
    description,
    onClose,
    buttons,
    withCancel,
    cancelLabel = 'Отмена'
}) {
    return !!buttons.length && (
        <ConfirmModal
            { ...cls() }
            onClose={onClose}
            buttons={[]}
        >
            {Icon && (
                <div { ...cls('icon-wrapper') }>
                    <Icon { ...cls('icon') } />
                </div>
            )}

            <div { ...cls('title') }>{title}</div>

            {description && <p { ...cls('description') }>{description}</p>}

            <div { ...cls('buttons') }>
                {buttons.map((button, buttonIndex) => (
                    <Button
                        { ...cls('button', { primary: button.primary }) }
                        key={buttonIndex}
                        onClick={() => {
                            button.onClick();
                            onClose();
                        }}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>

            {withCancel && (
                <div { ...cls('buttons') }>
                    <Button
                        { ...cls('button', 'cancel') }
                        onClick={() => onClose()}
                    >
                        {cancelLabel}
                    </Button>
                </div>
            )}
        </ConfirmModal>
    );
}

ButtonsModal.propTypes = {
    title: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
            primary: PropTypes.bool,
            color: PropTypes.string
        })
    ),
    description: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    withCancel: PropTypes.bool,
    cancelLabel: PropTypes.string
};
