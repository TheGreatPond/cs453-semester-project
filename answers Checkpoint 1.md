1. What is the difference between an in-memory API and a database-backed API?
a. a data base API provides persistence to the data so that even if the server is restarted, the data from the previous session is preserved
2. Why is it useful to separate routes, services, and database logic?
a. it allows for building code in a modular fashion so that the same code that was written for connecting to a database in one project can be used in another with little to no modifications outside of environment veraiables
3. What HTTP status codes did you use, and why?
a. 200 for successful gets
201 for items created
400 for general client errors
404 for resources not being found
500 for the error being on the servers end
The main reason for using these codes for these purposes is convention
4. What happens when a client requests a task ID that does not exist?
a. They are provided a 404 error and a small json error that explains the resource was not found
5. What was the hardest part of connecting the API to PostgreSQL?
a. Because i am largely recycling code from another project, the hardest part for me was learning the basic sql necessary to query the database using variables. I kept trying to place the variables as part of the statement in backticks rather than having the array of variables after the query
