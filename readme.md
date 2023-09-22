# CATOLICA CONNECT BACKEND

API responsável por se conectar ao banco do app Católica Connect.

Essa aplicação está utilizando

- Prisma como ORM
- Zod para validar tipos nos endpoints
- PostgreSQL

## Executando localmente

1. Para manter o versionamento dos pacotes, estamos usando pnmpm, para instalar:
   ´npm i -g pnpm´
2. Para instalar as dependências necessárias
   ´pnpm install´

## Documentação

### /users

#### GET

Parâmetros: -

Retorna a lista de usuários

#### POST

Parâmetros (Body)

- name: STRING
- email: STRING (devem terminar com @catolicasc.edu.br)
- tag: STRING (4-18) caracteres
- curso: STRING
- periodo: INT (1-10) caracteres
- description: STRING (0-60) caracteres - opcional

Exemplo de request
´https://catolicaconnect-api.onrender.com/users´

´{
"name": "Teste teste",
"email": "teste@catolicasc.edu.br",
"tag": "testedev",
"curso": "Eng. da Miguelagem",
"periodo": 1
}´

#### DELETE

Parâmetros (Body)

- id: STRING

### /posts

#### GET

#### POST

Parâmetros (Body)

- content: STRING (1-120) caracteres
- authorId: STRING

Exemplo: `{
  "content": "aaa",
  "authorId": "clmv3ggt90000h91x4p4tr1ld"
}`

### /groups

#### GET

#### POST

Parâmetros (Body)

-name: STRING (2-120) caracteres
-description: STRING - opcional

#### DELETE

/groups/id
Parâmetros (Body)

-id: STRING - deve ser o id de um grupo
