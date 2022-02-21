# Projetos

- Nesta versão o controle das datas será simples, ou seja, projetos passados podem ser cadastrados e o campo ativo do projeto deverá ser atualizado manualmente.

## Cadastrar

- A validação dos dados de entrada é feita pelo schema do mongoose

- A data de início deve ser menor do que a data de fim

- [] Feito

## Atualizar

- O nome deve ser único
- A data de início deve ser menor do que a data de fim
- A data fim se for atualizada ou inserida após o cadastro deve ser maior do que a data de início 

- [] Feito

## Apagar

- Verificar o documento de relacionamento

- [] Feito

## Listar

### Listar um

- [] Feito

### Listar vários

- [] Feito

---

# Colaboradores

## Cadastrar

- A validação dos dados de entrada é feita pelo schema do mongoose

- [x] Feito

## Cadastrar em um projeto

- [] Feito

## Atualizar

- Qualquer um dos dados podem ser atualizados

- [x] Feito

## Apagar

- Verificar o documento de relacionamento 

- [] Feito

## Remover de um projeto

- [] Feito

## Listar

### Listar um

- [] Feito

### Listar vários

- [] Feito


---

# Colaboradores e Projetos

- Essas ações devem ser resultantes de operações nos documentos de Colaboradores e Projetos

## Cadastrar

- Talvez não seja necessário ter os campos Início e Fim

- [] Feito

## Atualizar

- Vai depender do que acontecer com os documentos relacionados

- [] Feito

## Apagar

- Somente se um projeto não tiver mais nenhum colaborador ou o projeto for apagado

- [] Feito

## Listar

### Listar um

- [] Feito

### Listar vários

- [] Feito

---

# Usuários

- Deve haver um primeiro usuário para cadastrar outros

## Cadastrar

- [] Feito

## Atualizar

- [] Feito

## Apagar

- [] Feito

## Listar

### Listar um

- [] Feito

### Listar vários

- [] Feito

---

# Geral

- [] O sistema só vai permitir acessar as rotas para usuários autenticados (a autenticação deverá ser feita utilizando JWT).

- [] Utilizar o Swagger/Openapi para gerar a documentação da API (o NestJS já disponibiliza, só se faz necessário configurar)

- [x] Versionamento do código utilizando GIT.

- [] Validar os dados de entrada na API ( não permitir informar dados errados nos cadastros)