//https
const https = require("https");
const fs = require("fs");

//methods to interact with recipe API
const recipeAPI = require("./recipeAPI.js");

//express js
const express = require("express");

//configure .env file
const dotenv = require("dotenv");
dotenv.config();

//use cors for
const cors = require("cors");

// Add mongdb user services
const userServices = require("./controllers/user-services");
const ingredientServices = require("./controllers/ingredient-services");
const recipeServices = require("./controllers/recipe-services");

//web token for user auth
const jwt = require("jsonwebtoken");
// const { create } = require("./models/user");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//authenticate JWT for protected routes
app.use("/services", authenticateToken);

// --------------------------------------
//  Token
// --------------------------------------

function generateAccessToken(id) {
  return jwt.sign(id, process.env.TOKEN_SECRET, { expiresIn: "1h" });
}

//use case
//app.get(..., authenticateToken, function (req, res) => ...);
//middleware to authenticate token, used for /services and all nested paths
async function authenticateToken(req, res, next) {
  console.log("In authenticate Token");
  token = req.body["token"];

  if (token == null) res.status(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) res.status(403);

    req._id = user;

    next();
  });
}

// --------------------------------------------------
// AUTHENTICATION ENDPOINTS
// --------------------------------------------------
// login endpoint:
//    get username and password from request body and pass to
//    userServices.login() which authenticates the user from
//    the database
app.post("/login", async (req, res) => {
  const user = req.body;
  try {
    const result = await userServices.login(user);

    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      const token = generateAccessToken({ id: result._id });
      res.status(201).json({ token: token });
      //res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// register endpoint:
//  get username and password from request body and pass to
//  userServices.register() which adds the user to the database
//  after using bcrypt to hash the password
app.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const result = await userServices.register(user);

    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      const token = generateAccessToken({ id: result._id });
      res.json({ token: token }).status(201);
      //res.send({ users_list: result});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// --------------------------------------------------
// USER ENDPOINTS
// --------------------------------------------------
// Get users endpoint:
app.get("/users", async (req, res) => {
  const name = req.query["name"];
  try {
    const result = await userServices.getUsers(name);
    res.send({ users_list: result }); // can be empty array (no error if nothing found)
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Get User by Id endpoint:
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await userServices.findUserById(id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Add a Recipe to a User's Saved Recipes endpoint:
// - body of the request to this endpoint contains 1 field: recipe_id
app.post("/users/:id/recipes", async (req, res) => {
  const user_id = req.params.id;
  const user = await userServices.findUserById(user_id);
  const recipe_id = req.body.recipe_id;
  try {
    const result = await userServices.addRecipe(user, recipe_id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Populate the Recipes for a specific User
app.get("/users/:id/recipes", async (req, res) => {
  const user_id = req.params.id;
  try {
    const user = await userServices.findUserById(user_id);
    const result = await userServices.getRecipes(user);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Add an Ingredient to a User's Saved Ingredients endpoint:
// - body of the request to this endpoint contains 1 field: ingredient_id
app.post("/users/:id/ingredients", async (req, res) => {
  const user_id = req.params.id;
  const user = await userServices.findUserById(user_id);
  const ingredient_id = req.body.ingredient_id;
  try {
    const result = await userServices.addIngredient(user, ingredient_id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Populate the Ingredients for a specific User
app.get("/users/:id/ingredients", async (req, res) => {
  const user_id = req.params.id;
  try {
    const user = await userServices.findUserById(user_id);
    const result = await userServices.getIngredients(user);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ users_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// -------------------------------------------------------
// Services Endpoints (Protected Routes)
// -------------------------------------------------------

app.post("/services/recipes", async (req, res) => {
  try {
    const id = req._id;
    const user = await userServices.findUserById(id);
    res.send({ ingredients: "apple" }).status(200);
  } catch (e) {
    console.log(error);
    res.status(500).send("BAD AUTH /services/recipes");
  }
});

// --------------------------------------------------
// RECIPE ENDPOINTS
// --------------------------------------------------
// Get recipes
app.get("/recipes", async (req, res) => {
  const name = req.query["name"];
  try {
    const result = await recipeServices.getRecipes(name);
    res.send({ recipes_list: result }); // can be empty array (no error if nothing found)
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Create recipe endpoint:
app.post("/recipes", async (req, res) => {
  const recipeToAdd = req.body;
  try {
    const savedRecipe = await recipeServices.createRecipe(recipeToAdd);
    if (savedRecipe) {
      res.status(201).send(savedRecipe).end();
    } else {
      res.status(400).send("Bad Request.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Get recipe by Id endpoint:
app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await recipeServices.getRecipeById(id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ recipes_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Get recipes by user Id endpoint:

// Create recipe endpoint:

// Update recipe endpoint:

// Delete recipe endpoint:

// --------------------------------------------------
// INGREDIENT ENDPOINTS
// --------------------------------------------------
// Get all ingredients endpoint:
//  [X] get all ingredients from database filtering by name
//  [ ] filter by recipeId (out of scope)
//  [ ] filter by userId (out of scope)
app.get("/ingredients", async (req, res) => {
  const name = req.query["name"];
  try {
    const result = await ingredientServices.getIngredients(name);
    res.send({ ingredients_list: result }); // can be empty array (no error if nothing found)
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Get ingredient by Id endpoint:
app.get("/ingredients/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await ingredientServices.getIngredientById(id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ ingredients_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Get ingredients by recipe Id endpoint:

// Get ingredients by user Id endpoint:
app.get("/ingredients/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await ingredientServices.getIngredientsByUserId(id);
    if (result === undefined || result.length === 0) {
      res.status(404).send("Resource not found.");
    } else {
      res.send({ ingredients_list: result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Create ingredient endpoint:
app.post("/ingredients", async (req, res) => {
  const ingredientToAdd = req.body;
  try {
    const savedIngredient = await ingredientServices.createIngredient(
      ingredientToAdd
    );
    if (savedIngredient) {
      res.status(201).send(savedIngredient).end();
    } else {
      res.status(400).send("Bad Request.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Update ingredient endpoint:

// Delete ingredient by name:
app.delete("/ingredients", async (req, res) => {
  const name = req.query["name"];
  try {
    const result = await ingredientServices.deleteIngredientByName(name);
    if (result) {
      res.status(204).end();
    } else {
      res.status(404).send("Resource not found.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

// Delete ingredient by id endpoint:
app.delete("/ingredients/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await ingredientServices.deleteIngredientById(id);
    if (result) {
      res.status(204).end();
    } else {
      res.status(404).send("Resource not found.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error.");
  }
});

///*
app.listen(process.env.PORT || port, () => {
  if (process.env.PORT) {
    console.log(
      `REST API is listening on: http://localhost:${process.env.PORT}.`
    );
  } else console.log(`REST API is listening on: http://localhost:${port}.`);
});

//*/

/*
https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync("certificates/key.pem"),
      cert: fs.readFileSync("certificates/cert.pem"),
    },
    app
  )
  .listen(process.env.PORT || port, () => {
  if (process.env.PORT) 
    console.log(`REST API is listening on: https://localhost:${process.env.PORT}`);
  else
    console.log(`REST API is listening on: http://localhost:${port}.`); 
});
*/

