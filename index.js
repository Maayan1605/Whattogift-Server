import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import accountRoute from './controllers/account.js';

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

///////////////////////ROUTS/////////////////////
app.use('/api/account', accountRoute);
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