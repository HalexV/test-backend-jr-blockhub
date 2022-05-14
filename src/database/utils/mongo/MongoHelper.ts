export default class MongoHelper {
  static map(document: any): any {
    const { _id, ...documentWithoutId } = document;
    Reflect.deleteProperty(documentWithoutId, '__v');
    return Object.assign({}, documentWithoutId, { id: _id });
  }
}
