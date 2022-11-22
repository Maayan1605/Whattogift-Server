import express from "express";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import auth from "./auth.js";
const router = express.Router();

// models
import Account from '../models/account.js';

// routes
router.post('/signup', async(request, response) => {
    // Get user register data
    const id = mongoose.Types.ObjectId();
    const { firstName, lastName, email, password } = request.body;
    // Check if user exists
    Account.findOne({ email: email })
    .then(async account => {
        if (account) {
            return response.status(200).json({ 
                status: false,
                message: 'Account already exists.'
             });
        }
        const passcode = Math.floor(Math.random() * 10000);
        const hashPassword = await bcryptjs.hash(password, 10);
        Account.create({
            _id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashPassword,
            passcode: passcode
        })
        .then(addedAcount => {
            return response.status(200).json({ 
                status: true,
                message: addedAcount 
            });
        })
        .catch(err => {
            return response.status(500).json({
                status: false,
                message: err 
            });
        })
    })
    .catch(err => {
        return response.status(500).json({
            status: false,
            message: err 
        });
    })
});

router.post('/verify', async(request, response) => {
    // Get user register data
    const { email, password, passcode } = request.body;
    // Check if user exists
    Account.findOne({ email: email })
    .then(async account => {
        if (!account) {
            return response.status(200).json({
                status: false,
                message: 'Account doesn\'t exist.' 
            });
        }
        else if (!await bcryptjs.compare(password, account.password)) {
            return response.status(200).json({ 
                status: false,
                message: 'Incorrect password.'
            });
        }
        if (passcode != account.passcode) {
            return response.status(200).json({ 
                status: false,
                message: 'Incorrect passcode.' 
            });
        }
        account.isVerified = true;
        account.save()
        .then(verifiedAccount => {
            return response.status(200).json({ 
                status: true,
                message: verifiedAccount 
            });
        })
        .catch(err => {
            return response.status(500).json({ 
                status: false,
                message: err 
            });
        })
    })
    .catch(err => {
        return response.status(500).json({ 
            status: false,
            message: err 
        });
    })
});

router.post('/login', async(request, response) => {
    // Get user register data
    const { email, password } = request.body;
    // Check if user exists
    Account.findOne({ email: email })
    .then(async account => {
        if (!account) {
            return response.status(200).json({
                status: false,
                message: 'Account doesn\'t exist.' 
            });
        }
        else if (!await bcryptjs.compare(password, account.password)) {
            return response.status(200).json({ 
                status: false,
                message: 'Incorrect password.'
            });
        }
        else if (!account.isVerified) {
            return response.status(200).json({ 
                status: false,
                message: 'Account isn\'t verified.'
            });
        }
        const token = jwt.sign({account}, '3jhmEBXziU3HZao2aTXzixnj7fZXoe9h');
        return response.status(200).json({ 
            status: true,
            message: account,
            token: token
        });
    })
    .catch(err => {
        return response.status(500).json({ 
            status: false,
            message: err 
        });
    })
});

//to do:
//Update account
router.put('/updateAccount', async(request, response) => {});// update fname, lname, dob, gender, contact.

//Update password
router.put('/updatePassword', async(request, response) => {});

router.get('/getOverview', auth, async(request, response) => {
    return response.status(200).json({
        status: true,
        message: `Hello ${request.user.firstName} ${request.user.lastName}`
    });
});

export default router;