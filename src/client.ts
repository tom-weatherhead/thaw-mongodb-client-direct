// thaw-mongodb-client-direct/src/client.ts

import { MongoClient, MongoClientOptions } from 'mongodb';

import { ifDefinedThenElse } from 'thaw-common-utilities.ts';

import { IMongoDBClient, IMongoDBDatabase } from 'thaw-types';

import { createDatabase } from './database';

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

	public getDatabase(databaseName: string): IMongoDBDatabase {
		if (this.isClientDestroyed) {
			throw new Error('getCollection() : The connection has already been destroyed');
		} else if (!this.isClientConnected) {
			throw new Error('getCollection() : The client is not connected');
		}

		return createDatabase(this.mongoClient, databaseName);
	}
}

export /* async */ function createDirectMongoDBClient(
	options: {
		server?: string;
		port?: number;
		// databaseName: string;
		// connectImmediately?: boolean;
	} = {}
): IMongoDBClient {
	const server = ifDefinedThenElse(options.server, 'localhost');
	const port = ifDefinedThenElse(options.port, 27017);
	const databaseUrl = `mongodb://${server}:${port}`;
	// )}:${ifDefinedThenElse(options.port, 27017)}/${options.databaseName}`;

	const mongoClientOptions: MongoClientOptions = {};

	return new MongoDBClient(databaseUrl, mongoClientOptions);

	// Connect by default? Or create an option named connectImmediately. I.e.:

	// return await new MongoDBClient(databaseUrl, mongoClientOptions).connect();
}
