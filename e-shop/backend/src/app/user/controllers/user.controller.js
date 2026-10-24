const userService = require("../services/user.service.js");

exports.register = async(req, res) => {
    try {
        const {email, password} = req.body ?? {};
        const user = await userService.register(email, password);
        res.status(201).json( {email: user.email});
    }
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

exports.login = async(req, res) => {
    try {
        const {email, password} = req.body ?? {};
        const {accessToken, refreshToken} = await userService.login(email, password);
        res.status(200).json({accessToken, refreshToken});
    }
    catch (error) {
        res.status(401).json({message: error.message});
    }
}

exports.getMe = async(req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const user = userService.getMe(token);
        res.json({user});
    }
    catch (error) {
        res.status(401).json({message: 'Unauthorized'});
    }
}

exports.refresh = async(req, res) => {
    try {
        const token = req.body?.token;
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const {newAccessToken} = userService.refresh(token);
        res.json({newAccessToken});
    }
    catch (error) {
        res.status(401).json({message: 'Unauthorized'});
    }
}
