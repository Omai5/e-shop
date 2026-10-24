const {users} = require("../models/user")

exports.findByEmail = (email) => {
    return users.find(u => u.email === email)
}

exports.create = (email, hashedPassword) => {
    const user = {email, password: hashedPassword}
    users.push(user)
    return user;
}