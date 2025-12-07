'use strict';


const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
/* Data Access Object (DAO) module for accessing users */
const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database('cmsmall.sqlite', (err) => {
  if(err) throw err;
});


this.SettingUp = (app) => {

    // set up the session
  app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
    resave: false,
    saveUninitialized: false 
  }));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser()
          return res.json(req.user);
        });
    })(req, res, next);
  });
  
  // ALTERNATIVE: if we are not interested in sending error messages...
  /*
  app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.json(req.user);
  });
  */
  
  // DELETE /sessions/current 
  // logout
  app.delete('/api/sessions/current', (req, res) => {
    req.logout( ()=> { res.status(200).json("LogOutOk"); } );
  });
  
  // GET /sessions/current
  // check whether the user is logged in or not
  app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Unauthenticated user!'});;
  });


return app;
}
  

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function(username, password, done) {
      getUser(username, password).then((user) => {
        if (!user)
          return done(null, false, { message: 'Incorrect username and/or password.' });
          
        return done(null, user);
      })
    }
  ));
  
  // serialize and de-serialize the user (user object <-> session)
  // we serialize the user id and we store it in the session: the session is very small in this way
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // starting from the data in the session, we extract the current (logged-in) user
  passport.deserializeUser((id, done) => {
    getUserById(id)
      .then(user => {
        done(null, user); // this will be available in req.user
      }).catch(err => {
        done(err, null);
      });
  });

// custom middleware: check if a given request is coming from an authenticated user
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
      return next();
    
    return res.status(401).json({ error: 'Not authenticated'});
  }


//database functions

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
          const user = {id: row.id, username: row.email, name: row.name, role: row.role}
          resolve(user);
        }
    });
  });
};



const getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = {id: row.id, username: row.email, name: row.name, role: row.role};
          
          const salt = row.salt;
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);

            const passwordHex = Buffer.from(row.password, 'hex');

            if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            else resolve(user); 
          });
        }
      });
    });
  };