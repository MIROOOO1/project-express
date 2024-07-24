const express = require('express')
require('dotenv').config()
const mongo = require('mongodb')
const { join } = require('path')

const app = express()

app.use(express.static(join(__dirname, "styles")))
app.use(express.urlencoded({extended:true}))
const client = new mongo.MongoClient(process.env.DB)

const db = client.db("e-commers")
const productsCollection = db.collection('products')

app.get('/add', require('./controllers'))

app.get('/:param', async (req, res) => {
    try {
        const param = req.params.param

        await client.connect()
        const product = await productsCollection.findOne({ id: +param })
        console.log(product, "prod")
        res.render('product.ejs', { product })
    }
    catch (e) {
        console.log(e);
    }
    finally {
        client.close()

    }
})
app.get('/', async (req, res) => {
    await client.connect()
    const products = await productsCollection.find().toArray()

    client.close()
    res.render('index.ejs', { prods: products })
})

app.post('/addProd',async(req,res)=>{
 try {
    await client.connect()

    const a=await productsCollection.insertOne(req.body)
    console.log(a)
   
    res.redirect('/')

 } catch (error) {
    console.log(error)
 }
 finally{
    client.close()
 }
})
app.get('/edit/:id',async(req,res)=>{
    const id=req.params.id
    await client.connect()
    const prod= await productsCollection.findOne({id:+id})
    client.close()
    res.render('edit.ejs',{prod})
})

app.post('/editprod/:id',async(req,res)=>{
    await client.connect()
    await productsCollection.updateOne({id:+req.params.id},{$set:req.body})
    client.close()
    res.redirect('/')
})

app.get('/delete/:id',async(req,res)=>{
    await client.connect()
    await productsCollection.deleteOne({id:+req.params.id})
    client.close()
    res.redirect('/')
})
app.listen(process.env.PORT, () => console.log("connected"))