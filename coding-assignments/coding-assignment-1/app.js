const express = require("express");
const isValid = require("date-fns/isValid");
const format = require("date-fns/format");

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

////API -1
app.get("/todos/", async (request, response) => {
  try {
    let query1 = null;
    const {
      status = "",
      priority = "",
      search_q = "",
      category = "",
    } = request.query;
    console.log(request.query);
    if (status !== "" && priority === "" && category === "") {
      //status.replace("%20", " ");
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            status = "${status}";
    
         `;
      const bookarray = await databasehandler.all(query1);
      console.log(bookarray);
      if (bookarray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(bookarray);
        console.log(bookarray);
      }
    }
    if (priority !== "" && category === "" && status === "") {
      //priority.replace("%20", " ");
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            priority = "${priority}";
            
    
    
    `;
      const bookarray = await databasehandler.all(query1);
      if (bookarray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(bookarray);
        console.log(bookarray);
      }
    }
    if (search_q !== "") {
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            todo like "%${search_q}%";
    
    
    `;
      const bookarray = await databasehandler.all(query1);
      response.send(bookarray);
      console.log(bookarray);
    }
    if (status !== "" && priority !== "" && category === "") {
      //status.replace("%20", " ");
      //priority.replace("%20", " ");

      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            status = "${status}" and 
            priority ="${priority}"; 
    
    
    `;
      const bookarray = await databasehandler.all(query1);
      response.send(bookarray);
      console.log(bookarray);
    }

    //console.log(status, priority);
    if (category !== "" && status !== "" && priority === "") {
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            category = "${category}" and 
            status ="${status}";`;
      const bookarray = await databasehandler.all(query1);
      response.send(bookarray);
      console.log(bookarray);
    }
    if (category !== "" && status === "" && priority === "") {
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            category = "${category}"`;
      const bookarray = await databasehandler.all(query1);

      if (bookarray.length === 0) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.send(bookarray);
        console.log(bookarray);
      }
    }
    if (category !== "" && priority !== "") {
      query1 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            category = "${category}" and 
            priority ="${priority}";`;
      const bookarray = await databasehandler.all(query1);
      response.send(bookarray);
      console.log(bookarray);
    }
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
                select id,todo,priority,category,status,due_date as dueDate
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
////api -3
app.get("/agenda/", async (request, response) => {
  try {
    const { date } = request.query;
    if (isValid(new Date(date))) {
      const dateInFormat = format(new Date(date), "yyyy-MM-dd");
      console.log(dateInFormat);
      const query3 = `
        select id,todo,priority,category,status,due_date as dueDate
        from todo
        where
            due_date = "${dateInFormat}";
    
         `;
      const bookarray = await databasehandler.all(query3);
      response.send(bookarray);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } catch (error) {
    console.log(`error at api-3 ${error.message}`);
  }
});
///API-4
app.post("/todos/", async (request, response) => {
  try {
    const { id, todo, priority, status, category, dueDate } = request.body;
    console.log(id, todo, priority, status, category, dueDate);

    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      priority !== "HIGH" &&
      priority !== "LOW" &&
      priority !== "MEDIUM"
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (
      category !== "WORK" &&
      category !== "HOME" &&
      category !== "LEARNING"
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (!isValid(new Date(dueDate))) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      const dateInFormat = format(new Date(dueDate), "yyyy-MM-dd");
      const query3 = `
        insert into 
            todo (id,
            todo,
            category,
            priority,
            status,
            due_date)
        values( 
            ${id},
            "${todo}",
            "${category}",
            "${priority}",
            "${status}",
            "${dateInFormat}")
        ;
    `;
      const checking = await databasehandler.run(query3);
      console.log(checking);
      response.send("Todo Successfully Added");
    }
  } catch (error) {
    console.log(`error at api-3${error.message}`);
  }
});
////api-5
app.put("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    console.log(todoId);
    let query4 = null;
    const {
      status = "",
      priority = "",
      todo = "",
      category = "",
      dueDate = "",
    } = request.body;
    if (status !== "") {
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query4 = `
            update todo 
            set 
                status = "${status}"
            where 
                id = ${todoId};
        `;
        await databasehandler.run(query4);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    }
    if (priority !== "") {
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        query4 = `
            update todo 
            set 
                priority = "${priority}"
            where 
                id = ${todoId};
        `;
        await databasehandler.run(query4);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
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

    if (category !== "") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query4 = `
            update todo 
            set 
                category = "${category}"
             where 
                id = ${todoId};
        `;
        await databasehandler.run(query4);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }

    if (isValid(new Date(dueDate)) && dueDate !== "") {
      query4 = `
            update todo 
            set 
                due_date = "${dueDate}"
             where 
                id = ${todoId};
        `;
      await databasehandler.run(query4);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } catch (error) {
    console.log(`error at api 4 ${error.message}`);
  }
});
/// API 6
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
