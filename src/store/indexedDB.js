

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
                if (!_db.objectStoreNames.contains('history')) {
                    objectStore = _db.createObjectStore('history', { autoIncrement: true });
                }
            }

            request.onerror = function (event) {
                console.error(event);
                reject();
            };
        });
    } else return _db;
}

async function history(value) {
    let objectStore = (await getDB()).transaction(['history'], 'readwrite').objectStore('history');

    return new Promise((resolve, reject) => {
        if (value) {
            const request = objectStore.clear();
            request.onsuccess = function (event) {
                const request = objectStore.add(value);
                request.onsuccess = function (event) {
                    resolve();
                };
                request.onerror = function (event) {
                    console.error(event);
                    reject();
                };
            };

            request.onerror = function (event) {
                console.error(event);
                reject();
            };
        } else {
            const request = objectStore.getAll();

            request.onsuccess = function (event) {
                resolve(request.result[0] || []);
            };

            request.onerror = function (event) {
                console.error(event);
                reject();
            };
        }
    })
}

const IndexDB = {
    history,
};

export default IndexDB;