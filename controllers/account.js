import express from "express";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import auth from "./auth.js";
const router = express.Router();

// models
import Account from '../models/account.js';

// routes

/**
 * @swagger
 * definitions:
 *  Login:
 *      type: object
 *      properties:
 *          email:
 *              type: string
 *              example: example@gmail.com
 *          password:
 *              type: string
 *              example: password
 *  Signup:
 *      type: object
 *      properties:
 *          firstName:
 *              type: string
 *              example: Fname
 *          lastName:
 *              type: string
 *              example: Lname
 *          email:
 *              type: string
 *              example: example@gmail.com
 *          password:
 *              type: string
 *              example: password
 *  Verify:
 *      type: object
 *      properties:
 *          email:
 *              type: string
 *              example: example@gmail.com
 *          password:
 *              type: string
 *              example: password
 *          passcode:
 *              type: int
 *              example: 1234
 */

/**
 * @swagger
 * /api/account/signup:
 *  post:
 *      summary: Create new account
 *      tags: [Account]
 *      description: Use this endpoint to create a new account
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/definitions/Signup'
 *      responses:
 *          200:
 *              discription: Success 
 *          500:
 *              discription: Error 
 */
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
            associateId: id,
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

/**
 * @swagger
 * /api/account/verify:
 *  post:
 *      summary: Verify
 *      tags: [Account]
 *      description: Use this endpoint to verify a created account
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/definitions/Verify'
 *      responses:
 *          200:
 *              discription: Success 
 *          500:
 *              discription: Error 
 */
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

/**
 * @swagger
 * /api/account/login:
 *  post:
 *      summary: Login
 *      tags: [Account]
 *      description: Use this endpoint to log into your account account
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/definitions/Login'
 *      responses:
 *          200:
 *              discription: Success 
 *          500:
 *              discription: Error 
 */
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
router.put('/update_account', async(request, response) => {});// update fname, lname, dob, gender, contact.

//Update password
router.put('/update_password', async(request, response) => {});

router.get('/get_overview', auth, async(request, response) => {
    return response.status(200).json({
        status: true,
        message: `Hello ${request.user.firstName} ${request.user.lastName}`
    });
});

export default router;