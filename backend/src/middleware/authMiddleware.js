import JWT from "jsonwebtoken";

const authMiddlware = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;

    if(!authHeader || !authHeader?.startsWith("Bearer")) {
        return res
            .status(401)
            .json({ status: "auth_failed", meassage: "Authentication failed"});
    }


const token = authHeader?.split(" ")[1];

try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET)
    req.body.user = {
        userId: userToken.userId
    };
    next();
}   catch(error) {
    console.log(error);
    return res
        .status(401)
        .json({ status: "auth_failed", meassage: "Authentication failed"});
    }
};

export default authMiddlware