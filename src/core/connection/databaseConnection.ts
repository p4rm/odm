import { Logger, mongodb } from '../../../deps.ts';
import DatabaseConfiguration from './databaseConfiguration.ts';

export default class DatabaseConnection {
  static #logger = Logger.createLogger({
    label: `ODM :: ${DatabaseConnection.name}`
  });
  #conn: mongodb.MongoClient;
  #uri: string;

  constructor(conn: mongodb.MongoClient, uri: string) {
    this.#conn = conn;
    this.#uri = uri;
  }

  static async connect(
    dbConfig: DatabaseConfiguration
  ): Promise<DatabaseConnection> {
    return await this.connectByUri(dbConfig.getUri());
  }

  static async connectByUri(uri: string) {
    try {
      const conn = await this.#createConnectionByUri(uri);
      DatabaseConnection.#logger.info('mongo db connection open');
      return new DatabaseConnection(conn, uri);
    } catch (err: any) {
      DatabaseConnection.#logger.error(err.message + '');
      throw err;
    }
  }

  static async dropDatabase(dbConfig: DatabaseConfiguration): Promise<void> {
    const c = await DatabaseConnection.connect(dbConfig);
    try {
      await c.dropDatabase();
      await c.closeConnection();
    } catch (err) {
      await c.closeConnection();
      throw err;
    }
  }

  static #createConnectionByUri = async (
    uri: string
  ): Promise<mongodb.MongoClient> => {
    const client = new mongodb.MongoClient();
    await client.connect(uri);
    return client;
  };

  async dropDatabase(): Promise<boolean> {
    return this.#conn.runCommand(this.getDatabaseName(), { dropDatabase: 1 });
  }

  getDBO(): mongodb.Database {
    return this.#conn.database(this.getDatabaseName());
  }

  getDatabaseName(): string {
    return new URL(this.#uri).pathname.substring(1);
  }

  async databaseExists(): Promise<boolean> {
    // List all the available databases
    const { databases } = await this.#conn.getCluster().protocol.commandSingle(
      'admin',
      {
        listDatabases: 1
      }
    );
    const index = databases.findIndex(
      (db: any) => db.name === this.getDatabaseName()
    );
    if (index !== -1) {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" exists`
      );
      return true;
    } else {
      DatabaseConnection.#logger.info(
        `database "${this.getDatabaseName()}" don't exists`
      );
      return false;
    }
  }

  async deleteAllIndexes() {
    const dbo = this.getDBO();
    const cursor = dbo.listCollections();
    cursor.toArray().then((collections: any) => {
      collections.forEach((col: any) => {
        this.#conn.runCommand(this.getDatabaseName(), { dropIndexes: col.name, index: '*' });
      });
    });
  }

  closeConnection() {
    this.#conn.close();
  }
}
