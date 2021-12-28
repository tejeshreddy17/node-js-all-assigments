const express = require("express");

const byCrypt = require("bcrypt");

const app = express();

app.use(express.json());

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const filepath = path.join(__dirname, "userData.db");

//////initializing Db and server
let databasehandler = null;

const initializingDbandServer = async () => {
  try {
    databasehandler = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server listening at port 3000");
    });
  } catch (error) {
    console.log("Error at initializing sever");
    process.exit(1);
  }
};
initializingDbandServer();

////api-1

app.post("/register", async (request, response) => {
  try {
    const { username, name, password, gender, location } = request.body;
    const hashedpassword = await byCrypt.hash(password, 10);
    //console.log(hashedpassword);
    const checkingUsernameQuery = `select * from user where username = "${username}"; `;
    const checkingUsername = await databasehandler.get(checkingUsernameQuery);
    //console.log(checkingUsername);
    if (checkingUsername === undefined) {
      if (password.length > 5) {
        const updatingQuery = `
                insert into
                user (username, name, password, gender, location)
                values(
                    "${username}",
                    "${name}",
                    "${hashedpassword}",
                    "${gender}",
                    "${location}"
                );        
        `;
        const updatingResponse = await databasehandler.run(updatingQuery);
        response.send("User created successfully");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("User already exists");
    }
  } catch (error) {
    console.log(`error at API-1 ${error.message}`);
  }
});
///////api-2
app.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const checkingUserquery = `
    
                    select * 
                    from user
                    where username = "${username}";
    `;

    const checkedUser = await databasehandler.get(checkingUserquery);

    if (checkedUser === undefined) {
      response.status(400);
      response.send("Invalid user");
    } else {
      const isPasswordMatched = await byCrypt.compare(
        password,
        checkedUser.password
      );
      if (isPasswordMatched) {
        response.send("Login success!");
      } else {
        response.status(400);
        response.send("Invalid password");
      }
    }
  } catch (error) {
    console.log(`error at api-2 ${error.message}`);
  }
});

//////api-3
app.put("/change-password", async (request, response) => {
  try {
    const { username, oldPassword, newPassword } = request.body;
    const checkingUserquery = `
                    select * 
                    from user
                    where username = "${username}";
    `;
    const checkedUser = await databasehandler.get(checkingUserquery);
    if (checkedUser === undefined) {
      //response.send("Invalid User");
      //response.status(400);
    } else {
      const isOldPasswordMatched = await byCrypt.compare(
        oldPassword,
        checkedUser.password
      );
      if (isOldPasswordMatched === true) {
        if (newPassword.length < 5) {
          response.status(400);
          response.send("Password is too short");
        } else {
          const newHashedPassword = await byCrypt.hash(newPassword, 10);
          const updatingQuery = `
          update user
          set
          password = "${newHashedPassword}";`;
          await databasehandler.run(updatingQuery);
          response.send("Password updated");
        }
      } else {
        response.status(400);
        response.send("Invalid current password");
      }
    }
  } catch (error) {
    console.log(`error at api-2 ${error.message}`);
  }
});

module.exports = app;
