import express from "express";
import mongoose from 'mongoose';
import Auth from "./auth.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";
import Product from "../models/product.js";

const router = express.Router();


/**
 * @swagger
 * /api/product/get_all_brands:
*    get:
*       summary: Returns list of all brands
*       tags: [Products]
*       responses:
*           200:
*               description: This is the list of all brands
*               content: 
*                   application/json:
*                       schema:
*                        type: array
*/
router.get('/get_all_brands', async(request, response) => {
    Brand.find()
    .then(brands => {
        return response.status(200).json({
            message: brands
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
})

/**
 * @swagger
 * /api/product/get_brand_by_id/{id}:
 *  get:
 *  summery: Get brand name by id
 *  tags: [Products]
 *  parameters
 *   - in: path
 *     name: id
 *     schema:
 *      type: string
 *     required: true
 *  responses:
 *   200:
 *    description: Brand success
 *   500:
 *    Something is not working well
 */
router.get('/get_brand_by_id/:id', async(request, response) => {
    Brand.findById(req.params.id)
    .then(brand => {
        if (brand == null) {
            return response.status(200).json({
                message: 'Brand not exsited'
            })
        }
        return response.status(200).json({
            message: brand
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
})


/**
 * @swagger
 * definitions:
 *  Brand:
 *   type: object
 *   properties:
 *    brandName:
 *     type: string
 *    brandLogo:
 *     type: string
 */
router.post('/create_new_brands', async(request, response) => {
    const id = mongoose.Types.ObjectId();
    const { brandName, brandLogo } = request.body;
    Brand.find({ brandName: brandName })
    .then(brands => {
        if (brands) {
            return response.status(200).json({
                message: 'Brand already exist.'
            })
        }
        Brand.create({
            _id: id,
            brandName: brandName,
            brandLogo: brandLogo
        })
        .then(addedBrand => {
            return response.status(200).json({
                message: addedBrand
            })
        })
    })
});

/**
 * @swagger
 * /api/product/get_all_products:
*    get:
*       summary: Returns list of all products
*       tags: [Products]
*       responses:
*           200:
*               description: This is the list of all products
*               content: 
*                   application/json:
*                       schema:
*                        type: array
 */
router.get('/get_all_products', async(request, response) => {
    Product.find()
    .then(products => {
        return response.status(200).json({
            message: products
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
})


/**
 * @swagger
 * /api/product/get_all_categories:
*    get:
*       summary: Returns list of all categories
*       tags: [Products]
*       responses:
*           200:
*               description: This is the list of all categories
*               content: 
*                   application/json:
*                       schema:
*                        type: array
 */
router.get('/get_all_categories', async(request, response) => {
    Category.find()
    .then(categories => {
        return response.status(200).json({
            message: categories
        })
    })
    .catch(categories => {
        return response.status(500).json({
            message: error.message
        })
    })
})

export default router;