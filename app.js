const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const {v4: uuidv4} = require('uuid')
const databasePath = path.join(__dirname, 'agro.db')

const app = express()

app.use(express.json())

app.use(cors({origin: '*'}))
app.use(cors({
  origin: "https://devaragarivinaykumar9e8qdrjscpw369f.drops.nxtwave.tech/", // or your frontend domain
  credentials: true
}));
let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

function authenticateToken(request, response, next) {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Your Not Authorized User To  Make Changes On Assignments')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send(
          'Your Not Authorized User To  Make Changes On Assignments',
        )
      } else {
        next()
      }
    })
  }
}

//List All Users

app.get('/', async (request, response) => {
  try {
    const selectUserQuery = `SELECT * FROM users `
    const databaseUsers = await database.all(selectUserQuery)
    response.send(databaseUsers)
  } catch (err) {
    response.status(404).send({err})
  }
})

//User Login Creditals Generated JWT Token
app.post('/login', async (request, response) => {
  const {email, password} = request.body
  try {
    const selectUserQuery = `SELECT * FROM users WHERE email = '${email}';`
    const databaseUser = await database.get(selectUserQuery)
    if (databaseUser === undefined) {
      response.status(400)
      response.send('Invalid user')
    } else {
      const isPasswordMatched = await bcrypt.compare(
        password,
        databaseUser.password,
      )
      if (isPasswordMatched === true) {
        const payload = {
          email: email,
        }
        const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
        response.send({jwtToken})
      } else {
        response.status(400)
        response.send('Invalid password')
      }
    }
  } catch (err) {
    response.status(404).send({err})
  }
})

//Signup new User
app.post('/register', async (request, response) => {
  const {username, email, password} = request.body
  const ids = uuidv4()
  try {
    const selectUserQuery = `SELECT * FROM users WHERE email = '${email}'`
    const existingUser = await database.get(selectUserQuery)
    if (existingUser !== undefined) {
      response.status(400)
      response.send('User already exists')
    } else {
      if (password.length < 6) {
        response.status(400)
        response.send('Password must be at least 6 characters')
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        const insertUserQuery = `
        INSERT INTO users (id,username, email, password)
        VALUES ('${ids}','${username}','${email}','${hashedPassword}')`

        await database.run(insertUserQuery)
        response.status(200).send('User created successfully')
      }
    }
  } catch (err) {
    response.status(404).send(err)
  }
})

//Admin User Post Products
app.post('/api/products',authenticateToken, async (request, response) => {
  const {name, price, category, image, description} = request.body
  const ids = uuidv4();
   try {
    const postProduct = `INSERT INTO products (id,name,price,category,image,description)
  VALUES (?, ?, ?, ?, ?, ?)`
    await database.run(postProduct,[ids, name, price, category, image, description])
    response.status(200).send('Product Created Succesfully')
   }catch (err){
   response.status(404).send(err)
   console.log(err)
  }
})


//Get All Product 
app.get("/api/products" , async (request ,response)=>{
   const { category } = request.query

  try {
     let getProductsQuery = `SELECT * FROM products`
    const queryParams = []

    if (category) {
      getProductsQuery += ` WHERE category = ?`
      queryParams.push(category)
    }
  const dbResponse = await database.all(getProductsQuery , queryParams);
  response.status(200).send(dbResponse )
  }catch (err){
   response.status(404).send(err.message)
   console.log(err)
  }
})

// Get Specific Product 
app.get("/api/products/:id" , async (request,response)=>{
  const {id} = request.params
  try{
    const getSpecificProduct = `SELECT * FROM products WHERE id = '${id}' `;
    const dbResponse = await database.get(getSpecificProduct)
    response.status(200).send(dbResponse)
  } catch (err){
     response.status(404).send(err)
     console.log(err)
  }
})

//Admin Update Product Details 
app.put('/api/products/:id',authenticateToken,async (request, response) => {
  const { id } = request.params
  const { name, price, category, image, description } = request.body

  try {
    const updateQuery = `
      UPDATE products 
      SET 
        name = ?,
        price = ?,
        category = ?,
        image = ?,
        description = ?
      WHERE id = ?
    `
    const result = await database.run(updateQuery, [
      name,
      price,
      category,
      image,
      description,
      id,
    ])

    if (result.changes === 0) {
      response.status(404).send('Product Not Found')
    } else {
      response.status(200).send('Product Updated Successfully')
    }
  } catch (err) {
    response.status(500).send({ error: 'Failed to update product', details: err.message })
  }
})

//Admin Delete Products 
app.delete("/api/products/:id" ,authenticateToken ,async (request,response)=>{
  const {id} = request.params
  try{
    const deleteProduct = `DELETE FROM products WHERE id = "${id}"`;
    const dbResponse = await database.run(deleteProduct)
    response.status(200).send("Product Deleted Succesfully")
  }catch (err){
    response.status(404).send(err)
  }
})

// Place a new order
app.post('/api/orders', async (request, response) => {
  const { buyer_name, buyer_contact, delivery_address, items } = request.body
  const id = uuidv4()

  if (!buyer_name || !buyer_contact || !delivery_address || !items) {
    return response.status(400).send('Missing required fields')
  }

  try {
    const insertOrderQuery = `
      INSERT INTO orders (id, buyer_name, buyer_contact, delivery_address, items, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `
    await database.run(insertOrderQuery, [
      id,
      buyer_name,
      buyer_contact,
      delivery_address,
      JSON.stringify(items),
    ])

    response.status(201).send({ message: 'Order placed successfully', orderId: id })
  } catch (err) {
    response.status(500).send({ error: 'Failed to place order', details: err.message })
  }
})

// View order details by ID (for buyer)
app.get('/api/orders/:id', async (request, response) => {
  const { id } = request.params

  try {
    const getOrderQuery = `SELECT * FROM orders WHERE id = ?`
    const order = await database.get(getOrderQuery, [id])

    if (!order) {
      response.status(404).send({ error: 'Order not found' })
    } else {
      order.items = JSON.parse(order.items) // Parse JSON string back to object
      response.status(200).send(order)
    }
  } catch (err) {
    response.status(500).send({ error: 'Failed to fetch order', details: err.message })
  }
})

// View all orders (admin only)
app.get('/api/orders',authenticateToken,async (request, response) => {
  try {
    const getAllOrdersQuery = `SELECT * FROM orders ORDER BY rowid DESC`
    const orders = await database.all(getAllOrdersQuery)
    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }))
    response.status(200).send(parsedOrders)
  } catch (err) {
    response.status(500).send({ error: 'Failed to fetch orders', details: err.message })
  }
})

// Update order status (admin only)
app.put('/api/orders/:id', authenticateToken, async (request, response) => {
  const { id } = request.params
  const { status } = request.body

  if (!status) {
    return response.status(400).send('Status is required')
  }

  try {
    const updateStatusQuery = `UPDATE orders SET status = ? WHERE id = ?`
    const result = await database.run(updateStatusQuery, [status, id])

    if (result.changes === 0) {
      response.status(404).send({ error: 'Order not found' })
    } else {
      response.status(200).send('Order status updated successfully')
    }
  } catch (err) {
    response.status(500).send({ error: 'Failed to update status', details: err.message })
  }
})


// Get all orders for a specific buyer by contact number
app.get('/api/orders/user/:contact', async (request, response) => {
  const { contact } = request.params

  try {
    const getOrdersByContactQuery = `
      SELECT * FROM orders WHERE buyer_contact = ? ORDER BY rowid DESC
    `
    const orders = await database.all(getOrdersByContactQuery, [contact])

    if (orders.length === 0) {
      return response.status(404).send({ message: 'No orders found for this contact' })
    }

    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
    }))

    response.status(200).send(parsedOrders)
  } catch (err) {
    response.status(500).send({ error: 'Failed to fetch orders', details: err.message })
  }
})


module.exports = app
