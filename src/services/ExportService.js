import API from '../api/api';
import ApiList from '../api/apiList';

export const ExportService = {
    articles: (projectId, templateId, articleIds, filename) => {
        const sp = new URLSearchParams();

        sp.set('project', projectId);
        sp.set('export', templateId);

        if (filename) {
            sp.set('filename', filename);
        }

        return API.post(
            `${ApiList.export}?${sp.toString()}`,
            articleIds && {articleIds}
        );
    },
    archiveArticles: (archiveId, projectId, templateId, articleIds, filename) => {
        const sp = new URLSearchParams();

        sp.set('archive', archiveId);
        sp.set('project', projectId);
        sp.set('export', templateId);

        if (filename) {
            sp.set('filename', filename);
        }

        return API.post(`${ApiList.export}?${sp.toString()}`, articleIds && {articleIds});
    },
};
