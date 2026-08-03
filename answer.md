#### What is the difference between authentication and authorization?
- Authentication verifies WHO you are, authorization determines WHAT you are allowed to access

#### Why should passwords be hashed instead of stored directly?
- In the event of a data breach, a hashed password is much harder to turn into useful information that could be used to compromise accounts

#### What information did you include in your JWT, and why?
- I included username, role, time created and time expired. This allows me to authorize access to projects based on if the username matches the owner of the project or to give access to all resources if the user has the "admin" role. 

Beyond giving access to resources, by including an expiration time in the token, if a token were to mistakenly be uploaded to a public repository, whoever would have found the token on a public repo would likely not be able to use it for harm because the token would had already expired.

#### What is the difference between a 401 response and a 403 response?
A 401 response indicated that something went wrong with the authentication process such as an incorrect password. A 403 error indicates that the user that has been authenticated is not allowed to access the resource requested

#### Where does your application perform role or ownership checks?
My application contains the file apps/api/src/services/getTaskParentProject.js which gets the parent project of a task that a user is trying to access. We then user the file apps/api/src/services/getProjectOwner.js to get the project owner. If the owner is the user requesting access to the task or the requesting user is an admin, the request is granted. If not the request is denied with a 403 error.

#### How are users, projects, and tasks related in your database?

Task are owned by projects. Projects are owned by users. Owners of projects may add members to their projects to grant read only access, but write access to projects and the task within them are reserved for the owner of the project or users with the admin role

#### What was the hardest part of adding authentication or authorization?
The hardest part of authorization was implementing the check to go from what task/resource was attmepting to be accessed, to then getting that resources corresponding parent project, and then checking the owner of that parent project to then see if that owner is the requesting user and would therefore have rights to modify the task. In general, this tracing from one type of resource to the other to get the required information was the hardest part.