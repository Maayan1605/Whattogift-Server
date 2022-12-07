import express from "express";
import mongoose from 'mongoose';
import { getDistance } from 'geolib';
import Company from "../models/company.js";
const router = express.Router();
import Auth from './auth.js';

router.post('/create_company', Auth, async(request, response) => {
    const user = request.user;
    const company = await Company.find({associateId: user.associateId});
    if (company.length > 0) {
        return response.status(200).json({ 
            status: false,
            message: 'Company already exists.'
         });
    }
    else {
        const id = mongoose.Types.ObjectId();
        const { companyName, contact } = request.body;
        const newCompany = new Company({
            _id: id,
            associateId: user.associateId,
            companyName: companyName,
            contact: contact,
            bio: ''
        });
        newCompany.save()
        .then((createdCompany) => {
            return response.status(200).json({ 
                status: true,
                message: createdCompany
            });
        })
        .catch(error => {
            return response.status(500).json({ 
                status: false,
                message: error.message
             });
        }) 
    }
});

router.put('/update_company', Auth, async(request, response) => {
    //TODO 
});


router.get('/get_company', Auth, async(request, response) => {
    //TODO
});

/**
* @swagger
* /api/company/get_companies:
*    get:
*       summary: Returns list of all categories
*       tags: [Company]
*       responses:
*           200:
*               description: This is the list of all brands
*               content: 
*                   application/json:
*                       schema:
*                        type: array
*/
router.get('/get_companies', Auth, async(request, response) => {
    const {longitude, latitude} = request.body;
    Company.find()
    .then(companies => {
        return response.status(200).json({
            message: companies
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
});


router.post('/get_companies_with_distance', Auth, async(request, response) => {
    const {longitude, latitude} = request.body;
    Company.find()
    .then(companies => {
        let companies_with_distance = companies.map(company => {
            let distance = getDistance(
                {longitude: longitude, latitude: latitude}, 
                {longitude: company.contact.longitude, latitude: company.contact.latitute});
            company.distance = distance;
            return company;
        })
        return response.status(200).json({
            message: companies_with_distance
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
});

export default router;