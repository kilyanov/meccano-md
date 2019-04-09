import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import DropDown from '../DropDown/DropDown';
import './drop-down-button.scss';

const classes = new Bem('drop-down-button');

let dropDownRef = null;

const DropDownButton = ({
    dropDownItems,
    onClickButton = () => {},
    buttonText,
    buttonStyle = 'default'
}) => (
    <div {...classes()}>
        <Button
            text={buttonText}
            style={buttonStyle}
            onClick={() => {
                onClickButton();
                dropDownRef.toggle();
            }}
        />
        <DropDown
            ref={node => dropDownRef = node}
            items={dropDownItems}
        />
    </div>
);

DropDownButton.propTypes = {
    dropDownItems: PropTypes.array,
    dropDownStyle: PropTypes.object,
    onClickButton: PropTypes.func,
    buttonText: PropTypes.string,
    buttonStyle: PropTypes.string
};

export default DropDownButton;
