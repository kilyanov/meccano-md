import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Page from '../../Shared/Page/Page';

import { ProjectService } from '../../../services';
import { usePairComparisonStyles } from './styles';
import InputText from '../../Form/InputText/InputText';
import TinyMCE from '../../Form/TinyMCE/TinyMCE';
import { Box, CircularProgress, Grid, Typography, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const EXPANDED_COMPARE_REQUEST = 'compareArticles.article';
const EXPANDED_FIELDS_REQUEST = 'projectFields';

function PairComparison() {
    const classes = usePairComparisonStyles();
    const history = useHistory();

    const userType = useSelector(state => state.userType);

    const [isLoading, setIsLoading] = useState(false);
    const [firstArticle, setFirstArticle] = useState(null);
    const [secondArticle, setSecondArticle] = useState(null);
    const [comparedFields, setComparedFields] = useState([]);
    const [projectFields, setProjectFields] = useState([]);

    const { projectId, firstArticleId, secondArticleId } = useParams();

    const getComparedArticles = () => {
        setIsLoading(true);

        ProjectService.compare(projectId, { expand: EXPANDED_COMPARE_REQUEST }, firstArticleId)
            .then(({ data }) => {
                const firstArticleData = data[0].compareArticles.find((article) => article.article_id === firstArticleId);
                const secondArticleData = data[0].compareArticles.find((article) => article.article_id === secondArticleId);
                setFirstArticle(firstArticleData);
                setSecondArticle(secondArticleData);
                setComparedFields(data[0].compareColumns.map((field) => field.filed_compare));
            })
            .catch(console.error)
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getProjectFields = () => {
        setIsLoading(true);

        ProjectService.get({ expand: EXPANDED_FIELDS_REQUEST }, projectId)
            .then(({ data }) => {
                const userProjectFields = data.projectFields
                    .find((f) => f.user_type_id === userType.id).data
                    .sort((a, b) => a.order - b.order);

                setProjectFields(userProjectFields);
            })
            .catch(console.error)
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(getComparedArticles, []);
    useEffect(getProjectFields, [userType.id]);

    const fieldSwitcher = {
        'title': (options) => (
            <InputText
                label={options.name}
                name={options.slug}
                value={options.value}
            />
        ),
        'annotation': (options) => (
            <TinyMCE
                label={options.name}
                name={options.slug}
                content={options.value}
                height={256}
                onEditorChange={() => {}}
            />
        ),
        'text': (options) => (
            <TinyMCE
                label={options.name}
                name={options.slug}
                content={options.value}
                height={256}
                onEditorChange={() => {}}
            />
        )
    };

    const getArticleFieldElements = (article) => {
        if (!article?.id) {
            return [];
        }

        const articleFields = projectFields.reduce((acc, field) => {
            field.value = article[field.slug] || '';
            acc.push(field);
            return acc;
        }, []);

        return articleFields
            .map((field, index) => {
                if (!fieldSwitcher[field.slug]) {
                    return;
                }

                const compared = comparedFields.includes(field.slug);
                const fieldClassName = !compared ? classes.fieldWrapper : classes.comparedFieldWrapper;

                return (
                    <Box key={index} className={fieldClassName}>
                        {fieldSwitcher[field.slug](field)}
                    </Box>
                );
            });
    };

    const getArticleElement = (article, articleId) => {
        if (isLoading) {
            return <CircularProgress />;
        }

        return (
            <Box className={classes.column}>
                {!article && <Alert severity="error">Не удалось получить поля статьи. ID статьи: {articleId}</Alert>}
                {getArticleFieldElements(article)}
            </Box>
        );
    };

    return (
        <Page
            title="Сравнение пары"
            withBar
        >
            <Button
                variant="outlined"
                color="default"
                startIcon={<ArrowBackIcon />}
                onClick={() => history.push(`/project/${projectId}/compare`)}
            >
                Сравнение статей
            </Button>
            <Box mt={4}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography
                            className={classes.label}
                            variant="subtitle2"
                            color="textSecondary"
                            component="p"
                        >
                            Целевая статья
                        </Typography>
                        {getArticleElement(firstArticle?.article, firstArticleId)}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography
                            className={classes.label}
                            variant="subtitle2"
                            color="textSecondary"
                            component="p"
                        >
                            Сравниваемая статья
                        </Typography>
                        {getArticleElement(secondArticle?.article, secondArticleId)}
                    </Grid>
                </Grid>
            </Box>
        </Page>
    );
}

export default PairComparison;
