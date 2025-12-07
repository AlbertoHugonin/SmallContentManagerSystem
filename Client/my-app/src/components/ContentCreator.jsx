import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Col, Row, Button, Form, Alert } from 'react-bootstrap';



function ContentCreator(props) {


    const [Type, setType] = useState(props.Content.type || "Header");
    const [Text, setText] = useState(props.Content.text || "");
    const [Image, setImage] = useState(props.Content.type == "IMG" ? props.Content.image : props.Images[0]);

    const [ErrorMsg, setErrorMsg] = useState("");


    function handleSubmit() {

        event.preventDefault();

        let content;
        if (Type === "Header" || Type === "Text") {
            if (Text == "") {
                setErrorMsg("Il campo non può essere vuoto");
                return;
            }
            content = {
                type: Type,
                text: Text,
                image: ""
            }
        }
        if (Type === "IMG") {
            content = {
                type: Type,
                text: "",
                image: Image? Image : props.Images[0]
            }

        }

        props.SaveContent(content);
    }


    return (
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col className='col-1 my-2 py-2'>
                        <select value={Type} onChange={ev => setType(ev.target.value)}>
                            <option value="Header">Header</option>
                            <option value="Text">Text</option>
                            <option value="IMG">IMG</option>
                        </select>
                    </Col>
                    {
                        (Type === "IMG")?
                        <>
                            <Col className='col-3 my-auto'>
                                <Form.Group>
                                    <select value={Image} onChange={ev => setImage(ev.target.value)}>
                                        {
                                            props.Images.map(x => <option value={x} key={x}>{x}</option>)
                                        }
                                    </select>
                                </Form.Group>

                            </Col>
                            <Col>
                                <img className="img-thumbnail rounded mx-auto d-block" src={"http://localhost:3001/images/" + (Image? Image : props.Images[0])} />
                            </Col>
                        </>
                    :
                        <Col className='col-9 my-2'>
                            <Form.Group>
                                <Form.Control as="textarea" className={"input-group-text text-start " + (ErrorMsg && "is-invalid")} type='text' value={Text} onChange={ev => { setText(ev.target.value); setErrorMsg("") }}></Form.Control>
                            </Form.Group>
                        </Col>
                    }

                    <Col className='col-2 my-2'>
                        <Button type='submit' className="btn btn-success text-center">SAVE CONTENT</Button>
                    </Col>


                    {ErrorMsg &&
                        <Col className='col-3'>
                            <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>
                                <h6>{ErrorMsg}</h6>
                            </Alert>
                        </Col>
                    }


                </Row>
            </Form>
    )
}

export { ContentCreator }