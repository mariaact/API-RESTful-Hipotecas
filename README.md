# API-RESTful

Los clientes pueden hacer operaciones CRUD y recibir la información en JSON. Las operaciones y recursos disponibles están definidos en `OpenAPI.yaml`.

## Requisitos para su ejecución
Es necesario tener instaladas las herramientas de `Node.js`,  la base de datos `SQLite` y una shell para ejecutar el servidor.

## Preparación del entorno
### Instalación de Node.js
Descargue e instale la versión 18.20.5 LTS de Node.js del siguiente link: [https://nodejs.org/en/](https://nodejs.org/es/download)

Compruebe que lo ha instalado correctamente, en la shell escriba:
~~~
>node --version
~~~
Y debería haber obtenido una versión igual a la siguiente salida por consola:
~~~
v18.20.5
~~~

### Instalación de SQLite
Instale la interfaz gráfica `SQLiteStudio`. Se puede descargar del siguiente link: https://sqlitestudio.pl/.

### Creación y carga de datos en base de datos
Se siguen los siguientes pasos:
1. Abre SQLiteStudio.

2. En el menu de iconos pulsar en el icono en el que muestra el mensaje `Añadir una base de datos`.

3. Se establece un nuevo fichero database y para ello seleccione el fichero `Clientes.db` del repositorio.

4. Se tiene que asegurar que en la base de datos tenga dos tablas ya creadas llamadas `Clientes` y `Hipoteca`. 


### Instalación de dependencias
Antes de arrancar el servidor es necesario instalarse las dependencias que utiliza el proyecto. En una shell se debe ejecutar el siguiente comando en la ruta `/API-RESTful-Hipotecas` para que instale automáticamente las dependencias utilizadas:

~~~
>npm install
~~~

## Despliegue y ejecución

### Servidor Web
Para ejecutar el programa, abra una shell, y dentro de la raíz del proyecto (ruta: `/API-RESTful`), ejecute el siguiente comando:

~~~
>npm start
~~~

Según reciba peticiones HTTP del lado del cliente, aparecerán por el Postman los mensajes asociados a las respuestas que enviará el servidor.

Hay que destacar que para el correcto funcionamiento del cliente y el servidor, es necesario que el cliente introduzca correcta y exactamente los parámetros que se piden y utilizar solamente las rutas definidas en  `OpenAPI.yaml`.


