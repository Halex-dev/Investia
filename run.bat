@echo off
echo Avvio degli ambienti di sviluppo frontend e backend...

rem Avvio del frontend in una nuova finestra
start cmd /k "cd /d frontend && echo Avvio frontend in modalità sviluppo... && npm run dev"

rem Attesa di 5 secondi per dare tempo al frontend di iniziare
timeout /t 5

rem Avvio del backend in una nuova finestra
start cmd /k "cd /d backend && echo Avvio backend in modalità sviluppo... && npm run dev"

echo Ambienti di sviluppo avviati. Chiudi questa finestra per terminare entrambi i processi.
pause