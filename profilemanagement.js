import express from 'express'
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

dotenv.config()


const app = express()

app.use(express.json())

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
  }).promise()
  

   const getUserDetails = async (req,res,next) => {
    let usernameID = req.params.username;
    let user;
    try{
        const [rows] = await pool.query(`
        SELECT * 
        FROM users
        WHERE username= ?
        `, [usernameID])
        user = rows[0];
    } catch(err) {
        return console.log(err);
    }

    if(!user) {
        return res.status(404).json({message: "No user found by that username!"});
    }
        return res.status(200).json({user});
}
  



   const signup = async (req, res) => {
    const { username, password } = req.body; //{} - deconstruct body
    const hashedPassword = bcrypt.hashSync(password);

    //check if user already exists
    let existingUser;
    try{
        // filter by username
        const [rows] = await pool.query(`
        SELECT * 
        FROM users
        WHERE username= ?
        `, [username])
        //return rows[0]
        existingUser = rows[0];
    }catch(err){
        return console.log(err);
    }

    if(existingUser){
       return  res
       .status(400).
       json({message: "User already exists!Login instead"});
    }


    const [result] = await pool.query(`
    INSERT INTO users(username, password)
    VALUES(?,?)
    `, [username, hashedPassword])
  
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE username = ?
    `, [username])
    let row = rows[0];
    return res.status(201).json({row})
    
  }


   const login = async (req,res,next) => {
    const { username, password } = req.body; //{} - deconstruct body
    let existingUser;
    try{
        // filter by username
        const [rows] = await pool.query(`
        SELECT * 
        FROM users
        WHERE username= ?
        `, [username])
        //return rows[0]
        existingUser = rows[0];
    }catch(err){
        return console.log(err);
    }

    if(!existingUser){
       return  res
       .status(404).
       json({message: "Couldn't find user by this username!"});
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

    if(!isPasswordCorrect){
        return res.status(400).json({message: "Incorrect password!"});
    }
    return res.status(200).json({message: "Login successful"});

}

  const updateUserDetails = async (req,res,next) => {
    const { name } = req.body;
    let usernameID = req.params.username;
    let user;
    let updateFlag;
    try{
      const result = await pool.query(`
      UPDATE users 
      SET name = ?
      WHERE username= ?
      `, [name, usernameID])
      //return rows[0]
       updateFlag = result.affectedRows;
    } catch(err) {
        return console.log(err);
    }

    if(updateFlag < 1) {
        return res.status(500).json({message: "Unable to update user!"});
    }

      const [rows] = await pool.query(`
      SELECT * 
      FROM users
      WHERE username= ?
      `, [usernameID])
      user = rows[0];
      return res.status(200).json({user});

}


app.post("/signup", signup)
app.get("/users/:username", getUserDetails )
app.put("/update/:username", updateUserDetails)
app.post("/login", login)

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})
