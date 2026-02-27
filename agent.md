 # PROYECTO: Klarinet, applicacion que sirve para reproducir musica y videos de YouTube.

 ## Descripcion del proyecto: 
 El proyecto es un reproductor proxy de Youtube, para ello se utilizan proyectos previamente existentes. como los de `yhimsical` y `musicbrainz` para obtener la informacion de las canciones. el eje principal del proyecto es que este no descarga la musica de youtube, sino que la reproduce en streaming, lo que hace que el proyecto sea mas ligero y rapido, en esta primera etapa permite generar un JSON que se guarda en localStorage con la informacion de las canciones, listas de reproduccion y artistas favoritos, para luego ser utilizado por parte del usuario y asi conservar su configuración.

## Tecnologias utilizadas:
Para este proyecto se usa NEXTjs como framework de desarrollo, para la parte de backend se utiliza Nodejs y para la parte de frontend se utiliza Reactjs, ademas se utilizan librerias como `react-player` para reproducir los videos de youtube, `axios` para hacer las peticiones a la API de musicbrainz y `localStorage` para guardar la informacion de las canciones, listas de reproduccion y artistas favoritos. para el frontend se utiliza `tailwindcss` para el diseño de la interfaz de usuario.

## Como se obtiene la informacion de las canciones:
- Para obtener la informacion del artista puedes usar la api de musicbrainz y adicionalmente la poco documentada api de `yhimsical`, esta ultima obtiene los datos de la siguiente forma:

> URl: https://api.yhimsical.com/getartist?artist=metallica

```json
{
    "status": "success",
    "artist": {
        "name": "Metallica",
        "mbid": "65f4f0c5-ef9e-490c-aee3-909e7ae6b2ab",
        "summary": "sumary",
        "bio": "bio",
        "image": "https://assets.fanart.tv/fanart/metallica-4fd83b012468a.jpg",
        "toptracks": [
            {
                "title": "Enter Sandman",
                "artist": "Metallica",
                "playcount": 18652765
            },
            {
                "title": "Nothing Else Matters",
                "artist": "Metallica",
                "playcount": 17049507
            }
        ]
    }
}
```
- Para obtener canciones cuando el usuario las busque, usa el siguiente endpoint:
> URL: https://api.yhimsical.com/searchyt?q=Enter%20Sandman%20-%20metallica
```json
{
    "status": "success",
    "result": [
        {
            "title": "Metallica: Enter Sandman (Official Music Video)",
            "url": "https://www.youtube.com/watch?v=CD-E-LDc384",
            "duration_text": "5:31",
            "duration": 331,
            "upload_date": "13 years ago",
            "release_date": 1361898176985,
            "thumbnail_src": "https://i.ytimg.com/vi/CD-E-LDc384/hqdefault.jpg",
            "views": 778709951,
            "ID": "CD-E-LDc384",
            "uploader": {
                "username": "Metallica",
                "url": "https://www.youtube.com/channel/UCbulh9WdLtEXiooRcYK7SWw",
                "verified": true
            }
        },
        {
            "title": "Enter Sandman (Remastered)",
            "url": "https://www.youtube.com/watch?v=XZuM4zFg-60",
            "duration_text": "5:32",
            "duration": 332,
            "upload_date": false,
            "release_date": false,
            "thumbnail_src": "https://i.ytimg.com/vi/XZuM4zFg-60/hqdefault.jpg",
            "views": 47583007,
            "ID": "XZuM4zFg-60",
            "uploader": {
                "username": "Metallica",
                "url": "https://www.youtube.com/channel/UCbulh9WdLtEXiooRcYK7SWw",
                "verified": true
            }
        }
    ]
}
```

como puedes obsevar al buscar mendiante `searchyt` te entrega un array de los resultados buscados. idealmente lo que puedes hacer es obviar los resultados de top tracks que te presenta la api de get artists y una ves encontrado el artista, buscar sus canciones mediante `searchyt` y asi obtener la informacion de las canciones del artista.


## Sobre la interfaz de usuario:
La interfaz de usuario es sencilla e intuitiva, se divide en tres partes principales: la barra lateral, la barra de busqueda y el reproductor. la barra lateral contiene las opciones de favoritos, listas de reproduccion y artistas, la barra de busqueda permite al usuario buscar canciones y artistas, y el reproductor permite al usuario reproducir las canciones seleccionadas. ademas se muestra la informacion de la cancion que se esta reproduciendo, como el titulo, el artista, la duracion y la imagen de la cancion. el diseño de la interfaz de usuario es responsivo, lo que permite que se adapte a diferentes tamaños de pantalla, ademas se utiliza `tailwindcss` para el diseño de la interfaz de usuario, lo que permite una mayor flexibilidad y personalizacion. el proyecto esta en constante desarrollo, por lo que se esperan nuevas funcionalidades y mejoras en la interfaz de usuario en el futuro.

IMPORTANTE. LA UI debe ser similar lo mas posible a Apple Music, para ello se pueden usar los siguientes colores:
- Fondo: #1e1e1e
- Texto: #ffffff
- Resaltado: #ff0000
- Secundario: #808080
- Botones: #ff0000
- Hover: #ff4d4d
- Activo: #ff0000
- Inactivo: #808080
- Barra lateral: #1e1e1e
- Barra de busqueda: #1e1e1e
- Reproductor: #1e1e1e 

Para los colores establece un archivo que sea facil de editar a futuro. en la carpeta raiz, se te dejo una imagen llamada `insp.png` que cuenta con la inspiracion para desarrollar la UI.



## CONJUNTO DE INSTRUCCIONES: 

### Instrucciones Generales:
- **EXEC**: el usuario te entregara un nombre de tarea, estas tareas se encuentran definidas como entornos en el apartado de la carpeta `./prompt` en dicha carpeta podras encontrar un detalle de la tarea en la que hay archivos .md tu orden es ejecutar la tarea antes mencionada. si la tarea no esta clara o no se entiende algun elemento de la misma, entonces rechaza la ejecutcion responde con un H1 diciendo "TAREA NO ENTENDIDA" y explica que elementos no se entienden. tras ejecutar la tarea, en el archivo `./prompt/seguimiento.csv` crea un registro con la tarea que acabas de ejecutar el registro debe ser sencillo, no un desglose de todo lo realizado, sino que un registro con el titulo del archivo, fecha de la ejecucion de la tarea, descripcion de 255 caracteres maximo con lo realizado, enlace al archivo .md del detalle de la tarea. 
IMPORTANTE: no modifiques el archivo `./prompt/seguimiento.csv` a menos que sea para agregar un registro de una tarea que acabas de ejecutar. 
IMPORTANTE: un archivo puede volver a ejecutarse esto debido a que no se generaran nuevos archivos .md para cada ejecucion sino que los prompts podran actualizase. por tanto si un archivo ya fue ejecutado no significa que no pueda volver a ejecutarse. en caso de volver a ejecutarse, agregas un nuevo registro referenciando a la misma tarea. ojo, en cada ejecucion de la tarea, debes revisar si ya se ejecuto y agregar en la columna de version el numero de version que se le dio a la tarea. si la tarea es la primera vez que se ejecuta, entonces la version sera 1. 
IMPORTANTE: siempre que tengas un plan, el plan debes presentarlo al usuario en español.

- **DEXTER**: en caso de que el usuario solicite dexter, debes solicitar una pregunta en caso de que el usuario no la halla hecho, en este caso deberas responder basado en la informacion que tienes del sistema y los avances que tengas del mismo. apoyate en la carpeta `./prompt` para poder entender los contextos. 

- **UPDATE**: en caso de que el usaurio escriba este comando debes actualizar los avances en el archivo `./README.md` y en el archivo `./prompt/seguimiento.csv`

- **BRAIN**: en caso de que el usaurio escriba este comando debes revisar el archivo de seguimiento y buscar en que nos quedamos y segun el plan de desarrollo debes buscar en que nos quedamos y que es lo siguiente que debemos hacer. 

- **FIX**: en este caso si el usuario solicita que resuelvas un error, entonces debes buscar el error mencionado por el usuario y resolverlo. pero en caso de que el usurio no sea claro, debes solicitar mas informacion al usuario. hasta que el requerimiento no sea claro, no debes resolver el error. En caso de que resuelvas el error, debes agregar un registro en el archivo `./prompt/seguimiento.csv` con la tarea que acabas de resolver. como no tienes un `.md` en el titulo agrega simplemente `FIX` en el titulo.

- **REVERT**: En caso de que el usuario solicite revertir un cambio, debes solicitarle que te diga a que cambio se refiere, para ello puedes apoyarte en el archivo `./prompt/seguimiento.csv` para que el usuario pueda identificar el cambio al que se refiere. una vez identificado el cambio, debes revertirlo y agregar un nuevo registro en el archivo `./prompt/seguimiento.csv` con la tarea que acabas de ejecutar. como no tienes un `.md` en el titulo agrega simplemente `REVERT` en el titulo. Idealmente puedes solicitar el archivo de prompt MD donde se agrego el cambio originalmente. es decir que un usuario pordria solicitar revertir un cambio de un archivo específico, por ejemplo `areas-general-concept.md` y tu buscaras en el archivo de seguimiento el ultimo cambio que se hizo relacionado a ese archivo y lo revertiras.