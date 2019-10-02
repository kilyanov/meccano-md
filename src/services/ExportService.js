import API from '../api/api';
import ApiList from '../api/apiList';

export const ExportService = {
    articles: (projectId, templateId, articleIds) => {
        return API.post(
            `${ApiList.export}?project=${projectId}&export=${templateId}`,
            articleIds && {articleIds}
        );
    }
};
