/**
 * Created by Navit
 */

 'use strict';

var mongo = {
    URI: process.env.MONGO_URI || 'mongodb+srv://'+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@cluster0-u4lid.mongodb.net/myshout-dev?retryWrites=true&w=majority",
    //URI: process.env.MONGO_URI || "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@localhost/"+process.env.MONGO_DBNAME_DEV,
    port: 27017
};

module.exports = {
    mongo: mongo
};



