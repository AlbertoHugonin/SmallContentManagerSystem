const API_BASE = import.meta.env.VITE_API || `${window.location.origin}/api`;
const URL = API_BASE.replace(/\/$/, '');

import {SIMULATEERROR} from './Globals.jsx'



async function GetPages() {

  return new Promise((resolve, reject) => {

    fetch(URL+"/pages", {credentials: 'include'})
    .then( response => {
      if (response.ok) {
        response.json().then(pages => resolve(pages)).catch((x) => reject ({error: "Cannot Get Pages", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors;

});

}

async function GetUsers() {

  return new Promise((resolve, reject) => {

    fetch(URL+'/users', {credentials: 'include'})
    .then( response => {
      if (response.ok) {
        response.json().then(users => resolve(users)).catch((x) => reject ({error: "Cannot Get Users (server error)", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) }); 
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); 

});

}

async function GetImages() {


  return new Promise((resolve, reject) => {

    fetch(URL +"/images")
    .then( response => {
      if (response.ok) {
        response.json().then(images => resolve(images)).catch((x) => reject ({error: "Cannot Get Images (server error)", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) }); 
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); 

});

}


async function GetSiteName() {

  return new Promise((resolve, reject) => {

    fetch(URL+"/sitename")
    .then( response => {
      if (response.ok) {
        response.json().then(sitename => resolve(sitename)).catch((x) => reject ({error: "Cannot Get SiteName", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors;

});
}

async function EditSiteName(name) {

  return new Promise((resolve, reject) => {

    fetch(URL+'/sitename', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name:name}),
    })
    .then( response => {
      if (response.ok) {
        response.json().then(sitename => resolve(sitename)).catch((x) => reject ({error: "Cannot Get SiteName (server error)", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors;

});
}




async function GetPageAll(id) {

  return new Promise((resolve, reject) => {

    fetch(URL+'/pages/'+id, {credentials: 'include'})
    .then( response => {
      if (response.ok) {
        response.json().then(page => resolve(page)).catch((x) => reject ({error: "Cannot Get Page (server error)", details: x}));
      } else {
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
  }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors;

});

}

//funzione creazione pagina

async function addPage(page) {
  // call  POST /api/answers
  return new Promise((resolve, reject) => {

    
    if (SIMULATEERROR==true) {
      reject("Errore Simulated");
      return;
    }

    fetch(URL+'/pages/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, page, {})),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function deletePage(id) {

  return new Promise((resolve, reject) => {
    fetch(URL+'/pages/'+id, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}



async function updatePage(page,pageid) {

  if (SIMULATEERROR==true) {
    reject("Errore Simulated");
    return;
  }

  return new Promise((resolve, reject) => {
    fetch(URL+'/pages/'+pageid, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, page, {})),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}



async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {

  if (SIMULATEERROR) {
    throw "error";
  }
  const resp = await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
  const confirmation = await resp.json();
  if (resp.ok) {
    return confirmation;
  } else {
    throw confirmation;  // an object with the error coming from the server
  }
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}



const API = {
  logIn, logOut, getUserInfo, GetPages, addPage, updatePage, GetUsers, GetImages, GetPageAll, deletePage, GetSiteName, EditSiteName
};
export default API;