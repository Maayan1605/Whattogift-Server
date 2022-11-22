import express from "express";
import mongoose from 'mongoose';
import Company from "../models/company.js";
const router = express.Router();
import Auth from './auth.js';

router.post('/createCompany', Auth, async(request, response) => {
    const user = request.user;
    const company = await Company.find({associateId: user._id});
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
            associateId: user._id,
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
            return response.status(200).json({ 
                status: false,
                message: error.message
             });
        }) 
    }
});

router.put('/updateCompany', Auth, async(request, response) => {

});

export default router;