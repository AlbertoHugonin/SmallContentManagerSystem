import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css'
import { Col, Container, Row, Button, Form, Table } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {BackOfficeRoute} from './routes/BackOfficeRoute';
import AuthContext from './Contexts'
import API from './API';

let didinit = false;

function App() {

  const [auth,setAuth] = useState({});

  const [SiteName,setSiteName] = useState("");


  useEffect(() => {

    if(!didinit) {
      
      didinit = true;

      API.getUserInfo().then(x => {
        setAuth({
        propagateauth: PropagateAuth,
        info: x, })
        //
       }).catch( x => {setAuth({
        propagateauth: PropagateAuth,
        info: x,
      })})  
  
      API.GetSiteName().then( x => setSiteName(x)).catch(error => setSiteName("Cannot Get Sitename"));

    }

    

}, []);

function PropagateAuth(user) {

  setAuth({propagateauth: PropagateAuth,
    info: user,
    });

    

}



  return ( 

    <>
    <AuthContext.Provider value={auth}>
    <BrowserRouter> 
    <Routes>
      <Route path='/'  element={ <BackOfficeRoute SiteName={SiteName} Mode={"view"}/>}/>
      <Route path='/back-office'  element={ <BackOfficeRoute SiteName={SiteName} Mode={"edit"}/> }  />
      <Route path='/back-office/add'  element={ <BackOfficeRoute  SiteName={SiteName} Mode={"create"}/> }  />
      <Route path='/*' element={<Navigate replace to='/' />} />
    </Routes>
  </BrowserRouter>
  </AuthContext.Provider>


    </>

  )
}

export default App
