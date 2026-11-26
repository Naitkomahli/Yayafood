const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

function requireSeller(req, res, next){
    const token = req.cookies?.yaya_token;
    if (!token){
        return sendError(res, 'Authentication required', 401);
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if(payload.role !== 'seller'){
            return sendError(res, 'Forbidden', 403);
        }
        req.user = payload;
        return next();
    } catch (err){
        return sendError(res, 'Authentication required', 401);
    }
}

module.exports = { requireSeller };