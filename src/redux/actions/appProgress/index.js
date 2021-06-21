import { ACTION_TYPE } from "../../../constants";

export const setAppProgress = ({ inProgress, withBlockedOverlay = false }) => ({
    type: ACTION_TYPE.APP.IN_PROGRESS,
    payload: { inProgress, withBlockedOverlay }
});

