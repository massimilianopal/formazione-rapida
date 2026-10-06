# Formazione rapida

Userscript per Tampermonkey che aggiunge un controllo della velocità ai corsi su Syllabus.

**[Installa o aggiorna lo script](https://raw.githubusercontent.com/massimilianopal/formazione-rapida/main/syllabus-velocita.user.js)**

## Installazione su ogni postazione

1. Installa [Tampermonkey](https://www.tampermonkey.net/) nel browser.
2. In Chrome, apri la gestione delle estensioni, entra nei dettagli di Tampermonkey e abilita **Consenti script utente**, se disponibile. Verifica che Tampermonkey possa accedere ai siti del corso.
3. Apri il collegamento **Installa o aggiorna lo script** e conferma l'installazione in Tampermonkey.
4. Riapri o ricarica la finestra del corso.

Se il collegamento mostra soltanto il testo o scarica il file, apri la dashboard di Tampermonkey e usa **Utilità → Installa da URL**, incollando questo indirizzo:

```text
https://raw.githubusercontent.com/massimilianopal/formazione-rapida/main/syllabus-velocita.user.js
```

I nomi delle voci possono cambiare secondo lingua e versione dell'estensione.

### Passaggio dalla versione incollata manualmente

Apri il collegamento di installazione anche sulla postazione già configurata. Nome e namespace sono rimasti uguali: Tampermonkey dovrebbe proporre l'aggiornamento dello script esistente. Verifica che resti **una sola copia attiva** di “Syllabus - Velocita video” e che la versione sia **1.3.1**.

Il vecchio script incollato manualmente non aveva gli indirizzi di aggiornamento: questo primo passaggio va eseguito su ciascuna postazione.

## Uso

Il pannello compare in alto a destra.

| Player | Pannello | Comportamento |
| --- | --- | --- |
| HTML5 / VideoJS | Video x | Cambia la velocità dei video. |
| Vimeo incorporato da Syllabus | Video x | Mantiene la gestione Vimeo della versione precedente. |
| Articulate Storyline | Corso x | Imposta la velocità del motore del corso, che coordina filmati, audio e animazioni. |

Per Storyline il valore iniziale è **10×**. Per gli altri video viene conservata la preferenza precedente; sulle nuove installazioni il valore iniziale è **1,5×**. Il pannello accetta valori da 0,25 a 16; il comportamento alle velocità più alte dipende dal player e dal contenuto.

Le preferenze per Storyline e per gli altri video sono separate e rimangono locali al profilo del browser: non vengono sincronizzate tramite GitHub.

Lo script non risponde alle domande e non imposta gli stati di completamento del corso. Le interazioni restano manuali. La riproduzione Storyline a 10×, comprese le parti con quiz, è stata provata dall'utilizzatore su un corso; la compatibilità con ogni corso e versione del player non è garantita.

## Aggiornamenti sulle postazioni

Lo script contiene `@updateURL` e `@downloadURL` puntati a questo repository. Con gli aggiornamenti abilitati in Tampermonkey, le nuove versioni vengono rilevate secondo la frequenza configurata nell'estensione; non si tratta di una distribuzione istantanea.

Per anticipare l'aggiornamento, usa il controllo aggiornamenti di Tampermonkey oppure riapri il collegamento di installazione. Dopo l'aggiornamento, ricarica la finestra del corso.

Non serve un account GitHub sulle postazioni che installano lo script, perché questo repository è pubblico.

## Pubblicare una nuova versione

1. Modifica `syllabus-velocita.user.js` e prova il cambiamento.
2. Incrementa `@version`, per esempio da `1.3.1` a `1.3.2`.
3. Mantieni invariati `@name`, `@namespace` e gli indirizzi di aggiornamento.
4. Pubblica il cambiamento sul ramo `main`.

Per distribuire una correzione che ripristina un comportamento precedente, usa comunque un numero di versione superiore a quello già distribuito.

## Versioni

- **1.3.1**: configurazione degli aggiornamenti GitHub; comportamento di riproduzione invariato rispetto alla 1.3.0.
- **1.3.0**: supporto Storyline tramite il motore del corso, preferenza separata e pannello in alto a destra.

## Riferimenti

- [Documentazione Tampermonkey sugli aggiornamenti](https://www.tampermonkey.net/documentation.php?q=update_url)
- [Abilitazione degli userscript in Chrome](https://www.tampermonkey.net/faq.php?q=Q209)
