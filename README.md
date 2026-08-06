# ClinAgenda — demonstração para portfólio

O **ClinAgenda** é um sistema interno de agendamentos para clínicas, desenvolvido com HTML, CSS e JavaScript puro.

Esta versão foi preparada para demonstração em portfólio e funciona sem backend. O login, a sessão e os agendamentos são armazenados no `localStorage` do navegador.

## Acesso de demonstração

- **E-mail:** `admin@clinagenda.com.br`
- **Senha:** `ClinAgenda@2026`

Na tela de login, o botão **Preencher acesso** insere automaticamente essas credenciais.

## Funcionalidades

- Login local com proteção da página administrativa;
- Sessão persistente no navegador;
- Cadastro e exclusão de agendamentos;
- Validação de conflito de horário para o mesmo médico;
- Busca por paciente, médico ou serviço;
- Filtros por data e status;
- Dados iniciais de demonstração;
- Restauração dos dados de exemplo;
- Layout responsivo;
- Persistência no `localStorage`.

## Como executar

Por ser um projeto estático, pode ser publicado diretamente no GitHub Pages, Netlify, Vercel ou qualquer servidor de arquivos HTML.

Para testar localmente, abra a pasta em um servidor local. Exemplos:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Também é possível usar a extensão **Live Server** do VS Code.

## Observação importante

A autenticação desta versão é apenas demonstrativa. Como tudo funciona no navegador, ela não deve ser usada para armazenar dados médicos reais ou informações sensíveis. Em uma versão de produção, o ideal é utilizar autenticação e banco de dados em servidor, com regras de segurança e controle de acesso.
