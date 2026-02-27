# Tarea: Implementacion del buscador de canciones

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