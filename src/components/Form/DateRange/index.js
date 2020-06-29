import { DateRangePicker } from "react-dates";
import 'react-dates/initialize';
import React, { useState } from "react";
import BEMHelper from "react-bem-helper";
import './date-range.scss';

const cls = new BEMHelper('date-range');

export default function DateRange({
    className,
    onChange,
    startDate,
    endDate,
    anchorDirection = 'left',
    isOutsideRange,
    minDate,
    maxDate
}) {
    const [ focusedInput, setFocusedInput ] = useState('');
    const props = {};
    let outsideRange = () => {};

    if (isOutsideRange) outsideRange = () => false;
    if (minDate && !_.isEmpty(minDate)) outsideRange = value => {
        return minDate && minDate.isAfter(value, 'day') || maxDate && maxDate.isBefore(value, 'day');
    }

    if (focusedInput) {
        props.focusedInput = focusedInput;
    }

    return (
        <div {...cls('', '', className)}>
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDatesChange={onChange}
                onFocusChange={focused => setFocusedInput(focused)}
                {...props}
                numberOfMonths={1}
                isOutsideRange={outsideRange}
                anchorDirection={anchorDirection}
                customArrowIcon={<span>-</span>}
                hideKeyboardShortcutsPanel
                startDateId="start"
                endDateId="end"
            />
        </div>
    );
}
