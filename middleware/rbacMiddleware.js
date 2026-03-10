const Permissions = require("../models/permissions");
const ResponseClass = require("../response");

const permissionsInstance = new Permissions();

exports.checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const response = new ResponseClass();

        const userRole = req.authData?.role || 'anonymous';
        const userPermissions = permissionsInstance.getPermissionsByRoleName(userRole);

        if (userPermissions.includes(requiredPermission)) {
            return next();
        } else {
            response.code = 403;
            response.status = false;
            response.message = `Access denied: missing permission "${requiredPermission}" for role "${userRole}"`;
            return res.status(403).json(response);
        }
    };
};
