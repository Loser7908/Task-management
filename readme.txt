Build a simplified task management system (like Trello Lite) with:
A Nextjs frontend
Node.js backend
For  Security Purpose Add Request and Response must be encrypted and decrypted using cryptojs (cypher ) 
2 Types of User (Admin and User ) Admin Create the tas and User only can Update the task 
After Update message gone to admin vai nodemailer 
Live Chat Between User and Admin One to One 
MongoDB for data storage
·        It must support login, task creation, viewing, and editing with status tracking.
    
4.5 hours
Frontend (React):
Login Page (Static, just simulates authentication using email,and password)
Dashboard Page (after login)
Display columns: To Do, In Progress, Completed
Each column shows a list of tasks (with title, description, due date)
Create Task Modal
Task title, description, status (dropdown), due date
Update Task on click (edit modal)
Chat Functionality Add for User and Admin Connectivity 
Drag & Drop functionality to change task status (Bonus)
Use of Redux Toolkit or Context API (must)
Styled with Tailwind or Bootstrap (minimum styling required)
Backend (Node.js with Express):
Endpoints:
      .POST/Signup-Signup email,password and age 
POST /login – login returns a JWT
GET /tasks – List all tasks(User,Admin)
POST /tasks – Create a new task(Admin)
PUT /tasks/:id – Update task(User,Admin)
DELETE /tasks/:id – Delete task(Admin)
For Chat the Routes Needed
Use JWT Authentication Middleware
Connect to MongoDB

After Completion Push into github With Proper README.md file 
And send that to wansika@cheenta.org by 18th June 2025 12:00 PM IST
