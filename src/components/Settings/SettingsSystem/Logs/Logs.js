import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsPage from '../../SettingsPage/SettingsPage';
import BEMHelper from 'react-bem-helper';
import { SystemService } from '../../../../services/SystemService';
import { useDispatch } from 'react-redux';
import { setAppProgress } from '../../../../redux/actions';
import Select from 'react-select';
import Pagination from '../../../Shared/Pagination';
import LogMessage from './LogMessage';
import './logs.scss';

const cls = new BEMHelper('logs');


const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [pageCount, setPageCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const dispatch = useDispatch();

    const perPageItems = [
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '100', value: 100 }
    ];
    const selectedItem = useMemo(() => (
        perPageItems.find(({ value }) => value === perPage)
    ), [perPage]);


    useEffect(() => {
        dispatch(setAppProgress({ inProgress: true }));
        SystemService
            .logs({ page, 'per-page': perPage })
            .then((response) => {
                setLogs(response.data);
                setPageCount(+response.headers['x-pagination-page-count']);
                setTotalCount(+response.headers['x-pagination-total-count']);

                const scrollableBody = document.querySelector('.settings-page__body');
                scrollableBody.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .finally(() => {
                dispatch(setAppProgress({ inProgress: false }));
            });
    }, [page, perPage]);


    const handlePageChange = useCallback((currentPage) => {
        setPage(currentPage);
    }, []);


    return (
        <SettingsPage
            { ...cls() }
            title='Логирование'
            subtitle=''
            rightBlock={
                <>
                    <span { ...cls('label') }>Сообщений на странице</span>
                    <Select
                        placeholder='Кол-во сообщений'
                        options={perPageItems}
                        defaultValue={selectedItem}
                        selected={selectedItem}
                        onChange={item => setPerPage(item.value)}
                        isSearchable={false}
                    />
                </>
            }
        >
            <div { ...cls('content') }>
                {logs.map((log) => (
                    <LogMessage {...log} key={log.id} />
                ))}
            </div>

            <section { ...cls('footer') }>
                <Pagination
                    page={page}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                />
                {!!totalCount && <div { ...cls('total-count') }>Всего сообщений: {totalCount}</div>}
            </section>
        </SettingsPage>
    );
};

export default Logs;
