import React, { useCallback, useEffect, useState } from 'react';
import { ArticleService } from '../../../../services';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Typography
} from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import { projectSortTableStyles } from './styles';
import Sortable from 'react-sortablejs';
import { setAppProgress } from '../../../../redux/actions';


const ProjectSortTable = ({ sections, onChange }) => {
    const { projectId } = useParams();

    const userType = useSelector(state => state.userType);

    const dispatch = useDispatch();

    const classes = projectSortTableStyles();

    const [activeSectionMain, setActiveSectionMain] = useState(undefined);
    const [activeSectionSub, setActiveSectionSub] = useState(undefined);
    const [activeSectionThree, setActiveSectionThree] = useState(undefined);

    const [needRequest, setNeedRequest] = useState(false);

    const [state, setState] = useState({
        sectionsOne: [],
        sectionsTwo: null,
        sectionsThree: null,
        articles: null
    });

    const [positionImports, setPositionImports] = useState([]);

    useEffect(() => {
        setState({
            sectionsOne: sections,
            sectionsTwo: null,
            sectionsThree: null,
            articles: null
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

        if (!needRequest) {
            return;
        }

        dispatch(setAppProgress({ inProgress: true }));

        ArticleService
            .get(null, form)
            .then(response => {
                setState(s => ({
                    ...s,
                    articles: response.data || []
                }));
                setPositionImports(response.data.map(({ position_import }) => position_import));
            })
            .finally(() => {
                dispatch(setAppProgress({ inProgress: false }));
                setNeedRequest(false);
            });
    }, [activeSectionMain, activeSectionSub, activeSectionThree, needRequest]);

    const handleSectionClick = useCallback((section, key) => {
        const emptySection = { id: 'null', name: 'Без раздела' };
        const isLastSection = section.id === 'null' || (!section.sectionsTwo?.length && !section.sectionsThree?.length);

        onChange([]);

        // eslint-disable-next-line default-case
        switch (key) {
            case 'sectionsOne':
                setState(s => ({
                    ...s,
                    sectionsTwo: isLastSection ? null : [
                        { ...emptySection, sectionsThree: [ { ...emptySection } ] },
                        ...section.sectionsTwo
                    ],
                    sectionsThree: null,
                    articles: null
                }));
                setActiveSectionMain(section);
                setActiveSectionSub(undefined);
                setActiveSectionThree(undefined);
                break;
            case 'sectionsTwo':
                setState(s => ({
                    ...s,
                    sectionsThree: isLastSection ? null : [
                        { ...emptySection },
                        ...section.sectionsThree
                    ],
                    articles: null
                }));
                setActiveSectionSub(section);
                setActiveSectionThree(undefined);
                break;
            case 'sectionsThree':
                setActiveSectionThree(section);
                break;
        }

        if (isLastSection) {
            setNeedRequest(true);
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
            {COLS
                .filter(({ key }) => !!state[key])
                .map((column, columnIndex) => {
                    const isArticleColumn = column.key === 'articles';
                    return (
                        <List
                            key={columnIndex}
                            className={classes.list}
                            subheader={<ListSubheader component='div'>{column.title}</ListSubheader>}
                        >
                            {!!state[column.key].length ? (
                                <Sortable
                                    key={columnIndex}
                                    options={{
                                        animation: 150,
                                        disabled: !isArticleColumn
                                    }}
                                    onChange={sorted => handleSort(sorted)}
                                >
                                    {state[column.key].map((item) => {
                                        const activeSection = column.key === 'sectionsOne'
                                            ? activeSectionMain
                                            : column.key === 'sectionsTwo'
                                                ? activeSectionSub
                                                : activeSectionThree;

                                        return (
                                            <ListItem
                                                key={item.id}
                                                data-id={item.id}
                                                selected={item.id === activeSection?.id}
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
                                        );
                                    })}
                                </Sortable>
                            ) : (
                                <ListItem>
                                    <Typography variant='body2' color='textPrimary'>
                                        Нет статей
                                    </Typography>
                                </ListItem>
                            )}
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
