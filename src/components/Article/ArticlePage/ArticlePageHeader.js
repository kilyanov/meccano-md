import React, { useCallback, useRef } from 'react';

import ArrowIcon from '../../Shared/SvgIcons/ArrowIcon';
import LocationIcon from '../../Shared/SvgIcons/LocationIcon';
import ReprintsIcon from '../../Shared/SvgIcons/ReprintsIcon';
import AccessProject from '../../Shared/AccessProject';
import Button from '../../Shared/Button/Button';

import { PROJECT_PERMISSION } from '../../../constants';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';

const cls = new Bem('article-page');

export default function ArticlePageHeader({
    articleId,
    articleTitle,
    onBackBtn,
    articlesNavs,
    onPrevArticle,
    onNextArticle,
    onClickViewSettings,
    isUpdate,
    onAddCity,
    onShowReprints,
    form,
    userType,
    onSubmit,
    onDoneArticle,
    onDeleteArticle
}) {
    const promiseDialogRef = useRef(null);

    const handleDelete = useCallback(() => {
        if (!promiseDialogRef.current) {
            return;
        }

        promiseDialogRef.current
            .open({
                title: 'Удаление статьи?',
                content: `Вы уверены, что хотите удалить статью "${articleTitle}"`,
                submitText: 'Удалить',
                danger: true
            })
            .then(onDeleteArticle);
    }, []);

    return (
        <section {...cls('header')}>
            <a
                {...cls('back-button')}
                onClick={onBackBtn}
            ><i>‹</i> Назад к проекту</a>

            <div {...cls('title-wrap')}>
                {articlesNavs.prev && (
                    <button
                        {...cls('title-button', 'left')}
                        onClick={onPrevArticle}
                    ><ArrowIcon {...cls('title-arrow')}/></button>
                )}

                <h2 {...cls('title')}>
                    {isUpdate ? 'Статья' : 'Новая статья'}
                    {(articlesNavs.current && articlesNavs.total) &&
                    ` ${articlesNavs.current} из ${articlesNavs.total}`}
                </h2>

                {articlesNavs.next && (
                    <button
                        {...cls('title-button', 'right')}
                        onClick={onNextArticle}
                    ><ArrowIcon {...cls('title-arrow')}/></button>
                )}
            </div>

            <button
                {...cls('view-button')}
                onClick={onClickViewSettings}
                title='Отображение статей'
            >
                <div {...cls('view-button-icon')}>
                    <i/><i/><i/>
                </div>
            </button>

            <button
                {...cls('location-button')}
                title='Добавить город'
                onClick={onAddCity}
            >
                <LocationIcon/>
            </button>

            {articleId && (
                <button
                    {...cls('drawer-button')}
                    onClick={onShowReprints}
                    title='Перепечатки'
                >
                    <ReprintsIcon />
                    {!!form.reprints?.length && (
                        <span {...cls('reprint-counter')}>{ form.reprints.length }</span>
                    )}
                </button>
            )}

            <AccessProject permissions={[ PROJECT_PERMISSION.EDIT ]}>
                <Button
                    {...cls('remove-button')}
                    text='Удалить статью'
                    style='error'
                    disabled={!userType}
                    onClick={handleDelete}
                />

                <Button
                    {...cls('done-button')}
                    text={userType && form[`complete_${userType.slug}`] ? 'Отменить завершение' : 'Завершить статью'}
                    style={userType && form[`complete_${userType.slug}`] ? 'info' : 'success'}
                    disabled={!userType}
                    onClick={onDoneArticle}
                />

                <Button
                    {...cls('submit-button')}
                    text={isUpdate ? 'Обновить' : 'Создать'}
                    onClick={onSubmit}
                />
            </AccessProject>

            <PromiseDialogModal ref={promiseDialogRef}/>
        </section>
    )
}
