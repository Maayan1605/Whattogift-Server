import express from "express";
import mongoose from 'mongoose';
import { getDistance } from 'geolib';
import Company from "../models/company.js";
const router = express.Router();
import Auth from './auth.js';
import company from "../models/company.js";

router.post('/create_company', Auth, async(request, response) => {
    const user = request.user;
    Company.findOne({associateId: user.associateId})
    .then(company => {
        if (company) {
            return response.status(200).json({ 
                status: false,
                message: 'Company already exists.'
            });
        }
        const id = mongoose.Types.ObjectId();
        const { companyName, contact } = request.body;
        Company.create({
            _id: id,
            associateId: user.associateId,
            companyName: companyName,
            contact: contact,
            bio: ''
        })
        .then(createdCompany => response.status(200).json({ 
            status: true,
            message: createdCompany
        }))
        .catch(error => response.status(500).json({ 
            status: false,
            message: error.message
        }))
    })
    .catch(error => response.status(500).json({ 
        status: false,
        message: error.message
    }))
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

function getCompanyWithDistance(company, longitude, latitude) {
    let distance = getDistance({longitude: longitude, latitude: latitude}, 
        {longitude: company.contact.longitude, latitude: company.contact.latitude});
    let companyWithDistance = JSON.parse(JSON.stringify(company));
    companyWithDistance.distance = distance;
    return companyWithDistance;
}

export async function getDistanceByCompanyId(companyId, latitude, longitude) {
    return Company.findById(companyId.toString())
    .then(company => { 
        return getCompanyWithDistance(company, longitude, latitude).distance;
    })
    .catch(error => null)
}

router.post('/get_companies_with_distance', Auth, async(request, response) => {
    const {longitude, latitude} = request.body;
    Company.find()
    .then(companies => {
        let companies_with_distance = companies.map(company => getCompanyWithDistance(company, longitude, latitude))
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