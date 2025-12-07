import { useState, useEffect, useContext } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row } from 'react-bootstrap';
import API from '.././API';
import { NavBarComponent } from '.././components/NavBar';
import { PagesBar } from '.././components/PagesBar';
import AuthContext from '../Contexts'
import { PageCreator } from '.././components/PageCreator';
import { useNavigate } from 'react-router-dom';
import { SIMULATEDELAY } from '../Globals';

function BackOfficeRoute(props) {

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    //contiene lista pagine
    const [Pages, setPages] = useState([]);

    const [Dirty, setDirty] = useState(true);

    const [Mode, SetMode] = useState("view");

    const [CanTouch, setCanTouch] = useState(true);

    const [LoadedId, setLoadedId] = useState(-1);

    const [Alert, setAlert] = useState("");

    const [ErrorMSG, setErrorMSG] = useState("");

    const [Users, setUsers] = useState();



    async function loadContent(id) {

        //SERVE SOLO PER BLOCCARE I TASTI
        if (Mode == "edit" || Mode == "create") {
            setAlert("border-danger");
            setTimeout(() => setAlert(""), 1000);
            return;
        }

        const newarr = [...Pages];

        for (let elem of newarr) {
            if (elem.id === id) {
                //se elem contiene già contenuto mettiamo su active
                if (elem.contents) {
                    elem.active = "active"
                }
                else {
                    let cont;
                    try {
                        cont = await API.GetPageAll(id);
                    }
                    catch (error) {
                        //error with the server
                        setErrorMSG("Impossibile comunicare con il server...Riprovare piu' tardi!")
                        return;
                    }
                    elem.contents = cont.contents;
                    elem.active = "active";
                }
            } else {
                elem.active = "";
            }
        }

        setPages(newarr);
        setLoadedId(id);
    }


    async function StartLoading() {

        let pageslist;
        //aggiungere controllo log in
        try {
            pageslist = await API.GetPages();
        }
        catch (error) {
            //error with the server
            setErrorMSG("Impossibile comunicare con il server...Riprovare piu' tardi!")
            return;
        }

        if (auth.info && auth.info.role == 0) {

            //setAuthorId(auth.info.id);
            let users;
            try {
                users = await API.GetUsers();
            }
            catch (x) {
                setUsers([]);
                return;
            }
            setUsers(users);
        }

        if (pageslist.length != 0) {

            let id = LoadedId == -1 ? pageslist[0].id : LoadedId;


            API.GetPageAll(id).then(cont => {
                setPages(pageslist.map((x) => {

                    if (x.id == id) {
                        return Object.assign({}, x, { active: "active", contents: cont.contents })
                    }
                    return Object.assign({}, x, { active: "" });
                }))
                setLoadedId(id);
            }).catch(() => setErrorMSG("Impossibile comunicare con il server...Riprovare piu' tardi!"));
        } else {
            setPages([]);
        }

        setCanTouch(true);

        setTimeout(() => setDirty(false), SIMULATEDELAY);

    }


    useEffect(() => {

        if (auth.info && auth.info.hasOwnProperty("error") && props.Mode == 'edit') {
            //rimanda pagina principale se non loggato
            navigate("/");
            setLoadedId(-1);
            setDirty(true);
        }


        if ((Dirty == true)) {
            StartLoading();
        }


    }, [auth.info, Dirty, props.Mode]);



    async function DeletePage(id) {
        await API.deletePage(id);
        setLoadedId(-1);
        setDirty(true);
        navigate("/back-office")
    }

    function EditPage(id) {
        setCanTouch(false);
        loadContent(id);
        SetMode("edit");
    }


    function ReturnMode(id) {

        SetMode("view");

        if (id != LoadedId) {
            setLoadedId(id);
        }

        setDirty(true);
        setCanTouch(true);
        navigate("/back-office");
    }

    function reload() {
        setLoadedId(-1);
        setDirty(true);
    }


    return (

        <>


            <>
                <NavBarComponent SiteName={props.SiteName} reload={reload}></NavBarComponent>

                <Container className="text-center" fluid>

                    {!Dirty && Pages.length > 0 && props.Mode != "create" &&

                        <Row className='me-auto'>


                            <Col id="col-left" className="col-auto-fill bg-info collapse show">
                                <PagesBar Pages={Pages} CanTouch={CanTouch} loadContent={loadContent} auth={auth.info} DeletePage={DeletePage} EditPage={EditPage} Mode={props.Mode}></PagesBar>
                            </Col>
                            <Col id="col-right" className={"border border-4 border-primary pt-4 bg-white " + (props.Mode === "view" ? "col-9 " : "col-8 ") + Alert}>

                                <Container fluid>

                                    {/* key serve per far cambiare le informazioni della pagina come il titolo */}
                                    <PageCreator key={LoadedId} Mode={Mode} PageId={LoadedId} Users={Users} Page={Pages.filter(x => x.id == LoadedId)[0]} ReturnMode={ReturnMode}></PageCreator>

                                </Container>
                            </Col>
                        </Row>
                    }
                    {
                        !Dirty && Pages.length == 0 && props.Mode != "create" &&

                        <Row className=' ms-auto me-auto bg-warning py-3 pt-4'>
                            <h5>Non ci sono pagine pubbliche, accedi dal menu sulla destra per vedere quelle non ancora pubblicate e inserirne delle altre!!</h5>
                        </Row>

                    }
                    {
                        props.Mode === "create" //&& Pages.length == 0 &&
                        &&
                        <Col id="col-right" className={"border border-4 border-primary pt-4 bg-white ps-3 pe-3"}>
                            <Container fluid>

                                <PageCreator key={-1} Mode={props.Mode} Users={Users} PageId={LoadedId} ReturnMode={ReturnMode}></PageCreator>

                            </Container>
                        </Col>

                    }
                    {
                        ErrorMSG &&
                        <Row className=' ms-auto me-auto bg-danger py-3 pt-4'>
                            <h3>{ErrorMSG}</h3>
                        </Row>
                    }

                    {/* PLACEHOLDER FOR LOADING */}
                    {
                        Dirty && props.Mode != "create" &&

                        <Row className='me-auto'>

                            <Col className="col-auto-fill bg-info collapse show">

                                <div className="placeholder list-group list-group-flush bg-transparent ">

                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>
                                    <a href="#" className="placeholder-glow border border-4  rounded-4 list-group-item list-group-item-action mb-2 disabled ">
                                        <Row className='placeholder border border-5  rounded-4 ms-auto me-2 '>

                                            <Col className='placeholder col-push-9 ms-0 my-auto'>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h3 className='placeholder '>PLACEHOLDER</h3>
                                                <h4 className='placeholder '>PLACEHOLDER</h4>
                                            </Col>

                                        </Row>
                                    </a>

                                </div>


                            </Col>
                            <Col className="border border-4 border-primary col-9">
                                <div className="list-group list-group-flush bg-transparent mt-3 ">
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                    <Row className="placeholder placeholder-lg col-12 ms-auto me-auto my-1"><h1>PLACEHOLDER</h1></Row>
                                </div>
                            </Col>

                        </Row>
                    }
                </Container>
            </>
        </>
    )

}


export { BackOfficeRoute }