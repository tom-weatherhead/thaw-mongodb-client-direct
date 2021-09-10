// thaw-mongodb-client-direct/src/database.ts

import { Db, MongoClient } from 'mongodb';

import { IMongoDBCollection, IMongoDBDatabase } from 'thaw-types';

import { createCollection } from './collection';

// export interface IMongoDBDatabase {
// 	getCollection(collectionName: string): IMongoDBCollection;
// }

class MongoDBDatabase implements IMongoDBDatabase {
	// private readonly db: Db;
	//
	// constructor(mongoClient: MongoClient, databaseName: string) {
	// 	this.db = mongoClient.db(databaseName);
	// }

	constructor(private readonly db: Db) {}

	public getCollection(collectionName: string): IMongoDBCollection {
		return createCollection(this.db, collectionName);
	}
}

export function createDatabase(mongoClient: MongoClient, databaseName: string): IMongoDBDatabase {
	// return {
	// 	getCollection: (collectionName: string) =>
	// 		createCollection(httpJsonClient, `${serverUrl}/${databaseName}/${collectionName}`)
	// };
	return new MongoDBDatabase(mongoClient.db(databaseName));
}
