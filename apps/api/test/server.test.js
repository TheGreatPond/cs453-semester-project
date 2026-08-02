import { describe, test, expect, beforeEach, afterEach } from "vitest";
import {PORT} from "../src/server";

let baseUrl = `http://127.0.0.1:${PORT}`;
let token;
let userToken;
let adminToken;
let createdUserToken;

async function getJson(path) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function deleteJson(path) {
    let response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status == 204){
        return {
            status: response.status,
        };
    } else {
        const body = await response.json();
        console.log(response);
        return {
            status: response.status,
            body
        };
    }
}

async function getJsonNoHeader(path) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function postJson(path, data) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function postJsonNoHeader(path, data) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function putJson(path, data) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}

async function patchJson(path, data) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const body = await response.json();

    return {
        status: response.status,
        body
    };
}


describe("Testing Suite for semester project server", () => {
    test("GET /health returns status ok", async () => {
        const result = await getJson("/health");

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            status: "ok"
        });
    });
    describe("Testing Authentication Routes and Methods", () => {
        test("Test user1@email.com auth", async () => {
            const result = await postJson("/auth/login", {
                "username": "user1@email.com",
                "password": "user1@email.com-password"
            });

            expect(result.status).toBe(200);
            userToken = result.body.accessToken;
        });
        test("Test admin auth", async () => {
            const result = await postJson("/auth/login", {
                "username": "admin",
                "password": "admin-password"
            });

            expect(result.status).toBe(200);
            adminToken = result.body.accessToken;
        });
        test("Make sure incorrect creds return a 401 error", async () => {
            const result = await postJson("/auth/login", {
                "username": "user1@email.com231",
                "password": "user1@email.com-qweqweqweqweqwepassword"
            });

            expect(result.status).toBe(401);
            expect(result.body).toEqual({
                "error": "Unauthorized",
                "message": "Invalid username or password."
            });
        });
        test("Test GET /auth/me for user1@email.com", async () => {
            token = userToken;
            const result = await getJson("/auth/me");

            expect(result.status).toBe(200);
            
        });
        test("Test GET /auth/me for user1@email.com with no auth header", async () => {
            token = userToken;
            const result = await getJsonNoHeader("/auth/me");

            expect(result.status).toBe(401);
            expect(result.body).toEqual({
                "error":"Unauthorized", 
                "message":"Send a Bearer token in the Authorization header."
            });
            
        });
    });
    describe("Testing Task Routes and Methods", () => {
        test("Test user1@email.com accessing only task he has read access to the projects of", async () => {
            const result = await getJson("/tasks");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "items": [
                    {
                    "id": 1,
                    "title": "third task",
                    "description": "this is the third task.",
                    "status": "not started",
                    "assigned_to": "user1@email.com",
                    "parent_project": "first_project"
                    },
                    {
                    "id": 2,
                    "title": "second task",
                    "description": "this is the second task.",
                    "status": "done",
                    "assigned_to": null,
                    "parent_project": "first_project"
                    },
                    {
                    "id": 3,
                    "title": "first_task",
                    "description": "this is the first task.",
                    "status": "in progress",
                    "assigned_to": null,
                    "parent_project": "second_project"
                    },
                    {
                    "id": 4,
                    "title": "fourth_task",
                    "description": "this is the fourth task.",
                    "status": "in progress",
                    "assigned_to": "user1@email.com",
                    "parent_project": "second_project"
                    }
                ]
            });
        });
        
        test("Test admin user being able to read all task", async () => {
            token = adminToken;
            const result = await getJson("/tasks");
            
            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "items": [
                    {
                    "id": 1,
                    "title": "third task",
                    "description": "this is the third task.",
                    "status": "not started",
                    "assigned_to": "user1@email.com",
                    "parent_project": "first_project"
                    },
                    {
                    "id": 2,
                    "title": "second task",
                    "description": "this is the second task.",
                    "status": "done",
                    "assigned_to": null,
                    "parent_project": "first_project"
                    },
                    {
                    "id": 3,
                    "title": "first_task",
                    "description": "this is the first task.",
                    "status": "in progress",
                    "assigned_to": null,
                    "parent_project": "second_project"
                    },
                    {
                    "id": 4,
                    "title": "fourth_task",
                    "description": "this is the fourth task.",
                    "status": "in progress",
                    "assigned_to": "user1@email.com",
                    "parent_project": "second_project"
                    },
                    {
                    "id": 5,
                    "title": "fifth_task",
                    "description": "this is the fifth task.",
                    "status": "testing",
                    "assigned_to": null,
                    "parent_project": "third_project"
                    }
                ]
            });
        });
        test("Test creating a task as a regular user within a project they have access to", async () => {
            token = userToken;
            const result = await postJson("/tasks", {
                "title": "test-title",
                "status": "todo",
                "parent_project": "second_project",
                "description": "tell me about yourself"
            });

            expect(result.status).toBe(201);
            expect(result.body).toMatchObject({
                "task": {
                    "title": "test-title",
                    "description": "tell me about yourself",
                    "status": "todo",
                    "assigned_to": null,
                    "parent_project": "second_project"
                }
            });
        });
        test("Make sure  user cannot create task in projects they do not have access to", async () => {
            token = userToken;
            const result = await postJson("/tasks", {
                "title": "test-title",
                "status": "todo",
                "parent_project": "third_project",
                "description": "tell me about yourself"
            });

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: User cannot create new task in a project they are not the owner of"
            });
        });
        test("Get task that user has access to by id", async () => {
            token = userToken;
            const result = await getJson("/tasks/1");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "items": [
                    {
                    "id": 1,
                    "title": "third task",
                    "description": "this is the third task.",
                    "status": "not started",
                    "assigned_to": "user1@email.com",
                    "parent_project": "first_project",
                    }
                ]
            });
        });
        test("Fail to GET task that user does not have access to by id", async () => {
            token = userToken;
            const result = await getJson("/tasks/5");

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: User is not authorized to get the task requested since it belongs to a project they are not a member of"
            });
        });

        test("PUT task that user has access to by id", async () => {
            token = userToken;
            const result = await putJson("/tasks/1", {
                "title": "test-put",
                "status": "test-put",
                "parent_project": "second_project",
                "description": "tell me about yourself-put"
            });

            expect(result.status).toBe(201);
            });

        test("Fail to PUT task that user does not have access to by id", async () => {
            token = userToken;
            const result = await putJson("/tasks/5", {
                "title": "test-put",
                "status": "test-put",
                "parent_project": "second_project",
                "description": "tell me about yourself-put"
            });

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: User is not authorized to modify the task requested since it belongs to a project they are not the owner of"
            });
        });

        test("PATCH task that user has access to by id", async () => {
            token = userToken;
            const result = await patchJson("/tasks/1", {
                "title": "test-patch"
            });

            expect(result.status).toBe(200);
            });

        test("Fail to PATCH task that user does not have access to by id", async () => {
            token = userToken;
            const result = await patchJson("/tasks/5", {
                "title": "test-patch"
            });

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: User is not authorized to modify the task requested they are not the owner of the project the task belongs to."
            });
        });
        test("DELETE task that user has access to by id", async () => {
            token = userToken;
            const result = await deleteJson("/tasks/1");

            expect(result.status).toBe(204);
            });

        test("Fail to DELETE task that user does not have access to by id", async () => {
            token = userToken;
            const result = await deleteJson("/tasks/5");

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: User is not authorized to modify the task requested they are not the owner of the project the task belongs to."
            });
        });

    });
    describe("Testing User Routes and Methods", () => {
        test("Test user1@email.com attempting to list all users with GET /users", async () => {
            token = userToken;
            const result = await getJson("/users");

            expect(result.status).toBe(403);
            expect(result.body).toEqual({
                "error": "Forbidden: Only users with the role admin are permitted to list other users"
            });
        });
        test("Test admin attempting to list all users with GET /users", async () => {
            token = adminToken;
            const result = await getJson("/users");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "users": [
                    {
                    "user_name": "admin",
                    "role": "admin"
                    },
                    {
                    "user_name": "user1@email.com",
                    "role": "user"
                    },
                    {
                    "user_name": "user2@email.com",
                    "role": "user"
                    }
                ]
            });
        });
        test("Test creating a user", async () => {
            token = userToken;
            const result = await postJsonNoHeader("/users", {
                "name": "postuser@email.com",
                "unhashed_pw": "some-unhashed-password-here"
            });
        
            expect(result.status).toBe(201);
            expect(result.body).toMatchObject({
                "users": {
                    "user_name": "postuser@email.com"
                }
            });
        }); 
        test("Login with created user", async () => {
            const result = await postJson("/auth/login", {
                "username": "postuser@email.com",
                "password": "some-unhashed-password-here"
            });

            expect(result.status).toBe(200);
            createdUserToken = result.body.accessToken;
        });
        test("Try /auth/me with created user to validate user", async () => {
            token = createdUserToken;
            const result = await getJson("/auth/me");

            expect(result.status).toBe(200);
            
        });
        test("Request own user by username", async () => {
            token = userToken;
            const result = await getJson("/users/user1@email.com");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "users": [
                    {
                    "user_name": "user1@email.com",
                    "role": "user"
                    }
                ]
            });
        });
        test("Fail to GET another user since default users cannot get info on other users", async () => {
            token = userToken;
            const result = await getJson("/users/admin");

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: Only users with the role admin are permitted to list other users"
            });
        });
        test("PATCH user to update password", async () => {
            token = userToken;
            const result = await patchJson("/users/user1@email.com", {
                "unhashed_pw": "test"
            });

            expect(result.status).toBe(201);
            expect(result.body).toMatchObject({
                "Result": "password of user user1@email.com updated"
            });
            });

        test("PATCH user to update password and role with admin account", async () => {
            token = adminToken;
            const result = await patchJson("/users/user1@email.com", {
                "unhashed_pw": "test2",
                "role": "admin"
            });

            expect(result.status).toBe(201);
        });
        test("Verify user1@email.com is now an admin", async () => {
            token = userToken;
            const result = await getJson("/users/user1@email.com");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "users": [
                    {
                    "user_name": "user1@email.com",
                    "role": "admin"
                    }
                ]
            });
        });
        test("PATCH user1@email.com back to a normal user", async () => {
            token = adminToken;
            const result = await patchJson("/users/user1@email.com", {
                "unhashed_pw": "test2",
                "role": "user"
            });

            expect(result.status).toBe(201);
        });
        test("DELETE postuser@email.com's own user by username", async () => {
            token = createdUserToken;
            const result = await deleteJson("/users/postuser@email.com");

            expect(result.status).toBe(204);
            });

        test("Fail to DELETE user that is not own user", async () => {
            token = userToken;
            const result = await deleteJson("/users/user2@email.com");

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "error": "Forbidden: Users with the \"user\" role are only allowed to delete themselves. Users with the \"admin\" role can delete any user besides the user \"admin\""
            });
        });
    });
    describe("Testing Project Routes and Methods", () => {
        test("Test GET /projects", async () => {
            token = userToken;
            const result = await getJson("/projects");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "projects": [
                    {
                    "project_name": "first_project",
                    "owner": "user1@email.com",
                    "description": null
                    },
                    {
                    "project_name": "second_project",
                    "owner": "user1@email.com",
                    "description": null
                    },
                    {
                    "project_name": "third_project",
                    "owner": "user2@email.com",
                    "description": null
                    }
                ]
            });
        });
        test("Test POST /projects", async () => {
            token = userToken;
            const result = await postJson("/projects", {
                "name": "exampleProject"
            });

            expect(result.status).toBe(201);
            expect(result.body).toMatchObject({
            "projects": {
                "project_name": "exampleProject",
                "owner": "user1@email.com",
                "description": null,
                }
            });
        });
        test("Get project that user has access to by name", async () => {
            token = userToken;
            const result = await getJson("/projects/first_project");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "projects": [
                    {
                    "project_name": "first_project",
                    "owner": "user1@email.com",
                    "description": null,
                    }
                ]
            });
        });
        test("Fail to GET task that user does not have access to by id", async () => {
            token = userToken;
            const result = await getJson("/projects/third_project");

            expect(result.status).toBe(403);
            expect(result.body).toMatchObject({
                "Forbidden": "Users may not retrieve information about a project they do not own and are not a member of"
            });
        });
    });
});