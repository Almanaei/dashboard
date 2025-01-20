
---

### **5. `05_dashboard_components.md`**
```markdown
# Step 5: Build Dashboard Components

## Goal
Create and integrate key dashboard components: Sidebar, Analytics, and Project Table.

---

## Instructions

1. **Create Sidebar Component:**
   - Use Material-UI’s `Drawer`:
     ```javascript
     import { Drawer, List, ListItem, ListItemText } from '@mui/material';

     const Sidebar = () => (
       <Drawer variant="permanent">
         <List>
           {['Dashboard', 'Projects', 'Analytics'].map((text) => (
             <ListItem button key={text}>
               <ListItemText primary={text} />
             </ListItem>
           ))}
         </List>
       </Drawer>
     );

     export default Sidebar;
     ```

2. **Create Analytics Component:**
   - Use Recharts for visualization:
     ```javascript
     import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

     const data = [
       { date: 'Jan 1', revenue: 1000, expenditure: 800 },
       { date: 'Jan 2', revenue: 1200, expenditure: 900 },
     ];

     const Analytics = () => (
       <LineChart width={600} height={300} data={data}>
         <XAxis dataKey="date" />
         <YAxis />
         <Tooltip />
         <CartesianGrid />
         <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
         <Line type="monotone" dataKey="expenditure" stroke="#82ca9d" />
       </LineChart>
     );

     export default Analytics;
     ```

3. **Create Project Table Component:**
   - Use Material-UI’s `Table`:
     ```javascript
     import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

     const ProjectTable = () => (
       <Table>
         <TableHead>
           <TableRow>
             <TableCell>ID</TableCell>
             <TableCell>Deals</TableCell>
             <TableCell>Contact</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           <TableRow>
             <TableCell>01</TableCell>
             <TableCell>Acme</TableCell>
             <TableCell>Tyra Dhillon</TableCell>
           </TableRow>
         </TableBody>
       </Table>
     );

     export default ProjectTable;
     ```

---

**Next Step:** Combine and Deploy in `06_deploy_project.md`
