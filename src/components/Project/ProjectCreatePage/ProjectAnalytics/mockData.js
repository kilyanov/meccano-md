export const mockObjects = [
    {
        id: '1',
        name: 'Яндекс',
        objectSearchQuery: 'yandex',
        objectTone: 'to2',
        companySpeakers: [
            // TODO: Понять, поля остальные спикера хранятся тут, в спикере или в статье
            { speaker: 'sp1' },
            { speaker: 'sp3' }
        ],
        outsideSpeakers: [
            { speaker: 'sp2' }
        ]
    },
    {
        id: '2',
        name: 'Сбер',
        objectSearchQuery: 'sber',
        objectTone: 'to1',
        companySpeakers: [
            { speaker: 'sp1' }
        ],
        outsideSpeakers: []
    }
];

export const mockTones = [
    {
        id: 'to1',
        name: 'Негатив'
    }, {
        id: 'to2',
        name: 'Нейтрал'
    }, {
        id: 'to3',
        name: 'Позитив'
    }
];

export const mockSpeakers = [
    {
        id: 'sp1',
        name: 'Стас Басов'
    }, {
        id: 'sp2',
        name: 'Кирилл Матрасов'
    }, {
        id: 'sp3',
        name: 'Найк Адидасов'
    }
];

export const mockQuoteLevels = [
    {
        id: 'ql1',
        name: 'Топ-менеджмент'
    },
    {
        id: 'ql2',
        name: 'Федеральный'
    }
];

export const mockQuoteTypes = [
    {
        id: 'qt1',
        name: 'Прямая речь'
    },
    {
        id: 'qt2',
        name: 'Косвенные цитаты'
    }
];

export const mockCategories = [
    {
        id: 'ca1',
        name: 'Бизнес'
    },
    {
        id: 'ca2',
        name: 'Власть'
    }
];

export const mockAnalyticParameterTypes = [
    {
        id: 'pt1',
        name: 'Одиночный выбор'
    },
    {
        id: 'pt2',
        name: 'Множественный выбор'
    },
    {
        id: 'pt3',
        name: 'Ручной ввод'
    }
];
