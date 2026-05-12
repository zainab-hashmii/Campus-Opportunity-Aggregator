const mongoose = require('mongoose');

// Runs `fn(session)` inside a MongoDB transaction.
// Falls back to `fn(null)` if the server doesn't support transactions
// (e.g. Atlas M0 free tier or a standalone non-replica-set instance).
async function runInTransaction(fn) {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(() => fn(session));
    } catch (err) {
        if (isTransactionUnsupported(err)) {
            console.warn('[DB] Transactions not supported on this deployment; running operations without transaction.');
            await fn(null);
        } else {
            throw err;
        }
    } finally {
        await session.endSession();
    }
}

function isTransactionUnsupported(err) {
    const msg = err.message || '';
    return (
        err.code === 20 ||
        /Transaction numbers are only allowed/.test(msg) ||
        /does not support (multi-document )?transactions/i.test(msg) ||
        /not supported on this server/i.test(msg)
    );
}

module.exports = { runInTransaction };
