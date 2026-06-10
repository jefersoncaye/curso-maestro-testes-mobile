# Curso Maestro — Testes Mobile

Repositório do app **ShopDemo** utilizado no curso de testes mobile com Maestro.

## Curso na Udemy

[**Maestro: Testes Mobile do Zero ao Pipeline**](https://www.udemy.com/course/maestro-testes-mobile-do-zero-ao-pipeline/?referralCode=2E88CCA77E66DFD8ED4F)

Curso prático e 100% em português, voltado para QAs e devs que querem automatizar testes de apps Android sem precisar programar, usando flows declarativos em YAML com o Maestro.

O curso é construído em cima de um único app real, o ShopDemo, e cobre:

- Instalação e configuração do ambiente: Android Studio, emulador (AVD), Java, Maestro CLI e ADB no Windows.
- Fundamentos do Maestro: como ele enxerga o app, Maestro Studio, anatomia do YAML, seletores relacionais, assertivas, scroll, gestos e esperas.
- Construção da suite de testes do ShopDemo do zero: login com `clearState`, navegação no catálogo e detalhe do produto, carrinho e checkout, até o flow E2E completo (login até confirmação do pedido).
- Organização profissional dos testes: estrutura de pastas, subflows reutilizáveis com `runFlow`, variáveis de ambiente e depuração de flows que quebram.
- CI/CD: rodando a suite via Maestro CLI, versionamento com Git/GitHub e pipeline completo no GitHub Actions, com relatórios e artefatos de execução.
- IA acelerando tudo: uso do Maestro MCP com Claude Code para gerar e manter testes a partir de descrições em português.

Ao final, o aluno sai com uma suite de testes completa, organizada, rodando em CI e com fluxo de manutenção assistido por IA.

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
