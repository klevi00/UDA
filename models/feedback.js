class Feedback {
    constructor(data = {}) {
        this.id = data.id || null;
        this.idAutista = data.id_autista || null;
        this.idPasseggero = data.id_passeggero || null;
        this.valutazione = data.valutazione || null;
        this.giudizio = data.giudizio || '';
        // Campi join (opzionali)
        this.autistaNome = data.autista_nome || null;
        this.autistaCognome = data.autista_cognome || null;
        this.passeggeroNome = data.passeggero_nome || null;
        this.passeggeroConome = data.passeggero_cognome || null;
    }

    toJSON() {
        return {
            id: this.id,
            idAutista: this.idAutista,
            idPasseggero: this.idPasseggero,
            valutazione: this.valutazione,
            giudizio: this.giudizio,
            autistaNome: this.autistaNome,
            autistaCognome: this.autistaCognome,
            passeggeroNome: this.passeggeroNome,
            passeggeroConome: this.passeggeroConome
        };
    }

    static fromDatabaseRow(row) {
        return new Feedback(row);
    }
}

module.exports = Feedback;
