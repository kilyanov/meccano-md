import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import DropDown from '../DropDown/DropDown';
import './drop-down-button.scss';

const cls = new Bem('drop-down-button');

const DropDownButton = ({
    className,
    dropDownItems,
    dropDownRight,
    onClickButton = () => {},
    buttonText,
    buttonStyle = 'default',
    children
}) => {
    const dropDownRef = useRef(null);

    return (
        <div {...cls('', '', className)}>
            <Button
                text={buttonText}
                style={buttonStyle}
                onClick={() => {
                    onClickButton();
                    if (dropDownRef.current) {
                        dropDownRef.current.toggle(
                            dropDownRight && { style: { right: 0 } }
                        );
                    }
                }}
            >
                {children}
            </Button>
            <DropDown
                ref={dropDownRef}
                items={dropDownItems}
            />
        </div>
    );
};

DropDownButton.propTypes = {
    dropDownItems: PropTypes.array,
    dropDownRight: PropTypes.bool,
    dropDownStyle: PropTypes.object,
    onClickButton: PropTypes.func,
    buttonText: PropTypes.string,
    buttonStyle: PropTypes.string
};

export default DropDownButton;
