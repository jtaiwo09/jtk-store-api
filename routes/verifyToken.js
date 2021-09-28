const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=> {
    const authHeader = req.headers.token;
    if(authHeader){
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SEC, (err, user)=> {
            if(err) return res.status(403).json({error: 'Invalid token'});
            req.user = user;
            next();
        });
    } else {
        return res.status(403).json({error: 'Unauthorised...'});
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, ()=> {
        if(req.user.id === req.params.id || req.user.isAdmin ){
            next();
        } else {
            return res.status(403).json({error: 'Unauthorised'});
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, ()=> {
        if(req.user.isAdmin ){
            next();
        } else {
            return res.status(403).json({error: 'Unauthorised'});
        }
    })
}

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin }

