const rolesData = require('../config/roles.json');

class Permissions {
    constructor() {
        this.roles = rolesData.roles;
    }

    getPermissionsByRoleName(roleName) {
        const role = this.roles.find(
            r => r.name.toLowerCase() === roleName.toLowerCase()
        );
        return role ? role.permissions : [];
    }
}

module.exports = Permissions;
