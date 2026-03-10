class Autista {
    constructor(data = {}) {
        this.id = data.id || null;
        this.nome = data.nome || '';
        this.cognome = data.cognome || '';
        this.dataNascita = data.data_nascita || null;
        this.numeroPatente = data.numero_patente || '';
        this.scadenzaPatente = data.scadenza_patente || null;
        this.casaAutomobilistica = data.casa_automobilistica || '';
        this.modello = data.modello || '';
        this.targa = data.targa || '';
        this.annoImmatricolazione = data.anno_immatricolazione || null;
        this.numeroTelefono = data.numero_telefono || '';
        this.email = data.email || '';
        this.fotografia = data.fotografia || '';
        this.role = data.role || 'Autista';
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            cognome: this.cognome,
            dataNascita: this.dataNascita,
            numeroPatente: this.numeroPatente,
            scadenzaPatente: this.scadenzaPatente,
            casaAutomobilistica: this.casaAutomobilistica,
            modello: this.modello,
            targa: this.targa,
            annoImmatricolazione: this.annoImmatricolazione,
            numeroTelefono: this.numeroTelefono,
            email: this.email,
            fotografia: this.fotografia,
            role: this.role
        };
    }

    static fromDatabaseRow(row) {
        return new Autista(row);
    }
}

module.exports = Autista;
