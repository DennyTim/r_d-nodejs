# HW2 Common

### Common setup

1. Clone the repo and install the dependencies.

```shell
$ git clone https://github.com/DennyTim/r_d-nodejs.git
```

2. Install dependencies

```shell
$ npm i
```

### Steps for read-only access:

```shell 
$ npm run start
```

### Steps for read and write access (recommended):

```shell 
$ npm run dev
```

Open postmen http://localhost:3000 and use next ***routes***:

`GET`&nbsp;&nbsp;&nbsp;&nbsp; /users - get all users

`POST`&nbsp;&nbsp; /users - create a new user

`PUT`&nbsp;&nbsp;&nbsp;&nbsp; /users/:id - update an existing user

`DELETE`&nbsp;/users/:id - remove an existing user

#### *Strongly recommended to import postman collection from root directory

`./HWS.postman_collection.json`
