
---

### **3. `03_database_setup.md`**
```markdown
# Step 3: Database Setup

## Goal
Set up the PostgreSQL database and define required models.

---

## Instructions

1. **Set up PostgreSQL:**
   - Create a database named `prody_dashboard`.
   - Start PostgreSQL service:
     ```bash
     sudo service postgresql start
     ```

2. **Define models with Sequelize:**
   - Users model:
     ```bash
     npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string,role:string
     ```
   - Projects model:
     ```bash
     npx sequelize-cli model:generate --name Project --attributes name:string,contact:string,email:string,value:integer,source:string
     ```

3. **Run migrations:**
   ```bash
   npx sequelize-cli db:migrate
