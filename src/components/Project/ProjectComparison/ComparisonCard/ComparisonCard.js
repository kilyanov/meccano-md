import React, { useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    IconButton,
    Typography
} from '@material-ui/core';
import ComparedFields from './ComparedFields/ComparedFields';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RemoveIcon from '@material-ui/icons/Remove';
import { useComparisonCardStyles } from "./styles";

function ComparisonCard(props) {
    const {
        className: mix,
        article,
        projectFields,
        isExpandedDefault = false,
        showCompareButton = false,
        onRedirectToPairComparison,
        onIgnoreComparison
    } = props;

    const classes = useComparisonCardStyles();
    const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

    const handleRedirectToPairComparison = (evt) => {
        evt.stopPropagation();
        if (onRedirectToPairComparison) {
            onRedirectToPairComparison(article.article_id);
        }
    };

    const handleIgnoreComparison = (evt) => {
        evt.stopPropagation();
        if (onIgnoreComparison) {
            onIgnoreComparison(article.article_id);
        }
    };

    return (
        <Box className={mix}>
            <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Box className={classes.header}>
                        <Typography
                            className={classes.title}
                            variant="subtitle1"
                            component="h2"
                        >
                            {article.title || article.article_id}
                        </Typography>
                        {showCompareButton && (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleRedirectToPairComparison}
                                    size="small"
                                >
                                    Подробнее
                                </Button>
                                <IconButton
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleIgnoreComparison}
                                    size="small"
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <ComparedFields
                        comparedFields={article.comparedFields}
                        projectFields={projectFields}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default ComparisonCard;
