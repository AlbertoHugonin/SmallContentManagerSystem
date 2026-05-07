import { Form, Button, Container, Row, Col, Dropdown } from 'react-bootstrap';
import { LoginForm } from '../components/LoginMenu';
import { useState, useContext } from 'react'
import { PersonCircle, CardList, Pencil, CheckSquareFill, XSquareFill } from 'react-bootstrap-icons';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../API';
import AuthContext from '../Contexts'

function NavBarComponent(props) {

  const auth = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [Open, setOpen] = useState(false);

  const [EditSiteName, setEditSiteName] = useState("");
  const [Edit, setEdit] = useState(false);

  const [LoginState, setLoginState] = useState(false);

  const [CanSee, setCanSee] = useState(false);

  function ChangeLoginState(state) {
    setCanSee(true);
    // operazioni
    if (state === "in") {
      setLoginState(true);
      CloseDropdown();
      props.reload();
      navigate("/back-office");
    }
    if (state === "out") {
      setLoginState(false);
      auth.propagateauth({error: "IsLoggedOut"});
      CloseDropdown();
      props.reload();
      navigate("/");
    }

    setTimeout(() => {

      setCanSee(false);

    }, 3000);
  }

  function CloseDropdown() {
    setOpen(false);
  }

  function ChangeSiteName() {
    API.EditSiteName(EditSiteName).catch((x) => console.log(x));
    setEdit(false);
  }

  return (
    <>
      <Navbar className='bg-primary pt-0 pb-0 border border-2 border-black mb-2 me-0' >
        <Container className='me-4'fluid>

          <Col className='input-group'>

            <CardList size={34} className='mt-2' />
            {
              !Edit &&
              <h3 className='text-black mt-2 ms-2'>
                {EditSiteName ? EditSiteName : props.SiteName}
              </h3>
            }

            {
              Edit &&
              <Form.Group>
                <Form.Control className="ms-3 mt-1" type='text' value={EditSiteName} onChange={ev => { setEditSiteName(ev.target.value) }}></Form.Control>

              </Form.Group>
            }

            { auth.info && auth.info.role==0 &&
              location.pathname === "/back-office" && !Edit &&
              <Button className="border border-2 rounded-5 border-info ms-1 mb-1 mt-1 me-2" onClick={() => { setEdit(true); API.GetSiteName().then(x => setEditSiteName(x)).catch(() => setEditSiteName("Cannot Get SiteName"))}}>
                <Pencil size={20} className='me-2' /> Cambia Nome Sito</Button>

            }

            {
              Edit &&
              <>
                <Button className="ms-3 my-1 me-0 pe-1" onClick={() => ChangeSiteName()}><CheckSquareFill size={28} /></Button>
                <Button className="ms-0 my-1" onClick={() => { setEdit(false);  API.GetSiteName().then(x => setEditSiteName(x)).catch(() => setEditSiteName("Cannot Get SiteName")) }}><XSquareFill size={28} /></Button>
              </>
            }
            <h6 className='mt-3 mb-0 ms-2 '> /{location.pathname.slice(1).toUpperCase()? location.pathname.slice(1).toUpperCase() : "FRONT-OFFICE"}</h6>

          </Col>

          {
            LoginState && CanSee &&
            <div className="alert alert-success mb-1 py-1" role="alert">
              <h4 className='mt-auto mb-auto'>Benvenuto!! {auth.info.name}</h4>
            </div>
          }
          {
            !LoginState && CanSee &&
            <div className="alert alert-danger mb-1 py-1" role="alert">
              <h4 className='mt-auto mb-auto'>Arrivederci!!!</h4>
            </div>
          }

          <Col className='col-5 text-end'>
            <Row>
              <Col className='col-auto-fill text-end my-auto pe-0'>
                <Button className='bg-primary-subtle ps-1 pe-1 py-0 me-3' onClick={
                    () => {
                      //cambio a route back
                      navigate("/");
                      props.reload();
                    }}><h5 className='text-black my-auto'>HOME</h5></Button>
                <Button className='bg-primary-subtle ps-1 pe-1 py-0 me-3' onClick={
                  () => {
                    //cambio a route back
                    if (auth.info && !auth.info.name) {
                      setOpen(true);
                    } else {
                      navigate("/back-office");
                      props.reload();
                    }
                    
                  }}><h5 className='text-black my-auto'>BACK-OFFICE</h5></Button>

                {(location.pathname === "/back-office") &&
                  <Button type='submit' className='bg-success border-black ps-1 pe-1 py-0 me-1' onClick={
                    () => {
                      //cambio a route back
                      navigate("/back-office/add");
                    }
                  }>
                    <h5 className='text-black my-auto'>CREATE PAGE</h5>
                  </Button>
                }
              </Col>

              <Col className='col-4 text-start border-2 border-start border-black'>
                <Dropdown align="end" className='w-100' show={Open} onToggle={setOpen}>
                  <Row>
                    <Col className='col-auto-fill my-auto'>
                      {
                        auth.info && auth.info.name &&
                        <div className='my-auto text-black input-group'><h5 className='my-auto text-dark'>{auth.info.name.toUpperCase()}</h5><h6 className="ms-2 text-white-50 my-auto">({auth.info.role==0?"Admin":"Utente"}) </h6><h6 className='my-auto ms-0 text-white-50'>{auth.info.username}</h6></div>
                      }
                    </Col>
                    <Col className='col-3'>
                      <Dropdown.Toggle onClick={() => setOpen(true)}>
                        <PersonCircle size={32} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <LoginForm CloseDropdown={CloseDropdown} ChangeLoginState={ChangeLoginState}></LoginForm>
                      </Dropdown.Menu>
                    </Col>
                  </Row>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Container>
      </Navbar>
    </>


  )
}

export { NavBarComponent }