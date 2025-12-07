import 'bootstrap/dist/css/bootstrap.min.css';
import { useState} from 'react';
import { Col, Row, Button, Form } from 'react-bootstrap';
import dayjs from 'dayjs';
import Alert from 'react-bootstrap/Alert';
import API from '../API';
import { ContentsManager } from './ContentsManager';

function PageCreator(props) {

    const Page = props.Page;
    const Users = props.Users;

    const [Title, setTitle] = useState(Page ? Page.title : "");
    const [Pubblication_Date, setPubblication_Date] = useState(Page ? dayjs(Page.pubblication_date).isValid() ? dayjs(Page.pubblication_date).format("YYYY-MM-DD") : "" : dayjs().format("YYYY-MM-DD"));
    const [AuthorId, setAuthorId] = useState(Page ? Page.authorId : -1);
    const [Creation_Date, setCreation_Date] = useState(Page ? dayjs(Page.creation_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));


    const [AuthorName, setAuthorName] = useState(Page ? Page.name : "");


    const [Contents, setContents] = useState(Page ? Page.contents : []);

    const [ErrorMsg, setErrorMsg] = useState("");

    const [ErrorMsgTitle, setErrorMsgTitle] = useState(false);

    const [SuccefullMSG, setSuccefullMSG] = useState("");



    function handleSubmit() {

        event.preventDefault();

        //data nel futuro
        if (dayjs(Pubblication_Date).diff(dayjs(), "day") < 0) {
            setErrorMsg("La data di pubblicazione non può essere nel passato");
            return;
        }

        if (Title === "") {
            setErrorMsg("Titolo non può essere vuoto");
            setErrorMsgTitle(true);
            //setTimeout(() => setErrorMsg(""), 4000);
            return;
        }

        //validation
        //avere almeno 1 header + 1 altro blocco
        if (Contents.length < 2) {
            //messaggio errore
            setErrorMsg("Inserisci almeno 2 blocchi di contenuto");
            setTimeout(() => setErrorMsg(""), 4000);
            return;
        }

        let bool;
        Contents.forEach(x => {
            if (x.type === "Header") {
                bool = true;
            }
        })

        if (!bool) {
            setErrorMsg("Inserisci almeno 1 header");
            setTimeout(() => setErrorMsg(""), 4000);
            return;
        }

        setErrorMsgTitle(false);
        setErrorMsg("");

        const page = {
            title: Title,
            pubblication_date: Pubblication_Date,
            contents: Contents
        }

        if (props.Mode === "create") {

            API.addPage(page).then(x => { setSuccefullMSG("Creazione Pagina Riuscita! Ritorno Alla Home"); setTimeout(() => { setSuccefullMSG(""); props.ReturnMode(x) }, 1500) }).catch(x => setErrorMsg("Impossibile creare la pagina, riprova piu' tardi"));
        }

        if (props.Mode === "edit") {
            page.authorId = AuthorId;
            API.updatePage(page, props.PageId).then(x => { setSuccefullMSG("Aggiornamento Pagina Completato!"); setTimeout(() => { setSuccefullMSG(""); props.ReturnMode(x) }, 1500) }).catch(x => setErrorMsg("Impossibile aggiornare la pagina, riprova piu' tardi"));
        }

    }



    return (
        <>
            <Row className='border border-2 border-secondary bg-secondary-subtle '>
                {props.Mode == "view" &&
                    <>
                        <Col>
                            <Row>
                                <h1 className="text-center" id="filtro-label">{Title.toUpperCase()}</h1>
                            </Row>
                            <Row className='text-center'>
                                <Col>
                                    <h5 className="text-center" id="filtro-label">{"Data di Creazione: " + Creation_Date}</h5>
                                    <h5 className="text-center" id="filtro-label">{Pubblication_Date ? ("Data di Pubblicazione: " + (Pubblication_Date)) : "Bozza"}</h5>
                                </Col>
                                <Col>
                                    <h5 className="text-center" id="filtro-label">{"Autore: " + AuthorName}</h5>
                                </Col>
                            </Row>
                        </Col>
                    </>
                }

                {props.Mode != "view" &&
                    <>
                        <Form onSubmit={handleSubmit}>
                            <Row className='my-3 input-group'>
                                <Col className='col-4'>
                                    <Form.Label>Titolo:</Form.Label>
                                    <Form.Group>
                                        <Form.Control className={(ErrorMsgTitle && "is-invalid") + " text-center"} type='text' name="Title" value={Title} onChange={ev => { setTitle(ev.target.value); setErrorMsgTitle(false); if (ev.target.value === "") { setErrorMsgTitle(true); } if (ErrorMsgTitle) { setErrorMsg(""); } }}></Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col className='col-3'>
                                    <Form.Label>Data di pubblicazione:</Form.Label>
                                    <Form.Group>
                                        <Form.Control type='date' className="text-center" name="Pubblication_date" value={Pubblication_Date} onChange={ev => setPubblication_Date(ev.target.value)}></Form.Control>
                                    </Form.Group>
                                </Col>
                                {
                                Users &&
                                    <>
                                        <Col className='col-2 my-2'>
                                            <Form.Label>Autore:</Form.Label>
                                            <Form.Group >
                                                <select className="text-center" value={AuthorId} onChange={ev => setAuthorId(ev.target.value)}>
                                                    {
                                                        Users.map(x => <option value={x.id} key={x.id}>{x.name}</option>)
                                                    }
                                                </select>
                                            </Form.Group>
                                        </Col>
                                    </>
                                }
                                <Col className='col-1 my-4 me-4'>
                                    <Button type='submit' className="btn btn-success text-center">{props.Mode == "edit" && "Aggiorna"}{props.Mode == "create" && "Salva"}</Button>
                                </Col>
                                <Col className='col-1 my-4'>
                                    <Button className="btn btn-danger text-center" onClick={() => { setErrorMsgTitle(false); setErrorMsg(""); props.ReturnMode(props.PageId); }}>Annulla</Button>
                                </Col>
                                {ErrorMsg &&
                                    <Col className='col-fill'>
                                        <Alert variant="danger my-0 pb-2" onClose={() => { setErrorMsg(""); setErrorMsgTitle(false); }} dismissible>
                                            <h5>{ErrorMsg}</h5>
                                        </Alert>
                                    </Col>
                                }
                                {
                                    SuccefullMSG &&
                                    <Col className='col-fill'>
                                        <Alert variant="success my-0 pb-2">
                                            <h5>{SuccefullMSG}</h5>
                                        </Alert>
                                    </Col>
                                }
                            </Row>
                        </Form>
                    </>
                }
            </Row>
            <Row className='my-3'>
                {
                    Contents &&
                    <ContentsManager Contents={Contents} Mode={props.Mode} UploadContents={x => setContents(x)}></ContentsManager>
                }
            </Row>

        </>
    )
}




export { PageCreator }