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

    const [comparedArticles, setComparedArticles] = useState(new Map());

    useEffect(() => {
        ProjectService.compare(projectId, { expand: EXPANDED_REQUEST_FIELDS })
            .then(({ data }) => {
                const mappedComparedArticles = data.reduce((acc, compared) => {
                    compared.compareArticles.forEach((article) => {
                        const a = article;
                        const c = compared.compareArticles.filter((el) => el?.article_id !== article.article_id);

                        acc.set(
                            Object.assign(a, { fields: compared.compareColumns }),
                            Object.assign(c, { fields: compared.compareColumns })
                        );
                    });
                    return acc;
                }, new Map());
                setComparedArticles(mappedComparedArticles);
            })
            .catch(console.error);
    }, []);

    return (
        <Page {...cls()} withBar>
            <Breadcrumbs location={location} />

            {Array.from(comparedArticles).map(([article, compared]) => (
                <div key={article.article_id} {...cls('columns')}>
                    <div>
                        <pre>{JSON.stringify(article, null, 2)}</pre>
                    </div>
                    <div>
                        <pre>{JSON.stringify(compared, null, 2)}</pre>
                    </div>
                </div>
            ))}


        </Page>
    );
}

export default ProjectComparePage;
