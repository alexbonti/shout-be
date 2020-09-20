/**
 * Created by Navit
 */

 'use strict';


var mongo = {
	  //URI: process.env.MONGO_URI || 'mongodb://localhost/refugees',
	URI: process.env.MONGO_URI || "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@cluster0-u4lid.mongodb.net/myshout-dev?retryWrites=true&w=majority",
	    port: 27017
};

module.exports = {
    mongo: mongo
};



