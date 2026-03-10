class Passeggero {
    constructor(data = {}) {
        this.id = data.id || null;
        this.nome = data.nome || '';
        this.cognome = data.cognome || '';
        this.numeroSerieCartaIdentita = data.numero_serie_carta_identita || '';
        this.numeroTelefono = data.numero_telefono || '';
        this.email = data.email || '';
        this.role = data.role || 'Passeggero';
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            cognome: this.cognome,
            numeroSerieCartaIdentita: this.numeroSerieCartaIdentita,
            numeroTelefono: this.numeroTelefono,
            email: this.email,
            role: this.role
        };
    }

    static fromDatabaseRow(row) {
        return new Passeggero(row);
    }
}

module.exports = Passeggero;
