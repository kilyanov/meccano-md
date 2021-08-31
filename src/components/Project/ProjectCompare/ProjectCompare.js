import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {Box, Divider, Grid, Hidden, Typography} from '@material-ui/core';

import Page from '../../Shared/Page/Page';
import Breadcrumbs from '../../Shared/Breadcrumbs';
import { ProjectService } from '../../../services';
import { useProjectCompareStyles } from './styles';
import ComparedArticle from './ComparedArticle/ComparedArticle';

const EXPANDED_COMPARE_REQUEST = 'compareArticles.article';

function ProjectCompare() {
    const classes = useProjectCompareStyles();
    const { id: projectId } = useParams();
    const location = useLocation();

    const [comparedArticles, setComparedArticles] = useState({});

    const getComparedArticles = () => {
        ProjectService.compare(projectId, { expand: EXPANDED_COMPARE_REQUEST })
            .then(({ data }) => {
                const indexedComparedArticles = data.reduce((acc, pair) => {
                    pair.compareArticles.forEach((comparisonObject) => {
                        const originalArticleId = comparisonObject.article_id;

                        const result = {
                            // Исходная статья
                            originalArticle: {
                                article_id: originalArticleId,
                                ...comparisonObject.article,
                                // Совпавшие в статье поля
                                comparedFields: pair.compareColumns.map((field) => ({ filed_compare: field.filed_compare }))
                            },
                            // Сравниваемые статьи[]
                            comparedArticles: pair.compareArticles
                                // Исключаем исходную статью
                                .filter((a) => a?.article_id !== originalArticleId)
                                // Подставляем информацию о совпавших полях
                                .map((a) => ({ article_id: a?.article_id, ...a.article, comparedFields: pair.compareColumns }))
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
    };

    useEffect(() => {
        getComparedArticles();
    }, []);

    return (
        <Page
            title="Сравнение статей"
            withBar
        >
            <Breadcrumbs location={location}/>

            {Object.entries(comparedArticles).map(([id, compared], index) => (
                <Box key={id}>
                    {index !== 0 && <Divider className={classes.divider}/>}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Hidden smUp={!!index}>
                                <Typography
                                    className={classes.label}
                                    variant="subtitle2"
                                    color="textSecondary"
                                    component="p"
                                >
                                    Целевая статья
                                </Typography>
                            </Hidden>
                            <ComparedArticle
                                className={classes.originalArticle}
                                article={compared.originalArticle}
                                isExpandedDefault
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Hidden smUp={!!index}>
                                <Typography
                                    className={classes.label}
                                    variant="subtitle2"
                                    color="textSecondary"
                                    component="p"
                                >
                                    Обнаруженные дубликаты
                                </Typography>
                            </Hidden>
                            {compared.comparedArticles.map((article) => (
                                <ComparedArticle
                                    className={classes.comparedArticle}
                                    key={article.article_id}
                                    article={article}
                                    isExpandedDefault
                                    showCompareButton
                                />
                            ))}
                        </Grid>
                    </Grid>
                </Box>

            ))}
        </Page>
    );
}

export default ProjectCompare;
