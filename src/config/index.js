const config = {
    production: {
        apiURL: 'https://api.meccano.mel-meccano.ru/v1'
    },
    development: {
        apiURL: 'https://api.meccano.paterm.tk/v1' // 'https://api.meccano.test/v1'
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];
