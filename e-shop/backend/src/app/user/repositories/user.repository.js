const {User, users} = require("../models/user")

const useDb = () => Boolean(process.env.MONGODB_URI)

exports.findByEmail = async (email) => {
    if (useDb()) return User.findOne({email}).lean()
    return users.find(u => u.email === email)
}

exports.create = async (email, hashedPassword) => {
    if (useDb()) return User.create({email, password: hashedPassword})
    const user = {email, password: hashedPassword}
    users.push(user)
    return user;
}
