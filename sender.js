import http from 'http'

const PORT = 2020

/**
 * Establece la comunicacion con la API de notificaciones.
 * @param options Opciones de la peticion HTTP.
 * @param body Cuerpo de la peticion, en este caso, la reserva.
 */

const sendMail = (options,body) => {

    const req = http.request(options,(res)=>{
        let data = []
        
        res.on('data',(chunk)=>data.push(chunk))

        res.on('end',()=>{
            
            if (res.statusCode!=202){
                setTimeout(sendMail,5000,options,data)
            }
            
        })
    })
    req.on('error',()=>console.log("Error al enviar el mail"))
    req.write(JSON.stringify(body))
    req.end()
}

/**
 * En base a la reserva, arma el cuerpo del mensaje y lo envia a la API de notificaciones.
 * @param reserva Objeto reserva definido previamente.
 */

const enviarRecordatorio = (reserva) => {
    const options = {
        // host: `201.179.7.212`,
        host: 'localhost',
        port: PORT,
        path: '/api/notificacion',       
        method: 'POST',
        headers:{
            'Content-type': 'application/json'
        }
    }
    const date = new Date(reserva.dateTime)
    date.set
    const data = {
        destinatario: reserva.email,
        asunto: `RECORDATORIO Turno dia ${date.getDate()}/${date.getMonth()}`,
        cuerpo: `
                <p>ESTIMADO Usuario/a le recordamos que usted tiene un turno el dia 
                <b>${date.toLocaleDateString("es-ES",{weekday: "long",month:"long",day:"numeric"})}</b>
                a las <b>${date.toLocaleTimeString('es-Es',{hour12: true,hour:"2-digit",minute:"2-digit"})}</b>
                </p>`
    }
    
    if (reserva.email != null && reserva.status == 1){
        sendMail(options,data)
    }
    else{
        console.log("No se enviara un mail si el mail es nulo y la reserva esta confirmada")
    }
    
}

export default enviarRecordatorio