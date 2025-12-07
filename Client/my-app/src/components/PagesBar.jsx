import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Button} from 'react-bootstrap';
import { PencilSquare, Trash, XSquare } from 'react-bootstrap-icons';


function PagesBar(props) {

  const [filter, setFilter] = useState(0);

  const [DeletionId, setDeletionId] = useState(-1);


  //apply filter
  function CalculateBaseArray() {

    let base = props.Pages.filter((a) => {
      if (filter === 1) {
        if ((props.auth) && (props.auth.id === a.authorId || props.auth.role === 0) && (props.Mode === "edit")) {
          return a;
        }
        return;
      }
      if (filter === 2) {
        if (a.pubblication_date === null) {
          return a;
        }
        return;
      }

      if (filter === 3) {
        if (props.auth.id === a.authorId) {
          return a;
        }
        return;
      }
      //nel caso non sia impostato nessun filtro
      return a;
    });

    return base;
  }

  //generate html
  function CalculateFinalArray() {

    return CalculateBaseArray().map(x => {
      return (
        <div key={x.id}>
          {DeletionId === x.id && <>
            <Row>
              <Col className='col-7 mt-2 me-1'>
                <h6>Confermi Eliminazione Pagina?</h6>
              </Col>
              <Col className='col-1 ms-0 me-2'>
                <Button className='my-1' onClick={() => { props.DeletePage(x.id); setDeletionId(-1) }}><Trash size={20} /></Button>

              </Col>
              <Col className='col-1 ms-0'>

                <Button className='my-1' onClick={() => setDeletionId(-1)}><XSquare size={20} /></Button>
              </Col>
            </Row>
          </>
          }

          <a href="#" className={"border border-4 border-primary rounded-4 list-group-item list-group-item-action mb-2 " + x.active} onClick={() => { DeletionId === -1 ? props.loadContent(x.id) : "" }}>
            <Row className='ms-auto me-4'>

              <Col className='col-push-9 ms-0 my-auto'>
                <h4 className='mt-0 mb-0'>{x.title.toUpperCase()}</h4>
                <h5 className='mt-1 mb-0'>{" By " + x.name}</h5>
                <h6 className='mt-1 mb-0'> {x.pubblication_date}</h6>
              </Col>


              {
                (props.auth) && (props.auth.id === x.authorId || props.auth.role === 0) && (props.Mode === "edit") &&
                <>
                  <Col className='col-xl-1 me-0'>

                    <Button className='' onClick={() => props.CanTouch && DeletionId===-1 ? props.EditPage(x.id) : ""}><PencilSquare size={20} /></Button>

                  </Col>

                  <Col className='col-xl-1 ms-4 me-0'>

                    <Button className='' onClick={() => props.CanTouch && DeletionId===-1 ? setDeletionId(x.id) : ""}><Trash size={20} /></Button>

                  </Col>
                </>
              }

            </Row>
          </a>
        </div>
      )
    })


  }


  return (

    <>
      <Row className='mb-0'>
        {props.Mode != "view" &&
          <>
            <Col className='col-1 my-2'>
              <h5>Filtri:</h5>
            </Col>
            <Col className='col-2 ms-1'>
              <Button className={'my-0' + (filter === 0 ? " bg-danger" : " bg-light text-black")} onClick={() => setFilter(0)}>Tutte</Button>
            </Col>
            <Col className='col-2 ps-1'>
              <Button className={'my-0' + (filter === 1 ? " bg-danger" : " bg-light text-black")} onClick={() => setFilter(1)}>Editabili</Button>
            </Col>
            <Col className='col-2 ms-2 ps-0'>
              <Button className={'my-0' + (filter === 2 ? " bg-danger" : " bg-light text-black")} onClick={() => setFilter(2)}>Bozze</Button>
            </Col>
            <Col className='col-2 ms-0 ps-0'>
              <Button className={'my-0' + (filter === 3 ? " bg-danger" : " bg-light text-black")} onClick={() => setFilter(3)}>Personali</Button>
            </Col>
          </>
        }

      </Row>

        {
          CalculateBaseArray().length === 0 &&
          <div className="me-5 ms-5 mt-2 alert alert-warning" role="alert">
            Il filtro selezionato non ha prodotto risultati
          </div>


        }

     
      <div className="list-group list-group-flush ">
        {CalculateFinalArray()}
      </div >
    </>
  )
}


export { PagesBar }