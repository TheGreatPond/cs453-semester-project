CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('3', 'third task', 'this is the third task.', 'not started', '2026-07-14 02:50:21.716814+00', '2026-07-14 02:50:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;
INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('2', 'second task', 'this is the second task.', 'done', '2026-07-14 02:47:21.716814+00', '2026-07-14 02:47:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;
INSERT INTO TASKS (id, title, description, status, created_at, updated_at) VALUES ('1', 'first_task', 'this is the first task.', 'in progress', '2026-07-14 02:46:21.716814+00', '2026-07-14 02:46:21.716814+00') RETURNING id, title, description, status, created_at, updated_at;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    projects INT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO USERS (id, name, created_at, updated_at) VALUES 
('1', 'first_user', '2026-07-14 02:50:21.716814+00', '2026-07-14 02:50:21.716814+00') 
RETURNING id, name, projects, created_at, updated_at;