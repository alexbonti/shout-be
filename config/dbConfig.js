/**
 * Created by Navit
 */

'use strict';


const mongo = process.env.USE_LOCAL_DB === "true" ? {
	URI: process.env.MONGO_URI,
	port: 27017
} : {
		//URI: process.env.MONGO_URI || 'mongodb://localhost/refugees',
		URI: "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASS + "@cluster0-u4lid.mongodb.net/myshout-dev?retryWrites=true&w=majority",
		port: 27017
	};

module.exports = {
	mongo: mongo
};



