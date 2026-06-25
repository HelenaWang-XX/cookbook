const cloud = require('@cloudbase/node-sdk');
const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();
const COLL = 'cookbook_data';
const DOC = 'main_data';

exports.main = async function(event) {
  if (event.action === 'get') {
    var res = await db.collection(COLL).doc(DOC).get();
    return { code: 0, data: res.data };
  }
  if (event.action === 'set') {
    if (!event.data) return { code: -1, message: 'no data' };
    var exists = await db.collection(COLL).doc(DOC).get();
    if (exists.data && exists.data.length) {
      delete event.data._id;
      await db.collection(COLL).doc(DOC).update(event.data);
    } else {
      event.data._id = DOC;
      await db.collection(COLL).doc(DOC).set(event.data);
    }
    return { code: 0, message: 'ok' };
  }
  return { code: -1, message: 'unknown action' };
};
