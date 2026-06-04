# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo version

**Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.**
This project uses Expo SDK 56 with React Native 0.85. APIs change between SDK versions — always verify against v56 docs.

## Commands

```bash
npx expo start          # start Metro bundler (press 'a' to open on Android emulator)
npx tsc --noEmit        # type-check (no unit test suite — integration testing is done via Maestro)
npx expo prebuild --platform android   # generate android/ folder for APK build
cd android && ./gradlew assembleRelease  # build APK → android/app/build/outputs/apk/release/
```

## Architecture

`App.tsx` is the entry point. It composes two providers and the navigator:

```
CartProvider (CartContext.tsx)
  NavigationContainer
    Stack.Navigator (headerShown: false on all screens)
      Login → Catalogo → Detalhe → Carrinho → Checkout → Confirmacao
```

`RootStackParamList` is exported from `App.tsx` and imported by every screen for typed navigation props (`NativeStackScreenProps<RootStackParamList, 'ScreenName'>`).

**Navigation params:**
- `Detalhe` receives the full `Produto` object (not just an id)
- `Confirmacao` receives `{ numeroPedido: string }` (6-digit string generated in Checkout)
- `Confirmacao → Catalogo` uses `navigation.reset` (not `navigate`) to clear the back stack

**Cart state** (`src/context/CartContext.tsx`) uses `useReducer`. The reducer is exhaustive — add a `never` check to the default branch when adding new action types. `totalPreco` is rounded via `parseFloat(...toFixed(2))` to avoid IEEE-754 drift.

**Data** (`src/data/produtos.ts`) is a static array of 14 products with stable numeric ids 1–14. `formatarPreco` handles Brazilian Real formatting deterministically (no `toLocaleString` — avoids locale differences between Android devices).

**Product placeholder images** are colored `View` components, not image files. Color is `CORES_PLACEHOLDER[produto.id % 5]`. This pattern appears in both `ProdutoCard` and `Detalhe`.

## testID contract

Every `testID` in this codebase is a **hard contract** for Maestro test flows used in the course. Do not rename, remove, or change the value of any `testID` or its associated visible text.

Every element with a `testID` must also carry `accessibilityLabel` with the identical value.

Dynamic testIDs follow the pattern `{prefix}-{produto.id}`:
- `produto-item-{id}`, `produto-nome-{id}`, `produto-preco-{id}` (ProdutoCard)
- `carrinho-item-{id}`, `btn-incrementar-{id}`, `btn-decrementar-{id}`, `btn-remover-{id}` (Carrinho)

`badge-carrinho` must always be rendered (never conditionally hidden), even when `totalItens === 0`.

## Android package

`android.package` is `com.curso.shopdemo` — this value is a course-wide contract and must never change.
