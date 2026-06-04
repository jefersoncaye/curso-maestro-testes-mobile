export interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
}

export function formatarPreco(preco: number): string {
  const [inteiro, decimal] = preco.toFixed(2).split('.');
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${inteiroFormatado},${decimal}`;
}

export const produtos: Produto[] = [
  {
    id: 1,
    nome: 'Smartphone Pro 128GB',
    preco: 1899.90,
    descricao: 'Smartphone com tela AMOLED de 6.5 polegadas e camera de 108MP. Bateria de 5000mAh com carregamento rapido.',
  },
  {
    id: 2,
    nome: 'Fone de Ouvido Bluetooth',
    preco: 159.90,
    descricao: 'Fone sem fio com cancelamento de ruido e autonomia de 30 horas. Conectividade Bluetooth 5.0.',
  },
  {
    id: 3,
    nome: 'Carregador Turbo 65W',
    preco: 89.90,
    descricao: 'Carregador compacto com saida USB-C de 65W. Compativel com notebooks, tablets e smartphones.',
  },
  {
    id: 4,
    nome: 'Capa para Smartphone',
    preco: 39.90,
    descricao: 'Capa protetora em silicone premium com bordas reforcadas. Disponivel em diversas cores.',
  },
  {
    id: 5,
    nome: 'Tablet 10 polegadas',
    preco: 1299.90,
    descricao: 'Tablet com processador octa-core e 4GB de RAM. Tela Full HD ideal para estudo e entretenimento.',
  },
  {
    id: 6,
    nome: 'Teclado Mecanico USB',
    preco: 349.90,
    descricao: 'Teclado mecanico com switches tacteis e iluminacao RGB por tecla. Layout ABNT2.',
  },
  {
    id: 7,
    nome: 'Mouse Sem Fio',
    preco: 119.90,
    descricao: 'Mouse ergonomico com receptor USB de 2.4GHz e autonomia de 18 meses com 1 pilha AA.',
  },
  {
    id: 8,
    nome: 'Monitor 24 Full HD',
    preco: 899.90,
    descricao: 'Monitor IPS de 24 polegadas com resolucao Full HD e tempo de resposta de 5ms. Entrada HDMI e VGA.',
  },
  {
    id: 9,
    nome: 'Webcam HD 1080p',
    preco: 229.90,
    descricao: 'Webcam com resolucao Full HD e microfone embutido com reducao de ruido. Plug and play via USB.',
  },
  {
    id: 10,
    nome: 'Hub USB-C 7 portas',
    preco: 179.90,
    descricao: 'Hub multiportas com 3x USB-A, 2x USB-C, leitor SD e HDMI 4K. Alimentacao pelo proprio cabo.',
  },
  {
    id: 11,
    nome: 'Luminaria de Mesa LED',
    preco: 79.90,
    descricao: 'Luminaria com 5 niveis de brilho e 3 temperaturas de cor. Porta USB para carregar dispositivos.',
  },
  {
    id: 12,
    nome: 'Suporte para Notebook',
    preco: 129.90,
    descricao: 'Suporte ajustavel em aluminio com 6 alturas. Melhora a ergonomia e o resfriamento do notebook.',
  },
  {
    id: 13,
    nome: 'Mochila para Notebook',
    preco: 189.90,
    descricao: 'Mochila com compartimento acolchoado para notebooks ate 15.6 polegadas e porta USB externa.',
  },
  {
    id: 14,
    nome: 'Pen Drive 64GB',
    preco: 49.90,
    descricao: 'Pen drive USB 3.0 com transferencia de ate 120MB/s. Design compacto com tampa protetora.',
  },
];
