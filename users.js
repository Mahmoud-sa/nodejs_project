const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt =require("jsonwebtoken")


const app = express();
const port = 3000;

let users = [];

let products = [];
let catagories= [];



console.log(products)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authMiddleware=(req, res, next)=> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }  console.log("authrized"); next();
};


app.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid")
    .custom((value) => {
        const existingUser = users.find((user) => user.email === value);
        if (existingUser) {
          throw new Error("Email already in use");
        }
        return true;
      }),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

      // Create user
      const user = {
        name,
        email,
        password,
      };

      users.push(user);

      res.status(201).json({ message: "User created", password:"hashedPassword" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  // Find the user in the database
  const user = users.find(u => u.name === name && u.password === password);
  if (!user) {
    // Return an error if the user is not found
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }
  // Generate a JWT token and send it to the client
  const secretKey = 'mysecretkey';
  const token = jwt.sign({ userId: user.name }, secretKey);
  users.push(token)

  res.json({ token });

  //pass token to middelware
});
// Define a route to add a new product by ID
app.post('/products/:id', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.id);
  const { name } = req.body;

  // Check if a product with the same ID already exists
  const existingProduct = products.find(product => product.id === productId);

  if (existingProduct) {
    return res.status(400).send(`Product with ID ${productId} already exists`);
  }

  // Create a new product with the given ID and name
  const newProduct = { id: productId, name };
  products.push(newProduct);

  // Send a success response
  res.status(201).send(`Product ${productId} added successfully`);
});


// Define a route to update a product by its ID
app.put('/products/:id', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.id);
  const { name } = req.body;

  console.log('productId:', productId);
  console.log('name:', name);

  // Find the product in the array by its ID
  const productToUpdate = products.find(product => product.id === productId);

  console.log('productToUpdate:', productToUpdate);

  // If the product isn't found, send a 404 error response
  if (!productToUpdate) {
    res.status(404).send('Product not found');
  } else {
    // Update the product with the new data and send a success response
    productToUpdate.name = name;
    console.log('products:', products);
    res.status(200).send(`Product ${productId} updated successfully`);
  }
});
app.delete('/products/:id', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.id);

  // Find the index of the product in the array by its ID
  const productIndex = products.findIndex(product => product.id === productId);

  // If the product isn't found, send a 404 error response
  if (productIndex === -1) {
    res.status(404).send('Product not found');
  } else {
    // Remove the product from the array and send a success response
    products.splice(productIndex, 1);
    res.status(200).send(`Product ${productId} deleted successfully`);
  }
});

// Define a route to add a new catgory by ID
app.post('/catgory/:id', authMiddleware, (req, res) => {
  const catgoryId = parseInt(req.params.id);
  const { name } = req.body;

  // Check if a product with the same ID already exists
  const existingcatgory = catagories.find(catgory => catgory.id === catgoryId);

  if (existingcatgory) {
    return res.status(400).send(`catgory with ID ${catgoryId} already exists`);
  }

  // Create a new product with the given ID and name
  const newcatgory = { id: catgoryId, name };
  catagories.push(newcatgory);

  // Send a success response
  res.status(201).send(`catgory ${catgoryId} added successfully`);
});

app.delete('/category/:id', authMiddleware, (req, res) => {
  const categoryId = parseInt(req.params.id);

  // Find the index of the category to delete in the categories array
  const categoryIndex = catagories.findIndex(category => category.id === categoryId);

  // If the category isn't found, send a 404 error response
  if (categoryIndex === -1) {
    return res.status(404).send(`Category with ID ${categoryId} not found`);
  }

  // Remove the category from the categories array
  categoryId.splice(categoryIndex, 1);

  // Send a success response
  res.status(204).send();
});

app.put('/category/:id', authMiddleware, (req, res) => {
  const categoryId = parseInt(req.params.categoryId);
  const { name } = req.body;

  // Find the index of the category to update in the categories array
  const categoryIndex = catagories.findIndex(category => category.id === categoryId);

  // If the category isn't found, send a 404 error response
  if (categoryIndex === -1) {
    return res.status(404).send(`Category with ID ${categoryId} not found`);
  }

  // Update the category name in the categories array
  catagories[categoryIndex].name = name;

  // Send a success response with the updated category object
  res.status(200).send(categories[categoryIndex]);
});
// Start the server

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});