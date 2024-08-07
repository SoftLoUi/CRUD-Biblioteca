// CONEXION
const express = require("express");
const mysql = require("mysql2");
const app = express();

let conexion = mysql.createConnection({
    host: "localhost",
    database: "Libreria",
    user: "root",
    password: "1234567890"
});

conexion.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("Conexión exitosa");
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", function(req, res) {
    res.render("registro");
});

// FORMULARIO REGISTRO
app.post("/validar", function(req, res) {
    const datos = req.body;
    let nombre = datos.nombre;
    let apellido = datos.apellido;
    let fechaNac = datos.fechaNac;
    let titulo = datos.titulo;
    let fechaP = datos.fechaP;
    let precio = datos.Precio;

    // Validación
    if (!nombre || !apellido || !fechaNac || !titulo || !fechaP || !precio) {
        return res.status(400).send("Todos los campos son obligatorios");
    }
    if (isNaN(precio) || parseFloat(precio) <= 0) {
        return res.status(400).send({ error: "El precio debe ser un número positivo" });
    }
    if (new Date(fechaNac) > new Date()) {
        return res.status(400).send({ error: "La fecha de nacimiento no puede ser futura" });
    }
    if (new Date(fechaP) > new Date()) {
        return res.status(400).send({ error: "La fecha de publicación no puede ser futura" });
    }

    conexion.beginTransaction(function(err) {
        if (err) {
            return res.status(500).send({ error: "Error al iniciar la transacción" });
        }
        let insertarAutor = 'INSERT INTO autores (Nombre, Apellido, Fecha_Nacimiento) VALUES (?, ?, ?)';
        conexion.query(insertarAutor, [nombre, apellido, fechaNac], function(error, resultadoAutor) {
            if (error) {
                return conexion.rollback(function() {
                    res.status(500).send({ error: "Error al insertar autor" });
                });
            }
            let idAutor = resultadoAutor.insertId;
            let insertarLibro = 'INSERT INTO Libros (titulo, Fecha_Publicacion, Precio, id_Autores) VALUES (?, ?, ?, ?)';
            conexion.query(insertarLibro, [titulo, fechaP, precio, idAutor], function(error) {
                if (error) {
                    return conexion.rollback(function() {
                        res.status(500).send("Error al insertar libro");
                    });
                }
                conexion.commit(function(err) {
                    if (err) {
                        return conexion.rollback(function() {
                            res.status(500).send({ error: "Error al confirmar la transacción" });
                        });
                    }
                    res.send({ message: "Completado" });
                });
            });
        });
    });
});


// ACTUALIZAR AUTOR
app.post("/actualizarAutor", function(req, res) {
    const datos = req.body;
    let idAutor = datos.idAutor;
    let nombre = datos.nombreActualizar;
    let apellido = datos.apellidoActualizar;
    let fechaNac = datos.fechaNacActualizar;
    // Validación
    if (!idAutor || !nombre || !apellido || !fechaNac) {
        return res.status(400).send("Todos los campos son obligatorios");
    }
    if (new Date(fechaNac) > new Date()) {
        return res.status(400).send("La fecha de nacimiento no puede ser futura");
    }
    let actualizarAutor = 'UPDATE Autores SET Nombre = ?, Apellido = ?, Fecha_Nacimiento = ? WHERE id_Autores = ?';
    conexion.query(actualizarAutor, [nombre, apellido, fechaNac, idAutor], function(error, resultado) {
        if (error) {
            console.error("Error al actualizar autor:", error);
            return res.status(500).send("Error al actualizar autor:" );
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send( "Autor no encontrado" );
        }
        res.send("Autor actualizado con éxito" );
    });
});

// OBTENER LIBRO
app.get('/obtenerLibro/:id', (req, res) => {
    const idLibro = req.params.id;
    const consulta = 'SELECT * FROM Libros WHERE id_Libro = ?';
    conexion.query(consulta, [idLibro], (error, resultado) => {
        if (error) {
            console.error('Error al obtener libro:', error);
            return res.status(500).json({ error: 'Error al obtener libro', detalles: error.message });
        }
        if (resultado.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        res.json(resultado[0]);
    });
});

// ACTUALIZAR LIBRO
app.post('/actualizarLibro', (req, res) => {
    const datos = req.body;
    let idLibro = datos.idLibro;
    let titulo = datos.tituloActualizar;
    let fechaP = datos.fechaPActualizar;
    let precio = datos.precioActualizar;
    // Validación
    if (!idLibro || !titulo || !fechaP || !precio) {
        return res.status(400).send('Todos los campos son obligatorios');
    }
    if (isNaN(precio) || parseFloat(precio) <= 0) {
        return res.status(400).send('El precio debe ser un número positivo');
    }
    if (new Date(fechaP) > new Date()) {
        return res.status(400).send('La fecha de publicación no puede ser futura');
    }
    let actualizarLibro = 'UPDATE Libros SET titulo = ?, Fecha_Publicacion = ?, Precio = ? WHERE id_Libro = ?';
    conexion.query(actualizarLibro, [titulo, fechaP, precio, idLibro], (error, resultado) => {
        if (error) {
            console.error('Error al actualizar libro:', error);
            return res.status(500).json({ error: 'Error al actualizar libro', detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        res.json({ mensaje: 'Libro actualizado con éxito' });
    });
});

// ELIMINAR AUTOR
app.post("/eliminarAutor", function(req, res) {
    const idAutor = req.body.idAutorEliminar;
    // Validación
    if (!idAutor || isNaN(idAutor)) {
       alert("ID de autor inválido");
    }
    // Eliminamos dependencias
    let eliminarLibros = 'DELETE FROM Libros WHERE id_Autores = ?';
    conexion.query(eliminarLibros, [idAutor], function(error) {
        if (error) {
            
            alert( "Error al eliminar libros del autor");
        }
        // Eliminar autor 
        let eliminarAutor = 'DELETE FROM Autores WHERE id_Autores = ?';
        conexion.query(eliminarAutor, [idAutor], function(error, resultado) {
            if (error) {
                console.error("Error al eliminar autor:", error);
                return res.status(500).json({ error: "Error al eliminar autor", detalles: error.message });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: "Autor no encontrado" });
            }
            res.json("Autor eliminado con éxito");
        });
    });
});

// ELIMINAR LIBRP
app.post("/eliminarLibro", function(req, res) {
    const idLibro = req.body.idLibroEliminar;
    // Validación
    if (!idLibro || isNaN(idLibro)) {
        return res.status(400).send("ID de libro inválido");
    }
    let eliminarLibro = 'DELETE FROM Libros WHERE id_Libro = ?';
    conexion.query(eliminarLibro, [idLibro], function(error, resultado) {
        if (error) {
            console.error("Error al eliminar libro:", error);
            return res.status(500).json({ error: "Error al eliminar libro", detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Libro no encontrado" });
        }
        res.json({ mensaje: "Libro eliminado con éxito" });
    });
});

// BUSCAR AUTOR
app.get("/buscarAutor", function(req, res) {
    const nombre = req.query.nombre;
    if (!nombre) {
        return res.status(400).send("El nombre es obligatorio");
    }
    let buscarAutor = 'SELECT * FROM Autores WHERE Nombre LIKE ? OR Apellido LIKE ?';
    conexion.query(buscarAutor, [`%${nombre}%`, `%${nombre}%`], function(error, resultados) {
        if (error) {
            console.error("Error al buscar autor:", error);
            return res.status(500).json({ error: "Error al buscar autor", detalles: error.message });
        }
        res.json(resultados);
    });
});

// BUSCAR LIBRO
app.get("/buscarLibro", function(req, res) {
    const titulo = req.query.titulo;
    if (!titulo) {
        return res.status(400).send("El título es obligatorio");
    }
    let buscarLibro = 'SELECT * FROM Libros WHERE titulo LIKE ?';
    conexion.query(buscarLibro, [`%${titulo}%`], function(error, resultados) {
        if (error) {
            console.error("Error al buscar libro:", error);
            return res.status(500).json({ error: "Error al buscar libro", detalles: error.message });
        }
        res.json(resultados);
    });
});

// OBTENER AUTORES
app.get("/autores", function(req, res) {
    let obtenerAutores = 'SELECT * FROM Autores';
    conexion.query(obtenerAutores, function(error, resultados) {
        if (error) {
            console.error("Error al obtener autores:", error);
            return res.status(500).json({ error: "Error al obtener autores", detalles: error.message });
        }
        res.json(resultados);
    });
});

// OBTENER LOS LIBROS
app.get("/libros", function(req, res) {
    let obtenerLibros = 'SELECT * FROM Libros';
    conexion.query(obtenerLibros, function(error, resultados) {
        if (error) {
            console.error("Error al obtener libros:", error);
            return res.status(500).json({ error: "Error al obtener libros", detalles: error.message });
        }
        res.json(resultados);
    });
});

// ACTUALIZAR LIBRO
function obtenerDatosLibro() {
            const idLibro = document.getElementById('idLibro').value;
            if (!idLibro) {
                alert('Por favor ingrese un ID de Libro.');
                return;
            }
            fetch(`/obtenerLibro/${idLibro}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Libro no encontrado');
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById('tituloActualizar').value = data.titulo;
                    document.getElementById('fechaPActualizar').value = new Date(data.Fecha_Publicacion).toISOString().split('T')[0];
                    document.getElementById('precioActualizar').value = data.Precio;
                })
                .catch(error => {
                    console.error('Error al obtener los datos del libro:', error);
                    alert('Error al obtener los datos del libro: ' + error.message);
                });
        }

// ACTUALIZAR AUTOR
app.get('/obtenerAutor/:id', (req, res) => {
    const idAutor = req.params.id;
    const consulta = 'SELECT * FROM Autores WHERE id_Autores = ?';
    conexion.query(consulta, [idAutor], (error, resultado) => {
        if (error) {
            console.error('Error al obtener autor:', error);
            return res.status(500).json({ error: 'Error al obtener autor', detalles: error.message });
        }
        if (resultado.length === 0) {
            return res.status(404).json({ error: 'Autor no encontrado' });
        }
        res.json(resultado[0]);
    });
});
function obtenerDatosAutor() {
    const idAutor = document.getElementById('idAutor').value;
    if (!idAutor) {
        alert('Por favor ingrese un ID de Autor.');
        return;
    }
    fetch(`/obtenerAutor/${idAutor}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Autor no encontrado');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('nombreActualizar').value = data.Nombre;
            document.getElementById('apellidoActualizar').value = data.Apellido;
            document.getElementById('fechaNacActualizar').value = new Date(data.Fecha_Nacimiento).toISOString().split('T')[0];
        })
        .catch(error => {
            console.error('Error al obtener los datos del autor:', error);
            alert('Error al obtener los datos del autor: ' + error.message);
        });
}

// PUERTO
app.listen(3000, function() {
    console.log("Servidor en puerto 3000");
});