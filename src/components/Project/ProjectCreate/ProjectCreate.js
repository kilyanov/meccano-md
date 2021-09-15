import React, { useCallback, useEffect, useState } from 'react';
import Page from '../../Shared/Page/Page';
import { useParams } from 'react-router-dom';
import { ProjectService } from '../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { setAppProgress } from '../../../redux/actions';
import { Box, Tab, Tabs } from '@material-ui/core';
import ProjectName from './ProjectName';


const ProjectCreate = () => {
    const { id: projectId } = useParams();

    const [activeTab, setActiveTab] = useState(TABS[0].value);
    const [project, setProject] = useState(null);
    const [fields, setFields] = useState([]);
    const [projectFields, setProjectFields] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [userType, setUserType] = useState(null);

    const userTypes = useSelector(state => (
        state.userTypes.map(({ id, name }) => ({ label: name, value: id }))
    ));

    const dispatch = useDispatch();

    useEffect(() => {
        if (!projectId) {
            return;
        }

        dispatch(setAppProgress({ inProgress: true, withBlockedOverlay: true }));

        ProjectService
            .get({ expand: 'projectFields,allFields' }, projectId)
            .then(response => {
                const { allFields, createdAt, updatedAt } = response.data;

                response.data.projectFields.forEach(fieldsByUserType => {
                    fieldsByUserType.data = fieldsByUserType.data.sort((a, b) => a.order - b.order);
                });

                setProject(response.data);
                setFields(allFields);
                setProjectFields(response.data.projectFields);
                setIsEditMode(createdAt !== updatedAt);
            }).finally(() => {
                dispatch(setAppProgress({ inProgress: false, withBlockedOverlay:false }));
            });
    }, [projectId]);

    useEffect(() => {
        if (!userType && userTypes.length) {
            setUserType(userTypes[0]);
        }
    }, [userTypes]);

    const handleChangeTab = useCallback((event, value) => {
        setActiveTab(value);
    }, []);

    return (
        <Page
            title={project?.name || 'Создание проекта'}
            withBar
        >
            <Tabs
                value={activeTab}
                indicatorColor='primary'
                textColor='primary'
                onChange={handleChangeTab}
            >
                {TABS.map(tab => (
                    <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                    />
                ))}
            </Tabs>
            <Box
                paddingTop={4}
                mb={2}
            >
                {activeTab === 'projectName' && <ProjectName />}
            </Box>
        </Page>
    );
};

export default ProjectCreate;

const TABS = [
    {
        label: 'Название проекта',
        value: 'projectName'
    },
    {
        label: 'Настройка полей',
        value: 'fields'
    },
    {
        label: 'Структура',
        value: 'structure'
    },
    {
        label: 'Ключевые слова',
        value: 'keyWords'
    },
    {
        label: 'Пользователи',
        value: 'users'
    }
];
