APP – Prefeitura de Aragoiânia

Aplicativo oficial da Prefeitura de Aragoiânia, desenvolvido em Expo + React Native, focado em atendimento ao cidadão, solicitações por área e integração futura com backend dedicado.

STACK DO PROJETO

Mobile (App):

Expo

React Native

JavaScript

styled-components

React Navigation

@react-navigation/native

@react-navigation/native-stack

@react-navigation/bottom-tabs

Padrões técnicos:

Projeto 100% em JavaScript

Não utilizar TypeScript

Não utilizar expo-router

Navegação baseada em Stack + Tabs

Theme centralizado (cores, espaçamentos e tipografia)

DESIGN SYSTEM (THEME)

Todo o visual do app é controlado por um ThemeProvider.

Local dos arquivos:
src/theme/colors.js
src/theme/index.js

Regra obrigatória:
Nunca usar cores diretamente nos componentes. Sempre utilizar as cores vindas do theme.
Exemplo:
({ theme }) => theme.colors.nomeDaCor

Isso permite alterar todas as cores do aplicativo facilmente para campanhas de marketing ou mudanças visuais.

IMAGENS

Todas as imagens do app ficam centralizadas em um único arquivo.

Local:
src/assets/images/index.js

Regras:

Nunca usar require() diretamente nas telas ou componentes

Sempre importar imagens pelo arquivo central de imagens

Isso permite trocar imagens do app inteiro alterando apenas um arquivo.

ARQUITETURA DE COMPONENTES

Todos os elementos reutilizáveis do app devem ser componentes.

Estrutura:
src/components/

AppHeader (topo)

PrimaryButton (botões principais)

ShortcutPill (atalhos horizontais)

ServiceCarouselCard (cards grandes em carrossel)

MapModal (popup de mapa)

Regras:

Header sempre reutilizável

Botões sempre reutilizáveis

Nada de layout duplicado em telas

NAVEGAÇÃO

Estrutura de navegação:

RootNavigator (Stack)

Login

AppTabs (Bottom Tabs)

HomeStack

Home

Areas

Solicitar

CepPreenchido

Agenda

Notificações

Busca

Regras importantes:

NavigationContainer existe apenas uma vez no App.js

Nunca criar NavigationContainer em outros arquivos

Menu rodapé (Tabs) é fixo nas páginas:
Página 2 (Home)
Página 3 (Áreas)
Página 4 (Solicitação)
Página 6 (CEP preenchido)

REGRA VISUAL PRINCIPAL

Tudo que estiver em vermelho no layout é clicável.
Essas áreas devem sempre:

Ser TouchableOpacity

Executar uma navegação ou ação

FLUXO DE TELAS

Página 1:
Login

Página 2:
Home

Dois carrosséis horizontais:

Carrossel de atalhos no topo (MINHA AGENDA / DÉBITOS / SERVIÇOS)

Carrossel de cards grandes (Serviços por Área)

Página 3:
Seleção de área de atendimento

Página 4:
Criação de solicitação

Botão “USAR LOCALIZAÇÃO ATUAL” abre popup (modal)

Campo CEP:

Ao digitar 8 dígitos, navega automaticamente para a Página 6

Página 5:
Popup de mapa

Não é uma página de navegação

É um Modal sobre a Página 4

Fecha com botão X

Página 6:
Endereço preenchido via CEP

Botão ENVIAR retorna para a Home (Página 2)

MODAL (MAPA)

Implementado com Modal do React Native

Não entra na pilha de navegação

Sempre abre sobre a Página 4

Fecha ao tocar no botão X

BACKEND

Este projeto contempla apenas o FRONTEND.
O backend será desenvolvido por outro desenvolvedor.
Todos os dados atuais são mockados.
Futura integração deve ficar centralizada em:
src/services/

COMO RODAR O PROJETO

Instalar dependências:
npm install

Rodar o Expo:
npx expo start

Abrir no emulador:

Android: pressionar “a”

iOS (Mac): pressionar “i”

ATENÇÕES IMPORTANTES

Não usar expo-router

Não usar TypeScript

Não criar múltiplos NavigationContainer

Sempre utilizar o Theme

Sempre criar componentes reutilizáveis

Manter o padrão visual fiel aos layouts

OBSERVAÇÃO FINAL

Este projeto segue padrão profissional, pensado para:

Manutenção simples

Mudança visual rápida

Integração futura com backend

Crescimento do aplicativo sem retrabalho