import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

///////////////////////ROUTS/////////////////////
import accountRoute from './controllers/account.js';
app.use('/api/account', accountRoute);

import companyRoute from './controllers/company.js';
app.use('/api/company', companyRoute);
// import companyRoute from './controllers/company.js';
// app.use('/api/company', companyRoute);
/////////////////////ROUTS-END///////////////////

const mongoUrl = 'mongodb+srv://whattogift-user:yq4EEsDF6BuTpPV1@cluster0.f43qkqd.mongodb.net/whattogiftdb?retryWrites=true&w=majority';

const port = 3001;

mongoose.connect(mongoUrl)
.then(result => {
    app.listen(port, () => {
        console.log(`Server is running via port ${port}`);
    });
})
.catch(error => {
    console.log(error);
})