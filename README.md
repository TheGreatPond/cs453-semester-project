### How to install dependencies.

 To install dependencies for the project navigate to the root of the repository and run 

 ```bash
npm install
```

### How to configure the JWT secret.
To configure the JWT secret, navigate to app/api/src/config/env.ts and edit the variable JWT_SECRET

### How to create or update the database tables.
Database tables will be created and filled with example data upon starting the server.

To start the postgres database run 

```bash
sudo docker compose up -d
```

to stop and reset the postgrees database run
```bash
sudo docker compose down -v
```

To run the server and fill the database with example data, run
```bash
npm run api
```

To reset the DB and start the server from a blank slate with only example data, run 
```bash
sudo docker compose down -v ; sudo docker compose up -d ; sleep 1 ; npm run api
```


### How to create an administrator account.

To create an administrator account, you will need to firsdt create a standard account with "POST /users" and then change the role of the new account to an admin using the existing admin account.

Example curl command to make an account

```bash
curl -X 'POST' \
  'http://localhost:3000/users' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "exampleuser@email.com",
  "unhashed_pw": "some-unhashed-password-here"
}'
```

Example curl command to change that account to an admin
```bash
curl -X 'PATCH' \
  'http://localhost:3000/users/exampleuser%40email.com' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "role": "admin"
}'
```

### How to start the server.

To start the database thewn the server run

```bash
sudo docker compose up -d ; sleep 1 ; npm run api;
```

### How to run tests.

To run test, forst reset the database and start the api server in one terminal with

```bash
sudo docker compose down -v ; sudo docker compose up -d ; sleep 1 ; npm run api
```
And then in another terminal, run test scripts with

```bash
npm test
```

I have also created OpenAPI docs that sohuld assist with more manual testing of different routes

### How to register and log in.

To register a new user, use POST /users.

Example register command below
```bash
curl -X 'POST' \
  'http://localhost:3000/users' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "exampleuser@email.com",
  "unhashed_pw": "some-unhashed-password-here"
}'
```

To sign in to your account, use "POST /auth/login".

Example login command below
```bash
curl -X 'POST' \
  'http://localhost:3000/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "user1@email.com",
  "password": "user1@email.com-password"
}'
```

This will return either an error if your credentials are wrong or a JWT that you will need to use for protected routes

### How to send a JWT with a request.

To send a JWT with a request, include "-H 'Authorization: Bearer <YOUR_JWT_TOKEN>'" as part of your curl command to send the necessary authorization header

### What user, project, and task routes are available.

##### User - examples within openapi/openapi-user.yaml
- "POST /auth/login" used to get a JWT token for use on protected routes
- "GET /auth/me" used to verify JWT token generated from /auth/login
- "GET /users" used to get a list of all users for the system. Only accessible by users with the admin role
- "POST /users" add a user to the database
- "GET /users/{name}" give details on a single user. Users can only get details on themselves, admins can get details on any user
- "PATCH /users/{name}" used to reset passwords for users or for admins to change the role of other users
- "DELETE /users/{name}" used to delete a user from the database. The default admin user is not able to be deleted as a measure to protect against getting to an unrecoverable state

##### Project - examples within openapi/openapi-project.yaml
- "GET /projects" returns projects available to the user through either ownership or through being given read permissions through the project_members table of the postgres DB
- "POST /projects" create a new project and immediately give ownership to the creating user
- "GET /projects/{name}" get details about a project. Users can only get details about a project they own or have membership in
- "GET /project/members" get project memberships
- "POST /projects/members" add membership to a project
- "DELETE /projects/members" delete users membership to a project

##### Task - examples within openapi/openapi-task.yaml
- "GET /tasks" retrieve all task that user has access to read through project ownership/membership
- "GET /tasks/id" retrieve a singular task by id if the user has rights to do so
- "PUT /tasks/{id}" replace a singular task if you ahve the rights to do so based on project ownership
- "PATCH /tasks/{id}" update part of a task if the user has the rights to do so based on project ownership
- "DELETE /tasks/{id}" delete a task if the user owns the project that the task is within

### Which routes or operations require the admin role.

- Listing all users with "GET /users" requires the admin role
- Updating user roles requires the admin role

### What ownership or authorization rules your application enforces.
I implement the roles user and admin within the user table of my database to give different levels of rights. Users can modify items within projects that they own, but admins can modify any item within the database. Beyond this, i also implement a project_members table that links a user to a project, granting that user READONLY access to that projects tasks