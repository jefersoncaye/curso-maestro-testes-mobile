import React, { createContext, useContext, useReducer } from 'react';
import { Produto } from '../data/produtos';

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface CartContextValue {
  itens: CartItem[];
  totalItens: number;
  totalPreco: number;
  adicionarItem: (produto: Produto) => void;
  removerItem: (id: number) => void;
  incrementar: (id: number) => void;
  decrementar: (id: number) => void;
  limparCarrinho: () => void;
}

type Action =
  | { type: 'ADICIONAR'; produto: Produto }
  | { type: 'REMOVER'; id: number }
  | { type: 'INCREMENTAR'; id: number }
  | { type: 'DECREMENTAR'; id: number }
  | { type: 'LIMPAR' };

function cartReducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADICIONAR': {
      const existe = state.find(i => i.produto.id === action.produto.id);
      if (existe) {
        return state.map(i =>
          i.produto.id === action.produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...state, { produto: action.produto, quantidade: 1 }];
    }
    case 'REMOVER':
      return state.filter(i => i.produto.id !== action.id);
    case 'INCREMENTAR':
      return state.map(i =>
        i.produto.id === action.id ? { ...i, quantidade: i.quantidade + 1 } : i
      );
    case 'DECREMENTAR':
      return state
        .map(i =>
          i.produto.id === action.id ? { ...i, quantidade: i.quantidade - 1 } : i
        )
        .filter(i => i.quantidade > 0);
    case 'LIMPAR':
      return [];
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, dispatch] = useReducer(cartReducer, []);

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalPreco = parseFloat(
    itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        totalItens,
        totalPreco,
        adicionarItem: (produto) => dispatch({ type: 'ADICIONAR', produto }),
        removerItem: (id) => dispatch({ type: 'REMOVER', id }),
        incrementar: (id) => dispatch({ type: 'INCREMENTAR', id }),
        decrementar: (id) => dispatch({ type: 'DECREMENTAR', id }),
        limparCarrinho: () => dispatch({ type: 'LIMPAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
