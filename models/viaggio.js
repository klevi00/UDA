class Viaggio {
    constructor(data = {}) {
        this.id = data.id || null;
        this.cittaPartenza = data.citta_partenza || null;
        this.cittaDestinazione = data.citta_destinazione || null;
        this.dataOraPartenza = data.data_ora_partenza || null;
        this.costo = data.costo || 0.0;
        this.tempo = data.tempo || '';
        this.idAutista = data.id_autista || null;
        this.pieno = data.pieno || false;
        // Campi join (opzionali)
        this.autistaNome = data.autista_nome || null;
        this.autistaCognome = data.autista_cognome || null;
        this.fotografia = data.fotografia || null;
        this.mediaValutazione = data.media_valutazione || null;
    }

    toJSON() {
        return {
            id: this.id,
            cittaPartenza: this.cittaPartenza,
            cittaDestinazione: this.cittaDestinazione,
            dataOraPartenza: this.dataOraPartenza,
            costo: this.costo,
            tempo: this.tempo,
            idAutista: this.idAutista,
            pieno: this.pieno,
            autistaNome: this.autistaNome,
            autistaCognome: this.autistaCognome,
            fotografia: this.fotografia,
            mediaValutazione: this.mediaValutazione
        };
    }

    static fromDatabaseRow(row) {
        return new Viaggio(row);
    }
}

module.exports = Viaggio;
