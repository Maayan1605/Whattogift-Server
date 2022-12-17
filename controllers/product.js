import express, { response } from "express";
import mongoose from 'mongoose';
import Auth from "./auth.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";
import Product from "../models/product.js";
import { getDistance } from "geolib";
import { getDistanceByCompanyId } from "./company.js";
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
router.get('/get_all_brands', Auth, async(request, response) => {
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
router.get('/get_brand_by_id/:id', Auth, async(request, response) => {
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
router.post('/create_new_brand', Auth, async(request, response) => {
    const id = mongoose.Types.ObjectId();
    const { brandName, brandLogo } = request.body;
    Brand.findOne({ brandName: brandName })
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
router.get('/get_all_products', Auth, async(request, response) => {
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

router.post('/create_product', Auth, async(request, response) => {
    const id = mongoose.Types.ObjectId();
    const {
        companyId,categoriesId,brandId,
        productName,productPrice,productDescription,
        unitInStock, productImage, minAge, maxAge, related, gender
    } = request.body;
    Product.findOne({productName: productName, companyId: companyId, brandId: brandId})
    .then(product => {
        if (product) {
            return response.status(200).json({
                message: 'Product with the same name from the same company and brand is already existed.'
            })
        }
        Product.create({
            _id: id,
            companyId: companyId,
            categoriesId: categoriesId,
            brandId: brandId,
            productName: productName,
            productDescription: productDescription,
            productImages: [productImage],
            productPrice: productPrice,
            unitInStock: unitInStock,
            minAge: minAge,
            maxAge: maxAge,
            gender: gender,
            related: related,
            reviews: []
        })
        .then(createdProduct => response.status(200).json({
            message: createdProduct
        }))
    })
    .catch(error => response.status(500).json({
        message: error.message
    }));
})

async function getProductWithMatchingValue(product, gender, related, eventId, interests, age, minPrice, maxPrice, latitude, longitude, distance) {
    let matchingFields = 0;
    if (product.gender == gender)
        matchingFields++;
    if (related != null && product.related == related)
        matchingFields++;
    if (product.categoriesId.find(categoryId => categoryId.equals(eventId))) 
        matchingFields++;
    if (product.categoriesId.find(categoryId => interests.find(interestId => categoryId.equals(interestId)))) 
        matchingFields++;
    if (product.minAge <= age && product.maxAge >= age)
        matchingFields++;
    if (minPrice != null && maxPrice != null && product.productPrice >= minPrice && product.productPrice <= maxPrice)
        matchingFields++;
    if (distance != null) {
        let productDistance = await getDistanceByCompanyId(product.companyId, latitude, longitude)
        if(productDistance != null && productDistance <= distance) {
            matchingFields++;
        }
    }
    return { // returns a new object that holds the product and the amount of matching fields.
        product: product,
        match: matchingFields
    };
}

router.post('/get_filtered_products', Auth, async(request, response) => {
    try{
        const {gender, related, event, 
            interests, age, minPrice, maxPrice, 
            latitude, longitude, distance} = request.body;
        let eventId = await singleCategoryIdByName(event)
        let interestsId = await categoriesIdByNames(interests)
        const products = await Product.find({$or: [
            {gender: gender}, 
            {related: related},
            {categoriesId:{$elemMatch: {eventId}}}, // Event is a category
            {categoriesId:{$elemMatch:{$in:interestsId}}}, // Interest is a category
            {$and: [{minAge: {$lte: age}}, {maxAge: {$gte: age}}]},
        ]})
        let maxMatchingFields = 0;
        const matchingProducts = [];
        for (let product of products) {
            let matchProduct = await getProductWithMatchingValue(product, gender, related, eventId, interestsId, age, minPrice, maxPrice, latitude, longitude, distance);
            if (matchProduct.match >= maxMatchingFields) {
                maxMatchingFields = matchProduct.match;
                matchingProducts.push(matchProduct)
            }
        }
        return response.status(200).json({
            message: matchingProducts
                .filter(productWithMatch => productWithMatch.match == maxMatchingFields)
                .map(productWithMatch => productWithMatch.product)
        });
    }
    catch(error) { 
        return response.status(500).json({
            message: error.message
        });
    }
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
router.get('/get_all_categories', Auth, async(request, response) => {
    Category.find()
    .then(categories => {
        return response.status(200).json({
            message: categories
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
})

router.post('/create_category', Auth, async(request, response) => {
    const id = mongoose.Types.ObjectId();
    const categoryName = request.body.categoryName;
    Category.findOne({categoryName: categoryName})
    .then(category => {
        if (category) {
            return response.status(200).json({
                message: 'Category already exists'
            })
        }
        Category.create({
            _id: id,
            categoryName: categoryName
        })
        .then(createdCategory => {
            return response.status(200).json({
                message: createdCategory 
            })
        })
    })
    .catch(error => {
        return response.status(500).json({
            message: error.message
        })
    })
})

async function categoriesIdByNames(names) {
    return Category.find({ categoryName: { $in: names} })
        .then(categories => categories.map(category => category._id))
        .catch(error => []);
}

async function singleCategoryIdByName(name) {
    return Category.findOne({categoryName: name})
        .then(category => {
            if (category != null) {
                return category._id;
            }
            return null;
        })
        .catch(error => null)
}

export default router;