import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Page from '../../Shared/Page/Page';
import Breadcrumbs from '../../Shared/Breadcrumbs';
import { ProjectService } from '../../../services';

import './project-compare-page.scss';

const cls = new Bem('project-compare-page');
const EXPANDED_REQUEST_FIELDS = 'compareArticles.article';

function ProjectComparePage() {
    const { id: projectId } = useParams();
    const location = useLocation();

    const [comparedArticles, setComparedArticles] = useState({});

    useEffect(() => {
        ProjectService.compare(projectId, { expand: EXPANDED_REQUEST_FIELDS })
            .then(({ data }) => {
                const indexedComparedArticles = data.reduce((acc, pair) => {
                    pair.compareArticles.forEach((article) => {
                        const originalArticleId = article.article_id;

                        const result = {
                            article: {
                                ...article,
                                // Совпавшие в статье поля
                                fields: pair.compareColumns.map((field) => ({ filed_compare: field.filed_compare }))
                            },
                            compared: pair.compareArticles
                                // Исключаем исходную статью
                                .filter((a) => a?.article_id !== originalArticleId)
                                // Подставляем информацию о совпавших полях
                                .map((a) => ({ ...a, fields: pair.compareColumns }))
                        };

                        // Если такая статья впервые
                        if (!acc[originalArticleId]) acc[originalArticleId] = result;
                        // Если есть ещё совпадения с исходной статьёй
                        else acc[originalArticleId].push(result);
                    });
                    return acc;
                }, {});
                setComparedArticles(indexedComparedArticles);
            })
            .catch(console.error);
    }, []);

    return (
        <Page {...cls()} withBar>
            <Breadcrumbs location={location} />

            {Object.entries(comparedArticles).map(([article, compared]) => (
                <div key={article} {...cls('columns')}>
                    <div>
                        <pre>{JSON.stringify(compared.article, null, 2)}</pre>
                    </div>
                    <div>
                        <pre>{JSON.stringify(compared.compared, null, 2)}</pre>
                    </div>
                </div>
            ))}


        </Page>
    );
}

export default ProjectComparePage;
