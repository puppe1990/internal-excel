# Planilha HTML/CSS/JS

Aplicativo de planilha construído apenas com HTML, CSS e JavaScript puro, sem dependências externas. A interface permite criar novas planilhas, editar células, aplicar negrito, inserir fórmulas simples e importar/exportar dados em CSV.

## Recursos principais

- Cabeçalhos fixos com redimensionamento de colunas via arraste.
- Navegação por teclado (setas e `Enter`) e edição direta nas células.
- Suporte a fórmulas básicas (`+`, `-`, `*`, `/`, parênteses) usando referências no formato `A1`.
- Destaque e soma de intervalos selecionados com o mouse (com média na mesma janela).
- Importação e exportação de arquivos CSV.
- Atalho `Ctrl+B` para alternar negrito na célula ativa.

## Estrutura do projeto

```
index.html   # Marcações da página e ligação com os arquivos estáticos
style.css    # Estilos visuais da interface
script.js    # Lógica da planilha (edição, fórmulas, CSV, eventos)
```

## Como usar

1. Abra o arquivo `index.html` em um navegador moderno.
2. Utilize os botões da barra superior para criar nova planilha, adicionar/remover linhas e colunas e importar/exportar CSV.
3. Clique em qualquer célula para editar. Use as setas ou `Enter` para navegar.
4. Para fórmulas, digite `=` seguido da expressão (ex.: `=A1+B2*3`). Pressione **Recalcular fórmulas** caso algum valor pareça incorreto após mudanças.
5. Selecione um intervalo com o mouse e clique em **Somar seleção** para ver soma e média.

## Dicas adicionais

- Ao importar CSV, o grid é redimensionado automaticamente para acomodar os dados.
- O arquivo exportado é salvo como `planilha.csv` no diretório padrão de downloads do navegador.
- O código utiliza apenas recursos nativos; não é necessário servidor ou build.

## Próximos passos sugeridos

- Validar fórmulas em tempo real conforme o usuário digita para oferecer feedback instantâneo.
- Persistir a planilha no `localStorage` para continuar de onde parou.
- Adicionar testes automatizados para as funções de CSV e de avaliação de fórmulas.
