import React  from 'react';

import PropTypes from 'prop-types';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    IconButton
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { alertDialogStyles } from './styles';


const AlertDialog = ({
    title,
    onClose,
    open,
    onSubmit,
    onCancel,
    submitText = 'Ok',
    cancelText = 'Отмена',
    closeAfterCancel = false,
    closeAfterSubmit = false,
    cancelDisabled = false,
    submitDisabled = false,
    cancelColor = 'primary',
    submitColor = 'primary',
    children
}) => {
    const classes = alertDialogStyles();

    const handleCancel = () => {
        onCancel();
        if (closeAfterCancel) {
            onClose();
        }
    };

    const handleSubmit = () => {
        onSubmit();
        if (closeAfterSubmit) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            {title && (
                <DialogTitle disableTypography>
                    <Typography variant='h6'>{title}</Typography>
                    <IconButton
                        aria-label="close"
                        className={classes.closeButton}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            )}
            <DialogContent>
                {children}
            </DialogContent>
            {(onCancel || onSubmit) && (
                <DialogActions>
                    {onCancel && (
                        <Button
                            className={classes.button}
                            onClick={handleCancel}
                            color={cancelColor}
                            disabled={cancelDisabled}
                        >
                            {cancelText}
                        </Button>
                    )}

                    {onSubmit && (
                        <Button
                            className={classes.button}
                            onClick={handleSubmit}
                            color={submitColor}
                            disabled={submitDisabled}
                        >
                            {submitText}
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
};

AlertDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    cancelColor: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'default']),
    submitColor: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'default'])
};

export default AlertDialog;
