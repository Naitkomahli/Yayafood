function sendSuccess(res, data, message = 'Request successful', status = 200){
    return res.status(status).json({
        success: true,
        data,
        message,
    });
}

function sendError(res, message = 'Internal server error', status = 500, errors = undefined){
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(status).json(payload);
}

module.exports = { sendSuccess, sendError };