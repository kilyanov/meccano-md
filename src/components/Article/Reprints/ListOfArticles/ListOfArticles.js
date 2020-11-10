import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getColumnsFromStorage } from "../../../Project/ProjectPage/ProjectTable/Columns";
import CheckBox from '../../../Form/CheckBox/CheckBox';
import ProjectPagination from "../../../Project/ProjectPage/ProjectTable/ProjectPagination/ProjectPagintaion";
import './list-of-articles.scss';

const cls = new Bem('list-of-articles');

function ListOfArticles({ project, userTypeId, onSelectArticle, ArticleService }) {
    const { id: projectId, name } = project;
    const [ articles, setArticles ] = useState([]);
    const [ selectedArticle, setSelectedArticle ] = useState(null);
    const [ paginationPage, setPaginationPage ] = useState(1);
    const [ paginationPageCount, setPaginationPageCount ] = useState(1);

    const expand = getColumnsFromStorage().map(({ key }) => {
        if (key === 'source_id') return 'source';
        return key;
    }).toString();

    useEffect(() => {
        console.log(paginationPage);
        ArticleService.getList({ 
            project: projectId,
            archive: '',
            user_type: userTypeId,
            expand,
            page: paginationPage,
            'per-page': 30
        })
            .then(({data, headers}) => {
                console.log(paginationPage, paginationPageCount);
                setPaginationPageCount(+headers['x-pagination-page-count']);
                setArticles(data);
            });
    }, [paginationPage]);

    const isChecked = (article) => {
        return selectedArticle === article;
    };

    const handleSelectArticle = ({ article }) => {
        setSelectedArticle(article);
        onSelectArticle(article.id);
    };

    const handlePageChenge = ({ selected }) => {
        setPaginationPage(selected + 1);
    };

    return (
        <div {...cls()}>
            <p {...cls('question-text')}>В какую статью проекта {name} перенести?</p>
            <div {...cls('table')}>
                <div
                    {...cls('row')}
                >
                    <div {...cls('cell')} />
                    <div {...cls('cell', 'place-header')} style={{ width: 170 }}>
                        <span {...cls('cell-text')}>Дата публикации</span>
                    </div>
                    <div {...cls('cell', 'place-header')} style={{ width: 170 }}>
                        <span {...cls('cell-text')}>СМИ (Источник)</span>
                    </div>
                    <div {...cls('cell', 'place-header')} style={{ width: 320 }}>
                        <span {...cls('cell-text')}>Заголовок</span>
                    </div>
                </div>
                {articles.map((article) => (
                    <div
                        {...cls('row')}
                        onClick={() => handleSelectArticle({ article })}
                        key={article.id}
                    >
                        <div {...cls('cell')}>
                            <CheckBox
                                label={null}
                                {...cls('select-article')}
                                checked={isChecked(article)}
                                onChange={() => handleSelectArticle({ article })}
                            />
                        </div>
                        <div {...cls('cell')} style={{ width: 170 }}>
                            <span {...cls('cell-text')}>{article.date}</span>
                        </div>
                        <div {...cls('cell')} style={{ width: 170 }}>
                            <span {...cls('cell-text')}>{article.source?.name}</span>
                        </div>
                        <div {...cls('cell')} style={{ width: 320 }}>
                            <span {...cls('cell-text')}>{article.title}</span>
                        </div>
                    </div>
                ))}
            </div>
            <ProjectPagination 
                page={1}
                pageCount={paginationPageCount} 
                onPageChange={handlePageChenge}
            />
        </div>
    );
}

ListOfArticles.propTypes = {
    onSelectArticle: PropTypes.func,
    ArticleService: PropTypes.object
};

export default ListOfArticles;
