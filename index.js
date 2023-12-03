import express from 'express';
import router from './src/routes.js';
import ('./src/database/dbconfig.js')

const app = express();
const port = 3003;
app.use(express.json());
app.use(router);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})