
const User = require('../models/user')
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = await jwt.verify(token, 'thisismynewcourse')
        const user = await User.findOne({ _id: decoded._id})
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user.username
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.',e})
    }
}

module.exports = auth