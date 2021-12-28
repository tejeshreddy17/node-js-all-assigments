const express = require("express");

const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const filepath = path.join(__dirname, "todoApplication.db");

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
///API -1

app.get("/todos/", async (request, response) => {
  try {
    let query1 = null;
    const { status = "", priority = "", search_q = "" } = request.query;
    console.log(request.query);
    if (status !== "" && priority === "" && search_q === "") {
      //status.replace("%20", " ");
      query1 = `
        select *
        from todo
        where
            status = "${status}";
    
    `;
    }
    if (priority !== "") {
      //priority.replace("%20", " ");
      query1 = `
        select *
        from todo
        where
            priority = "${priority}";
            
    
    
    `;
    }
    if (search_q !== "") {
      query1 = `
        select *
        from todo
        where
            todo like "%${search_q}%";
    
    
    `;
    }
    if (status !== "" && priority !== "") {
      //status.replace("%20", " ");
      //priority.replace("%20", " ");

      query1 = `
        select *
        from todo
        where
            status = "${status}" and 
            priority ="${priority}"; 
    
    
    `;
    }
    //console.log(status, priority);

    const bookarray = await databasehandler.all(query1);
    response.send(bookarray);
    console.log(bookarray);
  } catch (error) {
    console.log(`error at api1 ${error.message}`);
  }
});

////API-2

app.get("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    console.log(todoId);

    const query = `
                select *
                from todo
                where
                    id = ${todoId};
                
        
        
        
        `;
    const todoArray = await databasehandler.all(query);
    response.send(todoArray[0]);
    console.log(todoArray);
  } catch (error) {
    console.log(`error at api2${error.message}`);
  }
});
////api-3
app.post("/todos/", async (request, response) => {
  try {
    const { id, todo, priority, status } = request.body;

    const query3 = `
        insert into 
            todo (id,
            todo,
            priority,
            status)
        values( 
            ${id},
            "${todo}",
            "${priority}",
            "${status}")
        ;
    `;
    await databasehandler.run(query3);
    response.send("Todo Successfully Added");
  } catch (error) {
    console.log(`error at api-3${error.message}`);
  }
});

///API 4
app.put("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;

    let query4 = null;
    const { status = "", priority = "", todo = "" } = request.body;
    if (status !== "") {
      query4 = `
            update todo 
            set 
                status = "${status}"
            where 
                id = ${todoId};
        `;
      await databasehandler.run(query4);
      response.send("Status Updated");
    }
    if (priority !== "") {
      query4 = `
            update todo 
            set 
                priority = "${priority}"
            where 
                id = ${todoId};
        `;
      await databasehandler.run(query4);
      response.send("Priority Updated");
    }
    if (todo !== "") {
      query4 = `
            update todo 
            set 
                todo = "${todo}"
             where 
                id = ${todoId};
        `;
      await databasehandler.run(query4);
      response.send("Todo Updated");
    }
  } catch (error) {
    console.log(`error at api 4 ${error.message}`);
  }
});

/// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  try {
    const query5 = `
      delete from todo
      where
        id=${todoId};`;
    await databasehandler.run(query5);
    response.send("Todo Deleted");
  } catch (error) {
    console.log(`errorr api5 ${error.message}`);
  }
});

module.exports = app;
