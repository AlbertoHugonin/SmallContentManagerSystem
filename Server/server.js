"use strict"

const express = require('express');
const morgan = require('morgan');
const { body, check, validationResult, } = require('express-validator');
const cors = require('cors');
const fs = require('fs')
const dayjs = require('dayjs');


const AuthAddon = require('./AuthAddon.js');
const gestore_server = require('./gestore_server.js');

const PORT = 3001;


//CONFIGURAZION EXPRESS

let app = express();
app.use(morgan('dev'));
app.use(express.json());
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
app.use(express.static('public'));

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));


app = AuthAddon.SettingUp(app);


//API PER APP//



//API CHE RECUPERA TUTTI GLI USERS

app.get('/api/users', AuthAddon.isLoggedIn,
  async (req, res) => {

      if (req.user.role===0) {
        gestore_server.getAllUsers().then(pages => res.json(pages)).catch((err) => res.status(500).json(err));
      } else {
        res.status(500).json("Permessi non abbastanza elevati");
      }

  }
);

//RECUPERA LISTA DI IMMAGINI

app.get('/api/images',
  (req, res) => {
    const files = fs.readdirSync("./public/images");
    res.json(files);
  }
);


//API CHE RECUPERA TUTTE LE PAGINE PUBBLICATE SENZA CONTENUTO

app.get('/api/pages',
  (req, res) => {
    gestore_server.getAllPages((req.isAuthenticated()) ? req.user.id : false).then(pages => res.json(pages)).catch((err) => res.status(500).json(err));
  }
);

//API CHE RECUPERA IL NOME DEL SITO
app.get('/api/sitename',
  (req, res) => {
    fs.readFile('./sitename.txt', 'utf8', (err, data) => {
      if (err) {
        res.status(500).json(err)
        return;
      }
      res.status(202).json(data);
    });
  }
);

//API CHE MODIFICA IL NOME DEL SITO

app.put('/api/sitename', AuthAddon.isLoggedIn, [

  check('name').isString().isLength({ min: 1, max: 100}), 

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (req.user.role===1) {
    return res.status(503).json({ error: `Not Enaugh Privileges` });
  }

  fs.writeFile('sitename.txt', req.body.name, 'utf-8', function (err) {
    if (err) {
      res.status(503).json({ error: `Errore Modifica NomeSito` });
    };
    res.status(201).json(req.body.name);
  });

});


//RECUPERA PAGINA CON CONTENUTO

app.get('/api/pages/:id', check('id').isInt(),
  (req, res) => {
    const errors = validationResult(req);
    //se ci sono errori nella validazione ritorniamoli
    if (!errors.isEmpty()) {
      return res.status(422).json(errors);
    }

    gestore_server.getPageAll(req.params.id, (req.isAuthenticated()) ? req.user.id : false).then(pages => res.status(202).json(pages)).catch((err) => res.status(500).json(err));
  }
);




//AGGIUNTA DI UNA PAGINA

app.post('/api/pages', AuthAddon.isLoggedIn, [

  check('title').isLength({ min: 1 }), 
  check('pubblication_date').optional({ nullable: true, checkFalsy: true }).isDate({ format: 'YYYY-MM-DD', strictMode: false }),
  check('contents').isArray({ min: 2 }),
  check('contents.*.type').isString().isIn(['IMG', 'Text', 'Header']),
  check('contents.*.image').isString().optional({ nullable: true, checkFalsy: true }),
  check('contents.*.text').isString().optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (dayjs(req.body.pubblication_date).diff(dayjs(),"day") < 0) {
    return res.status(503).json({ error: `Invalid Data` });
  }


  const page = {
    title: req.body.title,
    authorId: req.user.id,
    pubblication_date: req.body.pubblication_date,
    contents: req.body.contents
  };

  try {
    const pageId = await gestore_server.createPageWithContent(page);
    res.status(201).json(pageId); //ritorna id pagina appena creata
  } catch (err) {
    res.status(503).json({ error: `Errore Database Creazione Pagina` });
  }

});



//CANCELLAZIONE DI UNA PAGINA

app.delete('/api/pages/:id', AuthAddon.isLoggedIn, [
  check('id').isInt(),
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if (req.user.role===1) {
    //se non è amministratore controlliamo che la pagina sia sua
    let authorId;
    try {
      authorId = await gestore_server.AuthorFromPageid(req.params.id);
    }
    catch (err) {
      return res.status(503).json({ error: `PageId Not Found` });
    }
    if (req.user.id != authorId) {
      return res.status(503).json({ error: `Not enough Privilages` });
    }
  }

  try {
    const pageId = await gestore_server.deletePageWithContent(req.params.id);
    res.status(202).json(pageId); //ritorna id pagina appena cancellata
  } catch (err) {
    res.status(503).json({ error: `Erorre cancellazione pagina` });
  }

});



//MODIFICA DI UNA PAGINA

app.put('/api/pages/:id', AuthAddon.isLoggedIn, [

  check('title').isLength({ min: 1 }),
  check('pubblication_date').optional({ nullable: true, checkFalsy: true }).isDate({ format: 'YYYY-MM-DD', strictMode: false }),
  check('contents').isArray({ min: 2 }),
  check('contents.*.type').isString().isIn(['IMG', 'Text', 'Header']),
  check('contents.*.image').isString().optional({ nullable: true, checkFalsy: true }),
  check('contents.*.text').isString().optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }),
  check('id').isInt(),
  check('authorId').isInt().optional({ nullable: true, checkFalsy: true  })

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const idpage = req.params.id;

  if (dayjs(req.body.pubblication_date).diff(dayjs(),"day") < 0) {
    return res.status(503).json({ error: `Invalid Data` });
  }

  let page = {
      title: req.body.title,
      pubblication_date: req.body.pubblication_date,
      contents: req.body.contents
    };

    //se amministratore ha inserito authorid

  if (req.body.authorId) {

    if (req.user.id != req.body.authorId && req.user.role===1) {
      return res.status(503).json({ error: `Not enough Privilages` });
    }

    //controllo correttezza id autore
    const idexist = await gestore_server.checkUserId(req.body.authorId)

    if (!idexist) {
      return res.status(503).json({ error: `User Not Found` });
    }
    
    page.authorId = req.body.authorId;

  }

  try {
    const pageId = await gestore_server.updatePageAll(page, idpage);
    res.status(201).json(pageId); //rutorna id della pagina modificata
  } catch (err) {
    res.status(503).json({ error: `Errore modifica pagina` });
  }

});