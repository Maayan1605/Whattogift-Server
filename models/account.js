import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const accountSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    associateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: {type: Date, default: Date.now },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    avatar: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&usqp=CAU' },
    isVerified: { type: Boolean, default: false },
    passcode: Number,
    contact: {
        address: String,
        city: String,
        state: String,
        zipcode: String,
        mobile: String
    }
});

export default mongoose.model('Account', accountSchema);