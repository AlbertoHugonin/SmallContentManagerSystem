import 'bootstrap/dist/css/bootstrap.min.css';
import { useState} from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import API from '../API';
import Image from 'react-bootstrap/Image';
import { ContentCreator } from './ContentCreator';
import { PencilSquare, Trash, ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';


function ContentsManager(props) {


    const [Edit, setEdit] = useState(false);
    const [CreateContent, setCreateContent] = useState(false);

    //id del contenuto che si va a modificare
    const [EditingId, setEditingId] = useState();

    const [Contents, setContents] = useState(props.Contents);

    const [Images, setImages] = useState([]);


    function CaricaFoto() {
        API.GetImages().then(x => setImages(x)).catch( () => setImages([]));
    }


    function SaveContent(content) {

        if (Edit === true) {

            const newarr = Contents.map((x, index) => {
                if (index === EditingId) {
                    return Object.assign(content, { mark: true });
                } else {
                    return x;
                }
            });
            setContents(newarr);
            props.UploadContents(newarr);
            setEdit(false);

            setTimeout(() => {

                newarr[EditingId].mark = false;
                setContents([...newarr]);

            }, 400);

            return;
        }

        setContents((oldcontents) => {
            props.UploadContents([content, ...oldcontents]);
            return [content, ...oldcontents];
        })

        //deve stare alla fine se no warning
        setCreateContent(false);

    }

    function EditContent(index) {
        if (Edit == false) {

            const new_arr = [...Contents];

            new_arr[index].edit = true;
            setContents(new_arr);

            setCreateContent(false);

            setEdit(true);
            setEditingId(index);
        }
    }

    function MoveContent(index, direction) {

        if ((index === 0 && direction === 0) || Contents.length === index + 1 && direction != 0) {
            return;
        }

        const new_arr = [...Contents];

        new_arr.forEach((x) => {
            x.mark = false;
        })

        const removed = new_arr.splice(index, 1)[0];
        let new_index;

        if (direction === 0) {
            new_arr.splice(index - 1, 0, removed);
            new_index = index - 1;
        }
        else {
            new_arr.splice(index + 1, 0, removed);
            new_index = index + 1;

        }

        new_arr[new_index].mark = true;

        setContents(new_arr);
        props.UploadContents(new_arr);

        setTimeout(() => {

            new_arr[new_index].mark = false;
            setContents([...new_arr]);

        }, 470);
    }

    function DeleteContent(index) {

        const new_arr = [...Contents];
        new_arr.splice(index, 1)[0];
        setContents(new_arr);
        props.UploadContents(new_arr);
    }


    return (
        <>
            {/* Stampa il contenuto */}
            <Container fluid >

                {
                    props.Mode != "view" &&

                    <Row className='mb-2 ps-1'>
                        <Col className='col-2'>

                            <Button className="btn btn-primary text-center" onClick={() => { setCreateContent(old => !old); CaricaFoto(); }}>ADD CONTENT</Button>
                        </Col>

                    </Row>
                }

                <Row>
                    {(CreateContent) && !Edit &&
                        <ContentCreator className="my-2" SaveContent={SaveContent} Images={Images} Content=""></ContentCreator>
                    }

                </Row>

                {Contents.map((x, index) => {
                    return (
                        <Row key={index} className={'border border-3 border-secondary my-2 pt-2 pb-1' + (x.mark == true || x.edit ? " bg-info-subtle" : " bg-secondary-subtle")}>
                            {x.edit &&
                                <Row>
                                    <ContentCreator SaveContent={SaveContent} Images={Images} Content={x}></ContentCreator>
                                </Row>
                            }

                            <Col className='col-auto-fill text-start'>

                                <h5>{x.type}</h5>
                                {
                                    (x.type == "Header" || x.type == "Text") &&

                                    <h2 className='text-break'>{x.text}</h2>

                                }
                                {
                                    x.type == "IMG" &&

                                    <h4>{x.text}{x.image && (<Image src={"http://localhost:3001/images/" + x.image} fluid />)}</h4>

                                }
                            </Col>
                            {props.Mode != "view" &&
                                <Col className='col-2 mt-1'>
                                    <Row>
                                        <Col className='col-sm-6'>
                                            <Button className="mt-1 mx-2" onClick={x => MoveContent(index, 0)}><ArrowUpCircle size={26} /></Button>
                                            <Button className="mt-2 mb-1" onClick={x => MoveContent(index, -1)}><ArrowDownCircle size={26} /></Button>

                                        </Col>
                                        <Col className='col-sm-6'>
                                            <Button className="mt-1 mx-2" onClick={x => { EditContent(index); CaricaFoto() }}><PencilSquare size={26} /></Button>
                                            <Button className="mt-2 mb-1" onClick={x => DeleteContent(index)}><Trash size={26} /></Button>
                                        </Col>
                                    </Row>
                                </Col>
                            }
                        </Row>
                    )
                })
                }
            </Container>
        </>
    )







}




export { ContentsManager }