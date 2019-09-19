import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import DropDown from '../DropDown/DropDown';
import './drop-down-button.scss';

const cls = new Bem('drop-down-button');

let dropDownRef = null;

const DropDownButton = ({
    dropDownItems,
    dropDownRight,
    onClickButton = () => {},
    buttonText,
    buttonStyle = 'default'
}) => (
    <div {...cls()}>
        <Button
            text={buttonText}
            style={buttonStyle}
            onClick={() => {
                onClickButton();
                dropDownRef.toggle(dropDownRight && {style: {right: 0}});
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
    dropDownRight: PropTypes.bool,
    dropDownStyle: PropTypes.object,
    onClickButton: PropTypes.func,
    buttonText: PropTypes.string,
    buttonStyle: PropTypes.string
};

export default DropDownButton;
