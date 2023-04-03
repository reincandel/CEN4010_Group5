import express from 'express'

import { signup, login, getUserDetails, updateUserDetails } from './database.js';

const app = express()

app.use(express.json())


app.post("/signup", signup)
app.get("/users/:username", getUserDetails )
app.put("/update/:username", updateUserDetails)
app.post("/login", login)

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})