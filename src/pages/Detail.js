import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ReviewForm } from '../components/ReviewForm';

import { useParams } from 'react-router-dom'

import { useContext, useState, useEffect } from 'react';
import { FBDbContext } from '../contexts/FBDbContext';
import { FBStorageContext } from '../contexts/FBStorageContext';
import { AuthContext } from '../contexts/AuthContext';
import { FBAuthContext } from '../contexts/FBAuthContext';

import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

export function Detail(props) {
  const [bookData, setBookData] = useState()
  const [auth, setAuth] = useState()
  const [bookReviews, setBookReviews ] = useState([])

  let { bookId } = useParams()

  const FBDb = useContext(FBDbContext)
  const FBStorage = useContext(FBStorageContext)
  const FBAuth = useContext(FBAuthContext)

  onAuthStateChanged( FBAuth, (user) => {
    if( user ) {
      // user is signed in
      setAuth(user)
    }
    else {
      // user is not signed in
      setAuth(null)
    }
  })

  const getReviews = async () => {
    const path = `books/${bookId}/reviews`
    const querySnapshot = await getDocs( collection(FBDb, path) )
    let reviews = []
    querySnapshot.forEach( (item) => {
      let review = item.data()
      review.id = item.id
      reviews.push( review )
    })
    setBookReviews( reviews )
  }

  const bookRef = doc(FBDb, "books", bookId)

  const getBook = async () => {
    let book = await getDoc(bookRef)
    if (book.exists()) {
      setBookData(book.data())
      getReviews()
    }
    else {
      // no book exists with the ID
    }
  }

  useEffect(() => {
    if (!bookData) {
      getBook(bookId)
    }
  })

  // function to handle review submission
  const ReviewHandler = async ( reviewData ) => {
    // create a document inside firestore
    const path = `books/${bookId}/reviews`
    const review = await addDoc( collection(FBDb, path), reviewData )
  }

  const Image = ( props ) => {
    const [imgPath,setImgPath] = useState()
    const imgRef = ref( FBStorage, `book_cover/${ props.path }`)
    getDownloadURL( imgRef ).then( (url) => setImgPath(url) )

    return(
        <img src={imgPath} className="img-fluid" />
    )
  }


  if (bookData) {
    return (
      <Container>
        <Row className='my-3'>
          <Col md="4">
            <Image path={bookData.image} />
          </Col>
          <Col md="8">
            <h2>{bookData.title}</h2>
            <h4>{bookData.author} </h4>
            <h5>{bookData.year}</h5>
            <p>{bookData.summary}</p>
            <p>ISBN {bookData.isbn10} <br/> ISBN13 {bookData.isbn13}</p>
            <p>{bookData.pages} pages</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <ReviewForm user={auth} handler={ReviewHandler} />
          </Col>
        </Row>
        <Row>
          {/* reviews to appear here */}
        </Row>
      </Container>
    )
  }
  else {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Loading...</h2>
          </Col>
        </Row>
      </Container>
    )
  }
}