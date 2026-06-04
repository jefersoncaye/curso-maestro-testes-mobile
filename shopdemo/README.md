# ShopDemo

Aplicativo mobile de demonstracao para o curso de testes automatizados com Maestro.
O ShopDemo simula uma loja virtual com fluxo completo de compras: login, catalogo, detalhe
de produto, carrinho, checkout e confirmacao de pedido.

## Tecnologias

- React Native com Expo SDK 56
- React Navigation 7 (native-stack)
- React Context para estado do carrinho
- Sem backend: todos os dados sao fixos em codigo

## Credenciais de teste

- E-mail: cliente@shopdemo.com
- Senha: 123456

## Rodar em desenvolvimento

Requisitos: Node.js 18+, Expo CLI, emulador Android ou dispositivo fisico.

```bash
npm install
npx expo start
```

Com o emulador Android aberto, pressione `a` no terminal para abrir o app.

## Instalar o APK no emulador

```bash
adb install shopdemo.apk
```

O app aparecera na lista de aplicativos do emulador com o nome ShopDemo.
O package do app e: com.curso.shopdemo

## Gerar o APK (build local)

Requisitos adicionais: Android SDK com NDK, Java 17.

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

O APK sera gerado em:
android/app/build/outputs/apk/release/app-release.apk

Renomeie o arquivo para shopdemo.apk antes de distribuir.

## Gerar o APK via EAS Build (alternativa sem Android SDK local)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

O APK sera disponibilizado para download no painel do Expo.

## Fluxo de telas

Login -> Catalogo -> Detalhe do produto -> Carrinho -> Checkout -> Confirmacao

## Nota sobre testIDs

Os atributos testID de todos os elementos sao um contrato do curso.
Nao renomeie, remova ou altere nenhum testID ou texto visivel listado na documentacao
do curso, pois os flows Maestro dependem deles para funcionar.
