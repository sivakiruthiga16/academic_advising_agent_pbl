export default function (roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.user.role)) {
            return res.status(403).json({ msg: 'Access denied: Unauthorized role' });
        }
        next();
    };
}
