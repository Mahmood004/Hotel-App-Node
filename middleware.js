const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const { token } = req.query;
    console.log('inside middleware');
    jwt.verify(token, 'secret', function(err, decoded) {
        if (err) {
            return res.status(500).send(err);
        }
        req.user = decoded.user;
        next();
    })
}