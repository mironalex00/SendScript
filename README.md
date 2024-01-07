# SendScript

Código para enviar N mensajes, compatible con Discord, Instagram y WhatsApp.

## Método de empleo ES Modules:

 import sendFunction from "./[main.js](https://github.com/mironalex00/SendScript/blob/main/main.js)"

## O desde la consola del navegador

Abra [main.js](https://github.com/mironalex00/SendScript/blob/main/main.js);

Copie todo el contenido (haga clic en raw -> ctrl+a -> ctrl+c);

Diríjase a [discord](https://discord.com/channels/@me) , [instagram](https://www.instagram.com/direct/inbox/) o [whatsapp](https://web.whatsapp.com/)

Abra la consola del navegador (ctrl + shift + i) y diríjase al apartado de **Console**

Pegue el contenido del script en la consola (ctrl + v)

## LLamada al script

_**ATENCIÓN**: PARA DISCORD, AL LLAMAR AL SCRIPT, DEBE ESTAR EN EL [INBOX](https://discord.com/channels/@me) DEL USUARIO_... _**PD**: Puede que en discord bloquee más de x peticiones, proceder con precaunción para evitar ban_

Se puede llamar de distintas maneras:
1. Texto plano simple (Es obligatorio indicar el número de veces que se va a mandar) 
Ejemplo:
```
await main("**HERE GOES YOUR TEXT**, 10);
```
2. Texto plano simple multilineal (No es obligatorio indicar el número de veces, por defecto elige el número de líneas recibidas)
Ejemplo:
```
await main(´
**HERE**
**GOES**
**YOUR TEXT**
´);
```
3. Texto plano complejo o Array (No es obligatorio indicar el número de veces, por defecto elige la longitud del array)
Ejemplo:
```
await main([
"**HERE**",
"**GOES**",
"**YOUR TEXT**"
]);
```
4. Petición URL (No es necesario indicar el número de veces) 
Ejemplo:
```
await main("https://raw.githubusercontent.com/mironalex00/SendScript/main/Shrek.txt")
```

**Si se desea saber en todo momento qué esta pasando, añadir al final de la llamada de la función el parámetro booleano de flag debug (_true_)**
Ejemplo:
```
await main("**HERE GOES YOUR TEXT**, 10, true);

await main(´
**HERE**
**GOES**
**YOUR TEXT**
´, 10, true);

await main([
"**HERE**",
"**GOES**",
"**YOUR TEXT**"
], true);

await main("https://raw.githubusercontent.com/mironalex00/SendScript/main/Shrek.txt", true)
```
