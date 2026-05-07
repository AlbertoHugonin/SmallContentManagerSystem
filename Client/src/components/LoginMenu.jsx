import { Form, Button, Alert, Container, Row} from 'react-bootstrap';
import { useContext, useState } from 'react';
import API from '../API';
import AuthContext from '../Contexts'


function LoginForm(props) {
  const [username, setUsername] = useState('stefano@test.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('');

  const auth = useContext(AuthContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    if (username === '') {
      setErrorMessage('Inserisci Username');
      return;
    }
    if (password === '') {
      setErrorMessage('Inserisci Password');
      return
    }

    API.logIn(credentials)
    .then(user => {
      setErrorMessage('');
      auth.propagateauth(user);
      props.ChangeLoginState("in");
    })
    .catch(err => {
      // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
      setErrorMessage('username o password errata');
    })

  };

  return (
    <Container fluid>
      {auth.info.hasOwnProperty('error') &&
        <Form onSubmit={handleSubmit} >
          <Row className='my-2'>
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
          </Row>
          <Row className='my-2'>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
          </Row>
          <Row className='my-2 me-auto ms-auto mt-3 w-50'>
            <Button type='submit'>Login</Button>
          </Row>
          <Row className='me-auto ms-auto mt-3'>
            {errorMessage ? <Alert variant='danger' className='w-100' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
          </Row>
        </Form>
      }
      {!auth.info.hasOwnProperty('error') &&
        <>
          <Row className='m-3'>
            <Button type='submit' onClick={() => {
              API.logOut().then(x => {setErrorMessage('');props.ChangeLoginState("out");}).catch(() => setErrorMessage('Errore Server Durante Logout'));
            }}>Logout</Button>
          </Row>
          <Row className='me-auto ms-auto mt-3'>
            {errorMessage ? <Alert variant='danger' className='w-100' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
          </Row>
        </>
      }
    </Container>
  )
}

export { LoginForm };