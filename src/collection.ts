// thaw-mongodb-client-direct/src/collection.ts

// Guide for migration to mongodb 4.x :
// See https://github.com/mongodb/node-mongodb-native/blob/4.1/docs/CHANGES_4.0.0.md

import {
	Collection,
	Db,
	Document,
	Filter,
	InsertOneResult,
	ModifyResult,
	ObjectId,
	OptionalId,
	UpdateFilter
} from 'mongodb';

import { IMongoDBCollection } from 'thaw-types';

interface IDropCollectionError {
	name: string;
	errmsg: string;
	ok: number;
}

// critter() : The Criteria Generator.

function critter<TSchema>(id: string): Filter<TSchema> {
	// Prevent 'prettier' from removing the quotes around '_id';
	// they are necessary.
	// I.e. prettier will clobber this:

	// return { '_id': new ObjectId(id) };

	// The solution:

	const criteria: Filter<TSchema> = {};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(criteria as any)['_id'] = new ObjectId(id);

	return criteria;
}

class MongoDBCollection<TSchema extends Document = Document> implements IMongoDBCollection {
	constructor(private readonly collection: Collection) {}

	public async createOne(dataToInsert: OptionalId<TSchema>): Promise<InsertOneResult<TSchema>> {
		return await this.collection.insertOne(dataToInsert);
	}

	public async read(criteria = {}): Promise<unknown[]> {
		const cursor = this.collection.find(criteria);

		return await cursor.toArray();
	}

	public async readOneById(id: string): Promise<unknown> {
		return await this.collection.findOne(critter(id));
	}

	public async readAll(): Promise<unknown[]> {
		return await this.read({});
	}

	// public async headOneById(id: string): Promise<unknown> {
	// 	return await this.collection.findOne(critter(id))... and return:
	// 	- true if found
	// 	- false if not found?
	// }

	public async replaceOneById(
		id: string,
		replacementData: Document
	): Promise<ModifyResult<Document>> {
		// Analogous to HTTP PUT

		// options: { safe?: any; remove?: boolean; upsert?: boolean; new?: boolean },

		return await this.collection.findOneAndReplace(
			critter(id), // query
			replacementData, // doc
			// { remove: false, upsert: false } // options
			{ upsert: false } // options
		);
		/* .then((result: any) => {
				return Promise.resolve(result); // Returns the old version of the record
			})
			.catch((error: Error) => {
				console.error(
					'updateOneById() : error is',
					typeof error,
					error
				);

				return Promise.reject(error);
			}); */
	}

	public async updateOneById(
		id: string,
		update: UpdateFilter<Document>
	): Promise<ModifyResult<Document>> {
		// Analogous to HTTP PATCH

		/**
		 * Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation.
		 *
		 * @param filter - The filter used to select the document to update
		 * @param update - Update operations to be performed on the document
		 * @param options - Optional settings for the command
		 * @param callback - An optional callback, a Promise will be returned if none is provided
		 */
		// findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>): Promise<ModifyResult<TSchema>>;
		// findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, callback: Callback<ModifyResult<TSchema>>): void;
		// findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: FindOneAndUpdateOptions): Promise<ModifyResult<TSchema>>;
		// findOneAndUpdate(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options: FindOneAndUpdateOptions, callback: Callback<ModifyResult<TSchema>>): void;

		// options: { safe?: any; remove?: boolean; upsert?: boolean; new?: boolean },

		return await this.collection.findOneAndUpdate(
			critter(id), // query
			update // : UpdateFilter<TSchema>
			// , options: FindOneAndUpdateOptions
		);
	}

	// public deleteOneById(id: string): Promise<boolean> {
	// 	// findOneAndDelete(filter: Filter<TSchema>): Promise<ModifyResult<TSchema>>;
	//
	// 	return this.collection
	// 		.findOneAndDelete(critter(id))
	// 		.then((result: ModifyResult<Document>) => {
	// 			console.log('deleteOneById() : result is', typeof result, result);
	//
	// 			if (result !== null) {
	// 				console.log('Record was found and removed.');
	// 			} else {
	// 				console.log('Record was not found.');
	// 			}
	//
	// 			return Promise.resolve(result !== null);
	// 		})
	// 		.catch((error: Error) => {
	// 			console.error('deleteOneById() : error is', typeof error, error);
	//
	// 			return Promise.reject(error);
	// 		});
	// }

	public async deleteOneById(id: string): Promise<boolean> {
		// findOneAndDelete(filter: Filter<TSchema>): Promise<ModifyResult<TSchema>>;

		const result = await this.collection.findOneAndDelete(critter(id));

		console.log('deleteOneById() : result is', typeof result, result);

		if (result !== null) {
			console.log('Record was found and removed.');
		} else {
			console.log('Record was not found.');
		}

		return Promise.resolve(result !== null);
		// })
		// .catch((error: Error) => {
		// 	console.error('deleteOneById() : error is', typeof error, error);
		//
		// 	return Promise.reject(error);
		// });
	}

	// public deleteAll(): Promise<boolean> {
	// 	return (
	// 		this.collection
	// 			.drop()
	// 			// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 			.then((result: boolean) => Promise.resolve(true))
	// 			.catch((error: unknown) => {
	// 				const errorCast = error as IDropCollectionError;
	//
	// 				if (typeof errorCast === 'undefined' || errorCast.errmsg !== 'ns not found') {
	// 					return Promise.reject(error);
	// 				} else {
	// 					return Promise.resolve(false);
	// 				}
	// 			})
	// 	);
	// }

	public async deleteAll(): Promise<boolean> {
		try {
			const result = await this.collection.drop();

			console.log('deleteAll() : result is', typeof result, result);

			return Promise.resolve(true);
		} catch (error) {
			const errorCast = error as IDropCollectionError;

			if (typeof errorCast === 'undefined' || errorCast.errmsg !== 'ns not found') {
				return Promise.reject(error);
			} else {
				// The collection wasn't dropped because it didn't exist. No-op.
				return Promise.resolve(false);
			}
		}
	}
}

export function createCollection(db: Db, collectionName: string): IMongoDBCollection {
	return new MongoDBCollection(db.collection(collectionName));
}
