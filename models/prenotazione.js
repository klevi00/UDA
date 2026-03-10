class Prenotazione {
    constructor(data = {}) {
        this.idPasseggero = data.id_passeggero || null;
        this.idViaggio = data.id_viaggio || null;
        this.dataOraPrenotazione = data.data_ora_prenotazione || null;
        this.stato = data.stato || 'inElaborazione';
        // Campi join (opzionali)
        this.cittaPartenza = data.citta_partenza || null;
        this.cittaDestinazione = data.citta_destinazione || null;
        this.dataOraPartenza = data.data_ora_partenza || null;
        this.costo = data.costo || null;
        this.autistaNome = data.autista_nome || null;
        this.autistaCognome = data.autista_cognome || null;
    }

    toJSON() {
        return {
            idPasseggero: this.idPasseggero,
            idViaggio: this.idViaggio,
            dataOraPrenotazione: this.dataOraPrenotazione,
            stato: this.stato,
            cittaPartenza: this.cittaPartenza,
            cittaDestinazione: this.cittaDestinazione,
            dataOraPartenza: this.dataOraPartenza,
            costo: this.costo,
            autistaNome: this.autistaNome,
            autistaCognome: this.autistaCognome
        };
    }

    static fromDatabaseRow(row) {
        return new Prenotazione(row);
    }
}

module.exports = Prenotazione;
