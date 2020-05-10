const oracledb = require('oracledb');
const dbConfig = require('../config');

const defaultThreadPoolSize = 4;
// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE = dbConfig.dbPool.poolMax + defaultThreadPoolSize;

async function runSQL(sql, binds) {
    return new Promise(async (resolve, reject) => {
        let conn, opts = {};
        opts.outFormat = oracledb.OBJECT;
        opts.autoCommit = true;

        try {
            conn = await oracledb.getConnection(dbConfig.dbPool);
            const result = await conn.execute(sql, binds, opts);
            resolve(result);
        } catch (err) {
            console.log('oracle db connection error', err)
            reject(err);
        } finally {
            if (conn) {
                try { await conn.close; } catch (err) {
                    console.log(err);
                }
            }
        }
    });
}

module.exports.runSQL = runSQL;