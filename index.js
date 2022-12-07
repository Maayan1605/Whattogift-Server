import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress, { serve } from 'swagger-ui-express'


const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const options = {
    definition : {
        openapi: '3.0.0',
        info: {
            title: 'Whatogift API Endpoints',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:3001'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
        
    },
    apis: ['./controllers/*.js']
}

const swaggerSpec = swaggerJSDoc(options)
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec))



///////////////////////ROUTS/////////////////////
import accountRoute from './controllers/account.js';
app.use('/api/account', accountRoute);

import companyRoute from './controllers/company.js';
app.use('/api/company', companyRoute);

import productRoute from './controllers/product.js';
app.use('/api/product', productRoute);
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