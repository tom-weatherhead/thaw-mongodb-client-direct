// thaw-mongodb-client-direct/src/cliient.ts

import { MongoClient, MongoClientOptions } from 'mongodb';

import { ifDefinedThenElse } from 'thaw-common-utilities.ts';

import { IMongoDBClient, IMongoDBCollection } from 'thaw-types';

import { createCollection } from './collection';

class MongoDBClient implements IMongoDBClient {
	private readonly mongoClient: MongoClient;
	private isClientConnected = false;
	private isClientDestroyed = false;

	constructor(url: string, options: MongoClientOptions) {
		this.mongoClient = new MongoClient(url, options);
	}

	public async connect(): Promise<IMongoDBClient> {
		await this.mongoClient.connect();
		this.isClientConnected = true;

		return this;
	}

	public async destroy(): Promise<void> {
		if (this.isClientConnected && !this.isClientDestroyed) {
			this.isClientConnected = false;
			this.isClientDestroyed = true;
			await this.mongoClient.close();
		}
	}

	public getCollection(databaseName: string, collectionName: string): IMongoDBCollection {
		if (this.isClientDestroyed) {
			throw new Error('getCollection() : The connection has already been destroyed');
		} else if (!this.isClientConnected) {
			throw new Error('getCollection() : The client is not connected');
		}

		return createCollection(this.mongoClient, databaseName, collectionName);
	}
}

export function createDirectMongoDBClient(options: {
	server?: string;
	port?: number;
	databaseName: string;
}): IMongoDBClient {
	const databaseUrl = `mongodb://${ifDefinedThenElse(
		options.server,
		'localhost'
	)}:${ifDefinedThenElse(options.port, 27017)}/${options.databaseName}`;
	const mongoClientOptions: MongoClientOptions = {};

	return new MongoDBClient(databaseUrl, mongoClientOptions);
}
