let dev = {
    mode: 'dev',
    logging: 'dev',
    port: process.env.PORT || 8080,
}

let prod = {
    mode: 'prod',
    logging: 'common',
    port: process.env.PORT || 80
}

let configs = {
    dev,
    prod
}

module.exports = configs[process.env.NODE_ENV];