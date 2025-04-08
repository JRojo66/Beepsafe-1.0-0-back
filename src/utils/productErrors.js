import os from "os"

export function productArguments(title, description, code, price, status, stock, category, thumbnails){

    return `-invalid arguments:
Mandatory arguments:
    - title: String. ${title} received
    ... COMPLETE WITH OTHER ARGUMENTS
Optional arguments:
    -alias, powers, team, y publisher. Se recibió: ${JSON.stringify(description, code, price, status, stock, category, thumbnails)}

Fecha: ${new Date().toUTCString()}
Usuario: ${os.userInfo().username}
Terminal: ${os.hostname()}`

}