
---

# 🚀 SENAI Connect

O **SENAI Connect** é uma **plataforma educacional interativa**, desenvolvida como uma **rede social acadêmica**, que conecta **alunos, professores e comunidades de aprendizagem** em um único ambiente digital moderno, responsivo e funcional.

O projeto foi pensado para simular um **sistema real**, com foco em **experiência do usuário**, **interação social**, **organização educacional** e **escalabilidade**, funcionando tanto em **desktop quanto em dispositivos móveis**.

---

## 🎯 Objetivo do Projeto

Criar um ambiente digital onde usuários possam:

* Compartilhar conteúdos educacionais
* Interagir por meio de posts, comentários e curtidas
* Participar de grupos e comunidades
* Trocar mensagens privadas
* Acompanhar avisos, eventos e comunicados institucionais

Tudo isso com **funcionalidades reais**, persistência de dados e navegação completa, evitando telas vazias ou ações sem resposta.

---

## ✨ Funcionalidades Principais

* 🔐 **Autenticação completa**

  * Cadastro, login e logout
  * Perfis de aluno e professor

* 📰 **Feed interativo**

  * Criar, editar e remover posts
  * Curtir, comentar, salvar e compartilhar
  * Upload de imagens e arquivos

* 👤 **Perfil do usuário**

  * Visualização e edição de perfil
  * Lista de publicações, grupos e conteúdos salvos

* 💬 **Mensagens privadas**

  * Conversas individuais
  * Envio e recebimento de mensagens

* 👥 **Grupos e comunidades**

  * Criar, entrar e participar de grupos
  * Feed exclusivo por grupo

* 📢 **Avisos e eventos**

  * Comunicados institucionais
  * Agenda de eventos e atividades

* 🏆 **Gamificação e reconhecimento**

  * Sistema de XP por contribuição (posts, comentários, projetos, validações)
  * Níveis com curva de progressão e selo de nível visível em posts e perfis
  * Medalhas automáticas por conquistas (Pioneiro, Comunicador, Influente...)
  * Ranking da comunidade com pódio e posições
  * Notificações e toasts em tempo real (XP, nível, medalhas)

* 🎓 **Perfil-portfólio com skills validadas**

  * Habilidades técnicas com nível de proficiência
  * Validação social de skills — com peso especial para professores ("Validada por professor")
  * Portfólio de projetos com descrição, tags e links

* ♿ **Acessibilidade total (WCAG)**

  * Menu flutuante de acessibilidade em todas as telas
  * Alto contraste, aumento de fonte (2 níveis) e fonte amigável para dislexia
  * Redução de animações e modo simplificado (menos distrações)
  * Leitura da página em voz alta (Web Speech API)
  * Navegação por teclado com foco visível, skip-link e ARIA labels
  * Preferências salvas por usuário (sincronizadas com o servidor)

* 📱 **Interface responsiva**

  * Layout adaptado para mobile e desktop
  * Navegação intuitiva com sidebar e bottom bar

---

## 🧱 Arquitetura do Sistema

O projeto segue uma arquitetura moderna, com separação clara de responsabilidades:

* **Frontend**: Interface do usuário, navegação e interação
* **Backend**: API REST, regras de negócio e autenticação
* **Banco de Dados**: Persistência de usuários, posts, comentários, mensagens e grupos

Todos os elementos clicáveis executam ações reais, garantindo uma experiência completa e testável.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: React / Next.js
* **Backend**: Node.js + Express
* **Banco de Dados**: MySQL
* **Autenticação**: JWT
* **Tempo real**: Socket.io (mensagens, notificações e gamificação)
* **Estilização**: CSS Modules / Tailwind
* **Versionamento**: Git + GitHub

*(As tecnologias podem ser adaptadas conforme o ambiente do projeto)*

---

## 🧪 Estado do Projeto

📌 **Em desenvolvimento contínuo**, com base sólida e funcionalidades principais já implementadas.
O sistema está preparado para evolução, testes automatizados e deploy em ambiente de produção.

---
