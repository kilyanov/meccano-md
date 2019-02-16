const config = {
    development: {
        apiURL: 'https://api.meccano.mel-meccano.ru/v1'
    },
    production: {
        apiURL: 'https://api.meccano.mel-meccano.ru/v1'
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];
