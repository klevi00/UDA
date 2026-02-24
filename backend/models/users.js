class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || null;
        this.email = data.email || '';
        this.password = data.password || '';
        this.role = data.role || 0.00;
        this.department = data.department || '';
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            department: this.department
        };
    }

    static fromDatabaseRow(row) {
        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            department: row.department
        });
    }
}

module.exports = User