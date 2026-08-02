import { describe, test, expect, beforeEach, afterEach } from "vitest";
import {PORT} from "../src/server";

let baseUrl = `http://127.0.0.1:${PORT}`;
let token;
let userToken;
let adminToken;

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
        test("Test user1 auth", async () => {
            const result = await postJson("/auth/login", {
                "username": "user1",
                "password": "user1-password"
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
                "username": "user1231",
                "password": "user1-qweqweqweqweqwepassword"
            });

            expect(result.status).toBe(401);
            expect(result.body).toEqual({
                "error": "Unauthorized",
                "message": "Invalid username or password."
            });
        });
        test("Test GET /auth/me for user1", async () => {
            token = userToken;
            const result = await getJson("/auth/me");

            expect(result.status).toBe(200);
            
        });
        test("Test GET /auth/me for user1 with no auth header", async () => {
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
        test("Test user1 accessing only task he has read access to the projects of", async () => {
            const result = await getJson("/tasks");

            expect(result.status).toBe(200);
            expect(result.body).toMatchObject({
                "items": [
                    {
                    "id": 1,
                    "title": "third task",
                    "description": "this is the third task.",
                    "status": "not started",
                    "assigned_to": "user1",
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
                    "assigned_to": "user1",
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
                    "assigned_to": "user1",
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
                    "assigned_to": "user1",
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
                    "assigned_to": "user1",
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


    });
});
    /*

    test("unknown route returns 404", async () => {
        const result = await getJson("/missing");

        expect(result.status).toBe(404);
        expect(result.body).toHaveProperty("error");
    });

    test("POST /echo returns the submitted JSON body", async () => {
        const result = await postJson("/echo", {
            message: "hello"
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            message: "hello"
        });
    });

    test("POST /echo rejects invalid JSON", async () => {
        const result = await postRaw("/echo", "{ bad json");

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty("error");
    });

    test("POST /uppercase returns the submitted JSON body", async () => {
        const result = await postJson("/uppercase", {
            message: "hello"
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            message: "HELLO"
        });
    });


    test("POST /calculate can add two numbers", async () => {
        const result = await postJson("/calculate", {
            operation: "add",
            a: 2,
            b: 3
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            result: 5
        });
    });

    test("POST /calculate can subtract two numbers", async () => {
        const result = await postJson("/calculate", {
            operation: "subtract",
            a: 10,
            b: 4
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            result: 6
        });
    });

    test("POST /calculate can multiply two numbers", async () => {
        const result = await postJson("/calculate", {
            operation: "multiply",
            a: 6,
            b: 7
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            result: 42
        });
    });

    test("POST /calculate can divide two numbers", async () => {
        const result = await postJson("/calculate", {
            operation: "divide",
            a: 20,
            b: 5
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            result: 4
        });
    });

    test("POST /calculate can use the modulo operation", async () => {
        const result = await postJson("/calculate", {
            operation: "modulo",
            a: 26,
            b: 5
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            result: 1
        });
    });

    test("POST /calculate rejects division by zero", async () => {
        const result = await postJson("/calculate", {
            operation: "divide",
            a: 20,
            b: 0
        });

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty("error");
    });

    test("POST /calculate rejects unsupported operations", async () => {
        const result = await postJson("/calculate", {
            operation: "power",
            a: 2,
            b: 3
        });

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty("error");
    });

    test("POST /calculate rejects missing fields", async () => {
        const result = await postJson("/calculate", {
            operation: "add",
            a: 2
        });

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty("error");
    });

    test("POST /calculate rejects non-number values", async () => {
        const result = await postJson("/calculate", {
            operation: "add",
            a: "two",
            b: 3
        });

        expect(result.status).toBe(400);
        expect(result.body).toHaveProperty("error");
    });

    test("GET /requests returns a request count", async () => {
        await getJson("/health");
        const result = await getJson("/requests");

        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("totalRequests");
        expect(typeof result.body.totalRequests).toBe("number");
        expect(result.body.totalRequests).toBeGreaterThanOrEqual(2);
    });

    */


