"use strict"
const dayjs = require('dayjs');
const sqlite = require('sqlite3');

//aggiunta supporto al database
const db = new sqlite.Database('cmsmall.sqlite',
    (err) => { if (err) throw err; });

//fornisce tutte le pagine tranne quelle non ancora pubblicate se non è autenticato
exports.getAllPages = (userid) => {
    return new Promise((resolve, reject) => {
        let sql;
        if (userid) {
            sql = "SELECT pages.id,title,name,pages.authorId,creation_date,pubblication_date FROM pages,users WHERE pages.authorId = users.id ORDER BY pubblication_date DESC, pages.id DESC";
        }
        else {
            //perchè alcuni non vengono messi a null
            sql = "SELECT pages.id,title,name,pages.authorId,creation_date,pubblication_date FROM pages,users WHERE pages.authorId = users.id AND pubblication_date != '' AND pubblication_date <= DATE() ORDER BY pubblication_date DESC, pages.id DESC";
        }

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else {
                //nomi delle colonne
                resolve(rows);
            }
        });
    });
}


//fornisce info su una pagina tranne quelle non ancora pubblicate se non è autenticato
exports.getPageAll = (id, userid) => {
    return new Promise((resolve, reject) => {
        let sql;
        if (userid) {
            sql = "SELECT pages.id,title,name,pages.authorId,creation_date,pubblication_date FROM pages,users WHERE pages.id = ? AND pages.authorId = users.id";
        }
        else {
            sql = "SELECT pages.id,title,name,pages.authorId,creation_date,pubblication_date FROM pages,users WHERE pages.id = ? AND pages.authorId = users.id AND pubblication_date <= DATE()";
        }

        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else {
                //adesso preniamo il contenuto

                if (row == undefined) {
                    reject("Page non found or NOT ENAUGH PRIVILEGES");
                    return;
                }

                const contentsquery = "SELECT id,pageId,type,text,image FROM contents WHERE pageId = ?";
            

                db.all(contentsquery, [id], (err, rows) => {
                    if (err) reject(err)
                    else {
                        //nomi delle colonne
                        let contents;
                        if (rows == undefined) {
                            contents = [];
                        } else {
                            contents = rows.map(x => Object.assign({}, x, {}));
                        }
                        const page = Object.assign({}, row, { creation_date: dayjs(row.creation_date), pubblication_date: dayjs(row.pubblication_date), contents: contents });
                        resolve(page);
                        return;

                    }
                })
                //nomi delle colonne
            }
        });
    });
}


exports.createPageWithContent = (page) => {

    const sql1 = 'INSERT INTO pages(title, authorId, pubblication_date, creation_date) VALUES(?, ?, ?, DATE(?))';
    const sql2 = 'INSERT INTO contents(pageId, type, text, image) VALUES ' + page.contents.map(() => "(?, ?, ?, ?)").join(', ');
    let contents = [];


    return new Promise((resolve, reject) => {

        let pageid = -1;

        db.run(sql1, [page.title, page.authorId, page.pubblication_date, dayjs().format("YYYY-MM-DD")], function (err) {
            if (err) {
                reject(err);
                return;
            }

            pageid = this.lastID;

            page.contents.forEach((x) => {
                contents.push(pageid, x.type, x.text, x.image);
            });

            db.run(sql2, contents, function (err) {
                if (err) { reject(err); return }
                resolve(pageid)
                return;
            });
        });

    });
}


exports.deletePageWithContent = (id) => {

    return new Promise((resolve, reject) => {
        const sql1 = 'DELETE FROM contents WHERE pageId = ?';
        db.run(sql1, [id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            const sql2 = 'DELETE FROM pages WHERE id = ?';
            db.run(sql2, [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            });
        });
    });


}



// add a new page
exports.updatePageAll = (page, idpage) => {

    return new Promise((resolve, reject) => {

        if (page.hasOwnProperty('authorId')) {

            const editauthorid = 'UPDATE pages SET authorId=? WHERE id = ?';
            db.run(editauthorid, [page.authorId, idpage], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
            });

        }


        const sql = 'UPDATE pages SET title=?, pubblication_date=DATE(?) WHERE id = ?';
        db.run(sql, [page.title, page.pubblication_date, idpage], function (err) {
            if (err) {
                reject(err);
                return;
            }
            const sql1 = 'DELETE FROM contents WHERE pageId = ?';
            db.run(sql1, [idpage], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                const update = async () => {
                    //da rivedere
                    for (const content of page.contents) {
                        try {
                            await createContent(content, idpage);
                        }
                        catch (err) {
                            reject(err);
                            break;
                        }

                    }
                }
                update();
            });

        });





        resolve(idpage);
    });
};



exports.AuthorFromPageid = (pageid) => {
    return new Promise((resolve, reject) => {

        let sql;
        sql = "SELECT pages.authorId FROM users,pages WHERE users.id=pages.authorId AND pages.id=?";

        db.get(sql, [pageid], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) {
                reject("pageid not found");
            }
            else {
                resolve(row.authorId);
            }
        })


    });
}


exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {

        let sql;
        sql = "SELECT id,name FROM users";

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else if (rows === undefined) {
                reject("pageid not found");
            }
            else {
                resolve(rows);
            }
        })


    });
}


exports.checkUserId = (userid) => {
    return new Promise((resolve, reject) => {
        let sql;
        sql = "SELECT * FROM users WHERE id = ?";

        db.all(sql, [userid], (err, row) => {
            if (err) reject(err);
            else if (row === undefined || row.length == 0) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}



// add a new page
function createContent(content, idpage) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO contents(pageId, type, text, image) VALUES(?, ?, ?, ?)';
        db.run(sql, [idpage, content.type, content.text, content.image], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};