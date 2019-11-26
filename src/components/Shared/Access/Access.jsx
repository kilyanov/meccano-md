import React from 'react';
import {useSelector} from 'react-redux';
import {isAccess} from "../../../helpers/Tools";
import {PERMISSION} from "../../../constants/Permissions";

const Access = ({permissions, children, replaceComponent}) => {
    const profile = useSelector(state => state.profile);
    const canRender = !permissions || permissions.includes(PERMISSION.all) ||
        isAccess(permissions || [], profile);

    return canRender ? <>{children}</> : replaceComponent || null;
};

export default Access;
