import http from 'http'

const PORT = 2020

const sendMail = (options,body) => {
    const req = http.request(options,(res)=>{
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
    req.write(JSON.stringify(body))
    req.end()
    console.log("Recordatorio Enviado")
}


const enviarRecordatorio = (reserva) => {
    console.log("Enviando Recordatorio")
    const options = {
        host: `201.179.7.212`,
        port: PORT,
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
        cuerpo: `
                <p>ESTIMADO Usuario/a le recordamos que usted tiene un turno el dia 
                <s>${date.toLocaleDateString("es-ES",{weekday: "long",month:"long",day:"numeric"})}</s>
                </p>`
    }
    
    sendMail(options,data)
}

export default enviarRecordatorio