# CRUD-Biblioteca
### Descripción
Este proyecto es una aplicación web CRUD para gestionar una biblioteca.
Las herramientas utilizadas para su desarrollo son:
`Node.js` para el servidor
`Express` como framework
`EJS` para las vistas
`MySQL` como base de datos.

## Requisitos Previos
- Node.js 
- NPM 
- MySQL 

let conexion = mysql.createConnection({
    host: "localhost",
    database: "Libreria",
    user: "root",
    password: "1234567890"
});
     ``` 
    host: "localhost",
    database: "db_name",
    user: "user",
    password: "password"
    ```

## Funcionalidades
1. Insertar Libros y Autores a la base de datos
2. Búsqueda de Libros y Autores por nombre
3. Actualización de Libros y Autores
4. Eliminación de Libros y Autores
5. Vista de Libros y Autores
