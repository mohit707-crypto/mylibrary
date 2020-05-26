const express = require('express')
const router = express.Router()
const multer = require ('multer')
const path = require('path')   
const fs = require ('fs')
const Book = require('../models/book')
const uploadPath = path.join('public',
Book.coverImageBasePath)
const imagemimeTypes = ['images/jpeg', 'images/png, images/gif']
const Author = require('../models/authors')
const upload = multer ({
    dest:uploadPath,
    fileFilter:(req,file,callback ) => {
       callback(null,)
    }
})

// ALL Books Route
router.get('/',  async (req, res)=> {
    let query = Book.find ()
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title',RegExp(req.query.title,'i'))
    }
    if (req.query.publishBefore != null && req.query.publishBefore != ''){
       query = query.lte('publishedDate',req.query.publishBefore)
    }
    if (req.query.publishAfter != null && req.query.publishAfter != ''){
       query = query.gte ('publishedDate',req.query.publishAfter)
    }
    try {
        const books = await query.exec()
        res.render('./books/index',{
            books: books,
            searchOptions:req.query
        })
        } catch  {
        res.redirect('/')
    }
   
})
 
// New book route
router.get('/new',async (req, res)=>  { 
    renderNewPage(res, new Book())
   })
//Create book Route
router.post('/',upload.single('cover'), async (req, res)=>{
    const fileName = req.file != null ? req.file.filename : null
 const book = new Book({
     title: req.body.title,
     author: req.body.author,
     publishDate: newDate(req.body.publishDate),
     pageCount: req.body.pageCount,
     coverImageName: fileName,  
     descripition: req.body.descripition
 })
 try {
     const newBook = await book.save()
       //res.redirect(`books/${newBook.id}`)
       res.redirect(`books`) 
 } catch  {
     if(book.coverImageName!= null){
     removeBookCover(book.coverImageName)

     }
     
    renderNewPage(res, book, true)
     }
})  
    function removeBookCover(fileName){
        fs.unlink(path.join(uploadPath, fileName), err =>{
            if(err) console.error(err)
        })
    }
 async function renderNewPage(res,book, hasError = false){
     try {
    const authors = await Author.find({})
   const params ={
    authors: authors,
    book: book  
}
if (hasError) params.errorMessage = 'Error Creating Book'
   
res.render('books/new', params)
} catch {
     res.redirect('/books')}}
module.exports = router 