class Approval {
    constructor(data = {}) {
        this.id = data.id || null;
        this.rda_request_id = data.rda_request_id || null;
        this.approver_id = data.approver_id || null;
        this.approval_level = data.approval_level || '';
        this.decision = data.decision || '';
        this.comment = data.comment || '';
        this.decided_at = data.decided_at || null; // ISO string o oggetto Date
    }

    // Serializza in JSON
    toJSON() {
        return {
            id: this.id,
            rda_request_id: this.rda_request_id,
            approver_id: this.approver_id,
            approval_level: this.approval_level,
            decision: this.decision,
            comment: this.comment,
            decided_at: this.decided_at
        };
    }

    // Crea un'istanza da una riga del database
    static fromDatabaseRow(row) {
        return new Approval({
            id: row.id,
            rda_request_id: row.rda_request_id,
            approver_id: row.approver_id,
            approval_level: row.approval_level,
            decision: row.decision,
            comment: row.comment,
            decided_at: row.decided_at
        });
    }
}
