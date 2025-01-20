
---

### **7. `07_authentication_frontend.md`**
```markdown
# Step 7: Frontend Authentication Setup

## Goal
Create login and signup forms and manage JWT tokens securely on the frontend.

---

## Instructions

1. **Set up a context for authentication:**
   - Create `src/context/AuthContext.js`:
     ```javascript
     import React, { createContext, useState, useContext } from 'react';

     const AuthContext = createContext();

     export const AuthProvider = ({ children }) => {
       const [user, setUser] = useState(null);

       const login = async (email, password) => {
         const response = await fetch('/api/auth/login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password }),
         });
         const data = await response.json();
         if (data.token) {
           localStorage.setItem('token', data.token);
           setUser(data.user);
         }
       };

       const logout = () => {
         localStorage.removeItem('token');
         setUser(null);
       };

       return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
     };

     export const useAuth = () => useContext(AuthContext);
     ```

2. **Create Login and Signup Pages:**
   - Login page (`src/pages/Login.js`):
     ```javascript
     import React, { useState } from 'react';
     import { useAuth } from '../context/AuthContext';

     const Login = () => {
       const { login } = useAuth();
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');

       const handleSubmit = (e) => {
         e.preventDefault();
         login(email, password);
       };

       return (
         <form onSubmit={handleSubmit}>
           <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
           <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
           <button type="submit">Login</button>
         </form>
       );
     };

     export default Login;
     ```

3. **Protect Routes:**
   - Add a `ProtectedRoute` component:
     ```javascript
     import React from 'react';
     import { useAuth } from '../context/AuthContext';
     import { Navigate } from 'react-router-dom';

     const ProtectedRoute = ({ children }) => {
       const { user } = useAuth();
       return user ? children : <Navigate to="/login" />;
     };

     export default ProtectedRoute;
     ```

4. **Test Login Flow:**
   - Run the app and verify login functionality.

---

**Next Step:** Run `08_projects_crud_backend.md`
