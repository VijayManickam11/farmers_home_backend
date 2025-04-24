module.exports.ServerPort = 8081;
let ENV = 'LOCAL';

if (ENV == 'LOCAL') {
    module.exports.base_url = 'https://localhost:8081';
} else if (ENV == 'DEV') {
    module.exports.base_url = 'https://';
}