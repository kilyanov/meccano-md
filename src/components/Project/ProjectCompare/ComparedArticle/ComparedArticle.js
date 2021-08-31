import React, {useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography} from '@material-ui/core';
import ComparedFields from '../ComparedFields/ComparedFields';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useComparedArticleStyles} from "./styles";

function ComparedArticle(props) {
    const {
        className: mix,
        article,
        isExpandedDefault = false,
        showCompareButton = false
    } = props;

    const classes = useComparedArticleStyles();
    const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

    const handleRedirectToCompare = (evt) => {
        evt.stopPropagation();
        console.log(article.article_id);
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
                        <Typography variant="subtitle1" component="h2">{article.title || article.article_id}</Typography>
                        {showCompareButton && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleRedirectToCompare}
                                size="small"
                            >
                                Подробнее
                            </Button>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <ComparedFields comparedFields={article.comparedFields} />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default ComparedArticle;
