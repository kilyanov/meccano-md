import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Divider, Grid, Hidden, Typography, Button } from '@material-ui/core';

import Page from '../../Shared/Page/Page';
import { ProjectService } from '../../../services';
import { useProjectComparisonStyles } from './styles';
import ComparisonCard from "./ComparisonCard/ComparisonCard";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useSelector } from 'react-redux';

const EXPANDED_COMPARE_REQUEST = 'compareArticles.article';
const EXPANDED_FIELDS_REQUEST = 'projectFields';

function ProjectComparison() {
    const classes = useProjectComparisonStyles();
    const { projectId } = useParams();
    const history = useHistory();

    const userType = useSelector(state => state.userType);

    const [comparedArticles, setComparedArticles] = useState({});
    const [projectFields, setProjectFields] = useState([]);

    const getProjectFields = () => {
        ProjectService.get({ expand: EXPANDED_FIELDS_REQUEST }, projectId)
            .then(({ data }) => {
                const userProjectFields = data.projectFields
                    .find((f) => f.user_type_id === userType.id).data;

                setProjectFields(userProjectFields);
            })
            .catch(console.error);
    };

    useEffect(getProjectFields, [userType.id]);

    const handleRedirectToPairComparison = (firstArticleId, secondArticleId) => {
        history.push(`/project/${projectId}/compare/${firstArticleId}/${secondArticleId}`);
    };

    const handleIgnoreComparison = (articleId) => {
        // `/${projectId}/remove-compare-article/${articleId}`
        console.log(articleId);
    };

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
            <Button
                variant="outlined"
                color="default"
                startIcon={<ArrowBackIcon />}
                onClick={() => history.push(`/project/${projectId}`)}
            >
                Статьи проекта
            </Button>
            <Box mt={4}>
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
                                <ComparisonCard
                                    className={classes.originalArticle}
                                    article={compared.originalArticle}
                                    projectFields={projectFields}
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
                                    <ComparisonCard
                                        className={classes.comparedArticle}
                                        key={article.article_id}
                                        article={article}
                                        projectFields={projectFields}
                                        showCompareButton
                                        onRedirectToPairComparison={
                                            () => handleRedirectToPairComparison(id, article.article_id)
                                        }
                                        onIgnoreComparison={
                                            () => handleIgnoreComparison(article.article_id)
                                        }
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    </Box>

                ))}
            </Box>
        </Page>
    );
}

export default ProjectComparison;
