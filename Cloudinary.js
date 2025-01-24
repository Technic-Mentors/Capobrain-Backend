const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET
});

module.exports = cloudinaryV2;
