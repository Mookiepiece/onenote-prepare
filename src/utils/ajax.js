
const HOST = 'http://www.whiteswallow.ink/preonenote/api/';

const ajax = (method, url, params, headers = {}) => {
    return fetch(new Request(HOST + url, {
        method,
        headers,
        body: params ? JSON.stringify(params) : undefined
    }));
}

const AJAX = {
    feedback(title, desc) {
        return new Promise((resolve, reject) => ajax('POST', 'feedback', { title, desc }).then(res => {
            res.text().then(resolve, reject);
        }).catch(reject))
    },
    version() {
        return new Promise((resolve, reject) => ajax('GET', 'version').then(res => {
            res.text().then(resolve, reject);
        }).catch(reject))
    }
}

export default AJAX;