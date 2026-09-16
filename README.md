<div align="center">

  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bras%C3%A3o_da_Universidade_Federal_do_Maranh%C3%A3o.svg/300px-Bras%C3%A3o_da_Universidade_Federal_do_Maranh%C3%A3o.svg.png" width="130" alt="Brasão da UFMA">

  # 🎓 ECP-01 • Materiais Acadêmicos
  ### Engenharia de Computação — Universidade Federal do Maranhão (UFMA)

  [![Deploy GitHub Pages](https://github.com/Lucas2Araujo/ECP-01/actions/workflows/deploy.yml/badge.svg)](https://github.com/Lucas2Araujo/ECP-01/actions/workflows/deploy.yml)
  [![Acessar Catálogo Web](https://img.shields.io/badge/Acessar-Cat%C3%A1logo%20Web-2563eb?style=flat&logo=googlechrome&logoColor=white)](https://lucas2araujo.github.io/ECP-01/)
  [![Total de Materiais](https://img.shields.io/badge/Materiais-80%2B-10b981?style=flat&logo=googledrive&logoColor=white)](https://lucas2araujo.github.io/ECP-01/)
  [![UFMA](https://img.shields.io/badge/UFMA-Engenharia%20de%20Computa%C3%A7%C3%A3o-dc2626?style=flat)](https://portais.ufma.br/)

  <p align="center">
    <b>Repositório de apoio acadêmico para centralização, organização e download rápido de livros, slides de aulas, listas de atividades e modelos de prova da graduação em Engenharia de Computação da UFMA.</b>
  </p>

  <p align="center">
    <a href="https://lucas2araujo.github.io/ECP-01/"><b>🌐 Acessar Aplicação Web do Acervo</b></a>
  </p>

</div>

---

## 🧭 Sobre o Repositório

Este repositório foi construído para acompanhar minha jornada acadêmica na UFMA e compartilhar materiais de estudo com a turma e futuros estudantes de Engenharia de Computação.

Além do repositório no GitHub, o acervo conta com uma **aplicação web moderna (GitHub Pages)** que sincroniza automaticamente a cada atualização:
- 🔍 **Busca em tempo real** por nome do arquivo, disciplina ou tipo de material (atalho `/`).
- 🏷️ **Filtros rápidos** por disciplina e por tipo de material (`Livros`, `Slides`, `Atividades`, `Artigos`).
- 👁️ **Pré-visualização integrada (Modal / Drawer)** de PDFs e imagens direto no navegador antes do download.
- ⌨️ **Navegação rápida por teclado** (`←` e `→` no preview, `Esc` para fechar).
- 🔗 **Deep Linking**: URLs compartilháveis com filtros pré-selecionados (ex: `?disciplina=...`).
- 🌓 **Suporte a Modo Escuro / Claro / Automático**.

---

## 📚 Disciplinas Catalogadas

| Disciplina | Professor | Tipos de Material Disponíveis |
| :--- | :--- | :--- |
| **Análise de Sistemas Lineares** | Prof. Pedro | 📖 Livros, 📽️ Slides |
| **Instrumentação** | Prof. Madson | 📽️ Slides / Módulos |
| **Linguagens Formais e Autômatos** | Prof. Bruno | 📖 Livros, 📽️ Slides, 📝 Atividades |
| **Matemática Discreta** | Prof. Bruno | 📖 Livros, 📽️ Slides, 📝 Atividades e Modelos de Prova |
| **Métodos Formais** | Prof. Bruno | 📖 Livros, 📽️ Slides, 📝 Atividades, 📄 Artigos |
| **Projeto e Desenvolvimento de Sistemas (PDS)** | Prof. Davi | 📖 Livros, 📽️ Slides & UML, 📝 Atividades |
| **Química Orgânica** | Profa. Jemmla | 📽️ Slides, 📝 Listas de Exercícios |

---

## 🗂️ Estrutura e Padrão de Pastas

Para manter o acervo limpo e a indexação automática consistente, os arquivos seguem rigorosamente a seguinte convenção:

```text
ECP-01/
├── Nome da Disciplina (Nome do Professor)/
│   ├── Livros/              # E-books, manuais e bibliografias recomendadas (.pdf, .mobi)
│   ├── Slides/              # Slides de aulas, apresentações e módulos (.pdf)
│   ├── Atividades/          # Listas de exercícios, modelos de prova e trabalhos (.pdf)
│   └── Artigos Para Ler/    # Papers e leituras complementares (quando aplicável)
│
├── data/
│   └── index.json           # Catálogo gerado automaticamente consumido pelo frontend
├── scripts/
│   └── generate_index.py    # Script Python que varre o repo e gera data/index.json
├── index.html               # Frontend do catálogo interativo
├── style.css                # Estilização com design system e tema escuro/claro
└── app.js                   # Lógica da aplicação web vanilla JS
```

---

## 🤝 Como Contribuir

Contribuições de colegas e outros estudantes da UFMA são muito bem-vindas! Seja enviando slides que faltam, novos livros ou listas resolvidas.

### Passo a Passo para Enviar Materiais:

1. **Faça um Fork** do repositório:
   Clique no botão **Fork** no canto superior direito da página do GitHub.

2. **Clone seu Fork localmente**:
   ```bash
   git clone https://github.com/SEU_USUARIO/ECP-01.git
   cd ECP-01
   ```

3. **Crie uma branch para as suas alterações**:
   ```bash
   git checkout -b adicionar-material-disciplina
   ```

4. **Adicione os arquivos na pasta correta**:
   - Respeite a convenção de pastas: `Nome da Disciplina (Professor)/[Livros|Slides|Atividades]/`.
   - Dê nomes claros aos arquivos (evite nomes genéricos como `documento(1).pdf`).
   - Mantenha os arquivos preferencialmente abaixo de 50MB (o limite por arquivo do GitHub é 100MB).

5. **(Opcional) Teste o script de indexação localmente**:
   ```bash
   python3 scripts/generate_index.py
   ```
   > 💡 *Nota: Mesmo se você não rodar o script localmente, o GitHub Actions roda ele automaticamente a cada deploy!*

6. **Faça o Commit e Push**:
   ```bash
   git add .
   git commit -m "feat: adiciona slides da aula X de NomeDaDisciplina"
   git push origin adicionar-material-disciplina
   ```

7. **Abra um Pull Request**:
   - Vá no seu repositório no GitHub e clique em **Contribute > Open pull request**.
   - Descreva brevemente quais materiais foram adicionados. Assim que aprovado, o deploy no site ocorrerá em poucos segundos.

---

## ⚡ Automação e Deploy

O deploy é 100% automatizado através do **GitHub Actions** (`.github/workflows/deploy.yml`):
- A cada `push` na branch `main`, o runner executa o script Python `scripts/generate_index.py`.
- O catálogo `data/index.json` é reconstruído com os novos links e metadados.
- O site é publicado automaticamente via **GitHub Pages**.

---

<div align="center">
  <sub>Mantido com dedicação por <a href="https://github.com/Lucas2Araujo">Lucas Araújo</a> • Engenharia de Computação • UFMA</sub>
</div>
