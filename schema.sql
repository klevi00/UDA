-- Schema PostgreSQL per BlaBlaCar Urban
-- Eseguire con: psql -U postgres -d blablacar -f schema.sql

CREATE SCHEMA IF NOT EXISTS postgres;

-- ─────────────────────────────
-- AUTISTI
-- ─────────────────────────────
CREATE TABLE postgres.autisti (
    id                      SERIAL PRIMARY KEY,
    nome                    VARCHAR(15)  NOT NULL,
    cognome                 VARCHAR(15)  NOT NULL,
    data_nascita            DATE         NOT NULL,
    numero_patente          VARCHAR(12)  NOT NULL,
    scadenza_patente        DATE         NOT NULL,
    casa_automobilistica    VARCHAR(20)  NOT NULL,
    modello                 VARCHAR(20)  NOT NULL,
    targa                   VARCHAR(7)   NOT NULL UNIQUE,
    anno_immatricolazione   INT          NOT NULL,
    numero_telefono         VARCHAR(10)  NOT NULL,
    email                   VARCHAR(50)  NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,
    fotografia              VARCHAR(255) NOT NULL DEFAULT '',
    role                    VARCHAR(20)  NOT NULL DEFAULT 'Autista'
);

-- ─────────────────────────────
-- PASSEGGERI
-- ─────────────────────────────
CREATE TABLE postgres.passeggeri (
    id                           SERIAL PRIMARY KEY,
    nome                         VARCHAR(20)  NOT NULL,
    cognome                      VARCHAR(20)  NOT NULL,
    numero_serie_carta_identita  VARCHAR(9)   NOT NULL UNIQUE,
    numero_telefono              VARCHAR(10)  NOT NULL,
    email                        VARCHAR(50)  NOT NULL UNIQUE,
    password                     VARCHAR(255) NOT NULL,
    role                         VARCHAR(20)  NOT NULL DEFAULT 'Passeggero'
);

-- ─────────────────────────────
-- ADMINS
-- ─────────────────────────────
CREATE TABLE postgres.admins (
    id       SERIAL PRIMARY KEY,
    email    VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nome     VARCHAR(30),
    cognome  VARCHAR(30),
    role     VARCHAR(20)  NOT NULL DEFAULT 'Admin'
);

-- ─────────────────────────────
-- VIAGGI
-- ─────────────────────────────
CREATE TABLE postgres.viaggi (
    id                  SERIAL PRIMARY KEY,
    citta_partenza      INT          NOT NULL,
    citta_destinazione  INT          NOT NULL,
    data_ora_partenza   TIMESTAMP    NOT NULL,
    costo               FLOAT        NOT NULL,
    tempo               TIME         NOT NULL,
    id_autista          INT          NOT NULL REFERENCES postgres.autisti(id),
    pieno               BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ─────────────────────────────
-- PRENOTAZIONI
-- ─────────────────────────────
CREATE TABLE postgres.prenotazioni (
    id_passeggero       INT NOT NULL REFERENCES postgres.passeggeri(id),
    id_viaggio          INT NOT NULL REFERENCES postgres.viaggi(id),
    data_ora_prenotazione TIMESTAMP NOT NULL DEFAULT NOW(),
    stato               VARCHAR(20) NOT NULL DEFAULT 'inElaborazione'
                            CHECK (stato IN ('accettata', 'rifiutata', 'inElaborazione')),
    PRIMARY KEY (id_passeggero, id_viaggio)
);

-- ─────────────────────────────
-- FEEDBACK AUTISTA
-- ─────────────────────────────
CREATE TABLE postgres.feedback_autista (
    id            SERIAL PRIMARY KEY,
    id_autista    INT NOT NULL REFERENCES postgres.autisti(id),
    id_passeggero INT NOT NULL REFERENCES postgres.passeggeri(id),
    valutazione   INT NOT NULL CHECK (valutazione BETWEEN 1 AND 5),
    giudizio      VARCHAR(255) NOT NULL,
    UNIQUE (id_autista, id_passeggero)
);

-- ─────────────────────────────
-- FEEDBACK PASSEGGERO
-- ─────────────────────────────
CREATE TABLE postgres.feedback_passeggero (
    id            SERIAL PRIMARY KEY,
    id_autista    INT NOT NULL REFERENCES postgres.autisti(id),
    id_passeggero INT NOT NULL REFERENCES postgres.passeggeri(id),
    valutazione   INT NOT NULL CHECK (valutazione BETWEEN 1 AND 5),
    giudizio      VARCHAR(255) NOT NULL,
    UNIQUE (id_autista, id_passeggero)
);
