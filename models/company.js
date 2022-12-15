import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const companySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    associateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    companyName: {type: String, required: true},
    contact: {
        address: String,
        city: String,
        state: String,
        zipcode: String,
        mobile: String,
        latitute: String,
        longitude: String
    },
    logo: {type: String, default: 'https://cdn.logo.com/hotlink-ok/logo-social.png'},
    bio: String,
    createdAt: {type: Date, default: Date.now }

});

export default mongoose.model('Company', companySchema);