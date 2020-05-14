let _db = undefined;
function getDB() {
    if (_db === undefined) {
        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open('preonenote', 1);
            request.onsuccess = function (event) {
                _db = request.result;
                resolve(request.result);
            };

            request.onupgradeneeded = function (event) {
                _db = event.target.result;
                let objectStore;
                if (!_db.objectStoreNames.contains('cache')) {
                    objectStore = _db.createObjectStore('cache', { keyPath: 'name' });
                }
            }

            request.onerror = function (event) {
                console.error(event);
                reject();
            };
        });
    } else return _db;
}

async function op(name, value) {
    let table = (await getDB()).transaction(['cache'], 'readwrite').objectStore('cache');
    return new Promise(async (resolve, reject) => {
        if (value) {
            clear: {
                await MD.excute(table.delete(name));
            }
            add: {
                await MD.excute(table.add({ name, value }));
            }
        } else {

        }
        const result = await MD.get(name, table);
        resolve((result && result.value) || []);
    });
}

async function history(value) {
    return op('history', value);
}

async function customStyle(value) {
    return op('customStyle', value);
}

async function customTableStyle(value) {
    return op('customTableStyle', value);
}

async function customTransform(value) {
    return op('customTransform', value);
}

const MD = {
    async get(key, table) {
        const request = table.get(key);
        await this.excute(request);
        return request.result;
    },
    async excute(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = function (event) {
                resolve(event);
            };

            request.onerror = function (event) {
                reject(event);
            };
        });
    }
}

const IndexDB = {
    history,
    customStyle,
    customTableStyle,
    customTransform,
};

export default IndexDB;