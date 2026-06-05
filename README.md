# Curso Maestro — Testes Mobile

Repositório do app **ShopDemo** utilizado no curso de testes mobile com Maestro.

## Download do APK

[**ShopDemo.apk**](https://github.com/jefersoncaye/curso-maestro-testes-mobile/raw/refs/heads/master/ShopDemo.apk) — Android 7.0+ · arm64 · ~44 MB

> Para instalar: transfira o arquivo para o celular e abra. Pode ser necessário habilitar **"Instalar de fontes desconhecidas"** nas configurações de segurança do Android.

---

## Projeto

O código-fonte do app está em [`/shopdemo`](./shopdemo).

```
shopdemo/
├── App.tsx              # Entry point + navegação
├── src/
│   ├── screens/         # Login, Catalogo, Detalhe, Carrinho, Checkout, Confirmacao
│   ├── context/         # CartContext (estado global do carrinho)
│   ├── components/      # ProdutoCard, BotaoPrimario
│   └── data/            # produtos.ts (14 produtos estáticos)
```

### Rodar localmente

```bash
cd shopdemo
npm install
npx expo start --android
```

Requer emulador Android rodando ou dispositivo conectado via ADB.

### Gerar novo APK

```bash
cd shopdemo/android
./gradlew assembleRelease
# APK em: android/app/build/outputs/apk/release/app-release.apk
```
