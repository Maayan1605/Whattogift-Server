import jwt from 'jsonwebtoken';
import Account from '../models/account.js';

export default (req, res, next) => {

    const header = req.headers['authorization']
    if(header){
        const bearer = header.split(' ');
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, '3jhmEBXziU3HZao2aTXzixnj7fZXoe9h', (error, authdata)=>{
            if (error){
                return res.sendStatus(403);
            } else {
                Account.findOne({email: authdata.account.email})
                .then(user => {
                    req.user = user;
                    next();
                })
                .catch(error=>{
                    return res.status(500).json({
                        message: error.message
                    })
                });
            }
        })
    } else {
        return res.sendStatus(403);
    }
}