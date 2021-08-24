import React, { useCallback, useEffect, useState } from 'react';
import { ArticleService } from '../../../../services';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    CircularProgress
} from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import { projectSortTableStyles } from './styles';
import Sortable from 'react-sortablejs';


const ProjectSortTable = ({ sections, onChange }) => {
    const { id: projectId } = useParams();

    const userType = useSelector(state => state.userType);

    const classes = projectSortTableStyles();

    const [activeSectionMain, setActiveSectionMain] = useState(undefined);
    const [activeSectionSub, setActiveSectionSub] = useState(undefined);
    const [activeSectionThree, setActiveSectionThree] = useState(undefined);

    const [articlesInProgress, setArticlesInProgress] = useState(false);

    const [state, setState] = useState({
        sectionsOne: [],
        sectionsTwo: [],
        sectionsThree: [],
        articles: []
    });

    const [positionImports, setPositionImports] = useState([]);

    useEffect(() => {
        setState({
            sectionsOne: sections,
            sectionsTwo: [],
            sectionsThree: [],
            articles: []
        });
    }, [sections]);

    useEffect(() => {
        const form = {
            page: 1,
            project: projectId,
            user_type: userType.id,
            expand: 'title, position_import',
            ['filter[section_main_id]']: activeSectionMain?.id,
            ['filter[section_sub_id]']: activeSectionSub?.id,
            ['filter[section_three_id]']: activeSectionThree?.id
        };

        if (activeSectionThree === undefined) {
            return;
        }

        setArticlesInProgress(true);

        ArticleService
            .get(null, form)
            .then(response => {
                setState(s => ({
                    ...s,
                    articles: response.data || []
                }));
                setPositionImports(response.data.map(({ position_import }) => position_import));
            })
            .finally(() => setArticlesInProgress(false));
    }, [activeSectionMain, activeSectionSub, activeSectionThree]);

    const handleSectionClick = useCallback((section, key) => {
        const emptySection = { id: 'null', name: 'Без раздела' };

        onChange([]);

        // eslint-disable-next-line default-case
        switch (key) {
            case 'sectionsOne':
                setState(s => ({
                    ...s,
                    sectionsTwo: section.id === 'null' ? section.sectionsTwo : [
                        { ...emptySection, sectionsThree: [ { ...emptySection } ] },
                        ...section.sectionsTwo
                    ],
                    sectionsThree: [],
                    articles: []
                }));
                setActiveSectionMain(section);
                setActiveSectionSub(undefined);
                setActiveSectionThree(undefined);
                break;
            case 'sectionsTwo':
                setState(s => ({
                    ...s,
                    sectionsThree: section.id === 'null' ? section.sectionsThree : [
                        { ...emptySection },
                        ...section.sectionsThree
                    ],
                    articles: []
                }));
                setActiveSectionSub(section);
                setActiveSectionThree(undefined);
                break;
            case 'sectionsThree':
                setActiveSectionThree(section);
                break;
        }
    }, []);

    const handleSort = useCallback((sorted) => {
        const newArticles = [];

        for (let i = 0; i < sorted.length; i++) {
            const sid = sorted[i];
            const article = state.articles.find(({ id }) => id === sid);

            if (article) {
                article.position_import = positionImports[i];
                newArticles.push(article);
            }
        }

        setState(s => ({
            ...s,
            articles: newArticles
        }));

        const mapped = newArticles.map(({ id, position_import }) => ({  id, position_import}));

        onChange(mapped);
    }, [state, positionImports]);


    return (
        <Box display='flex'>
            {COLS.map((column, columnIndex) => {
                const isArticleColumn = column.key === 'articles';
                return (
                    <List
                        key={columnIndex}
                        className={classes.list}
                        subheader={
                            <ListSubheader component='div'>
                                {column.title}
                                {isArticleColumn && articlesInProgress && (
                                    <Box component='span' marginLeft={1}>
                                        <CircularProgress size={14} />
                                    </Box>
                                )}
                            </ListSubheader>
                        }
                    >
                        <Sortable
                            key={columnIndex}
                            options={{
                                animation: 150,
                                disabled: !isArticleColumn
                            }}
                            onChange={sorted => handleSort(sorted)}
                        >
                            {state[column.key].map((item) => (
                                <ListItem
                                    key={item.id}
                                    data-id={item.id}
                                    button
                                    onClick={() => {
                                        if (!isArticleColumn) {
                                            handleSectionClick(item, column.key);
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        {isArticleColumn
                                            ? <DescriptionIcon />
                                            : <FolderIcon />
                                        }
                                    </ListItemIcon>
                                    <ListItemText >
                                        {isArticleColumn ? item.title : item.name}
                                    </ListItemText>
                                </ListItem>
                            ))}
                        </Sortable>
                    </List>
                );
            })}
        </Box>
    );
};

export default ProjectSortTable;

const COLS = [
    {
        title: 'Раздел 1',
        key: 'sectionsOne'
    },
    {
        title: 'Раздел 2',
        key: 'sectionsTwo'
    },
    {
        title: 'Раздел 3',
        key: 'sectionsThree'
    },
    {
        title: 'Статьи',
        key: 'articles'
    }
];
