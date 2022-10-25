import express from "express";

const router = express.Router();

router.get('/say-hello', async(request, response) => {
    return response.status(200).json({
        message: 'Hello'
    });
});

export default router;