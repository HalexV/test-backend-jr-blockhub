export default class MongoHelper {
  static map(document: any): any {
    const { _id, ...documentWithoutId } = document;
    return Object.assign({}, documentWithoutId, { id: _id });
  }
}
