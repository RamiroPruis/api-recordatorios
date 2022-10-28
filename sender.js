import https from 'https'

const PORT = 2000

const sendMail = (options,data) => {
    const req = https.request(options,(res)=>{
        let data = []

        res.on('data',(chunk)=>data.push(chunk))

        res.on('end',()=>{
            let body = JSON.parse(Buffer.concat(data).toString())

            if (res.statusCode!=202){
                console.log(`No se pudo mandar el recordatorio a ${data.email}. Reintentando en 5 segundos`)
                setTimeout(sendMail(options,data),5000)
            }
        })
    })

    req.write(data)
    req.end()
}


const enviarRecordatorio = (reserva) => {
    console.log("Mandando Recordatorioooo")
    const options = {
        host: 'localhost',
        port: `${PORT}`,
        path: '/api/notificaciones',       
        method: 'POST',
        headers:{
            'Content-type': 'application/json'
        }
    }
    const date = new Date(reserva.datetime)
    const data = {
        destinatario: reserva.email,
        asunto: `RECORDATORIO Turno dia ${date.getDate()}/${date.getMonth()}`,
        cuerpo: `ESTIMADO Usuario/a le recordamos que usted tiene un turno el dia <s>${date.toLocaleDateString("es-ES",{weekday: "long",month:"long",day:"numeric"})}</s>`
    }
    
    sendMail(options,data)
}
