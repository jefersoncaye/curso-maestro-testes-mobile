#!/usr/bin/env bash
# Executado pelo android-emulator-runner (uma unica linha no campo "script").
# O runner ja espera o boot, desbloqueia a tela e desativa as animacoes.
# Aqui: confirmar que o adb responde, instalar o APK e rodar a suite.
set -euo pipefail

SERIAL="emulator-5554"
APK="ShopDemo.apk"

# O driver do Maestro demora mais para subir em runner de CI (padrao: 15s)
export MAESTRO_DRIVER_STARTUP_TIMEOUT=120000

echo "==> Dispositivos visiveis pelo adb:"
adb devices

echo "==> Confirmando boot do emulador..."
pronto=0
for i in $(seq 1 30); do
  if [ "$(adb -s "$SERIAL" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
    pronto=1
    break
  fi
  echo "Boot ainda nao concluiu (tentativa $i/30), aguardando 2s..."
  sleep 2
done
if [ "$pronto" -ne 1 ]; then
  echo "ERRO: emulador nao respondeu ao adb."
  exit 1
fi
echo "Emulador pronto."

if [ ! -f "$APK" ]; then
  echo "ERRO: $APK nao encontrado na raiz do repositorio."
  exit 1
fi

echo "==> Instalando o APK (ate 3 tentativas)..."
instalado=0
for tentativa in 1 2 3; do
  if adb -s "$SERIAL" install -r "$APK"; then
    instalado=1
    break
  fi
  echo "Tentativa $tentativa falhou, aguardando 5s..."
  sleep 5
done
if [ "$instalado" -ne 1 ]; then
  echo "ERRO: nao foi possivel instalar o APK."
  exit 1
fi

mkdir -p reports/debug

echo "==> Iniciando captura de logcat em segundo plano..."
adb -s "$SERIAL" logcat -c
adb -s "$SERIAL" logcat -v time > reports/debug/logcat.txt &
LOGCAT_PID=$!
trap 'kill "$LOGCAT_PID" 2>/dev/null || true' EXIT

echo "==> Rodando a suite Maestro..."
maestro test \
  --format junit \
  --output reports/resultado.xml \
  --debug-output reports/debug \
  --test-output-dir reports/debug \
  flows/s3-suite-shopdemo/
