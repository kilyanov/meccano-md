import React from 'react';
import BEMHelper from "react-bem-helper";
import SearchIcon from "../../Shared/SvgIcons/SearchIcon";
import './input-search.scss';

const cls = new BEMHelper('input-search');

export default function InputSearch({ className, value = '', onChange = () => {}, placeholder = 'Поиск' }) {
    return (
        <div {...cls('', '', className)}>
            <SearchIcon {...cls('icon')} width={18} height={18} />
            <input
                {...cls('field')}
                placeholder={placeholder}
                type="search"
                onChange={({ target }) => onChange(target.value)}
                value={value}
            />
        </div>
    );
}
