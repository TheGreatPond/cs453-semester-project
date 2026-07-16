
# CS453/553 Client-Server Architecture Project


# Database

This project uses PostgreSQL running in Docker.

## Setting up the database

```shell
docker compose up -d
or 
npm run db:start
```
Stop the database
```shell
docker compose down 
or 
npm run db:stop
```
Reset the database completely
```shell
docker compose down -v
or 
npm run db:reset
```
## Default connection settings
- Database: cs453 
- User: postgres 
- Password: postgres 
- Port: 5432

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cs453
```

## Creating tables

Run the schema file against the local database after PostgreSQL is running:

```shell
psql postgresql://postgres:postgres@localhost:5432/cs453 -f database/schema.sql
```


# TESTING

Before testing, you will need to install the modules and then start the api

```shell
npm install;
npm run api;
```

To test this instance i have implemented an openapi doc "openapi.yaml", open this with a swaggerdoc previewer and then run through the examples for each route and corresponding http method
