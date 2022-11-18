import fs from "fs";
import enviarRecordatorio from './sender.js'

const PORT = 2000

/**
 * Establece el tiempo de Timeout para el envio del recordatorio del turno
 * @param tiempo Fecha y hora del turno.
 * @param intervalo Intervalo de tiempo para enviar el recordatorio. El estandar es 24hs.
 * @returns tiempo en milisegundos desde la hora actual hasta el envio del recordatorio. El valor puede ser 
 * >0 (se establecera un timeout de dicho tiempo), o <=0 (se envia el recordatorio en forma inmediata)
 *      
 */
const calculaTiempo = (tiempo,intervalo) => {
    const date = new Date()
    let tiempoRecordatorio = new Date(tiempo)
    tiempoRecordatorio.setUTCHours(tiempoRecordatorio.getUTCHours()-intervalo)
    let tiempoEnMilisegundos = (tiempoRecordatorio-date)

    return tiempoEnMilisegundos
}

/**
 * Por cada reserva establece un timeout hasta el tiempo en el que deba enviar el recordatorio. 
 * @param reservas lista o arreglo de reservas.
 */

const programaRecordatorios = (reservas) => {
    for (let reserva of reservas){
        reserva.idTimer = setTimeout(()=>enviarRecordatorio(reserva),calculaTiempo(reserva.dateTime,24))
    }
}

const archivo = './../Reservas.json';



let reservasPrev = fs.readFileSync("./../Reservas.json","utf-8")

reservasPrev = JSON.parse(reservasPrev)
programaRecordatorios(reservasPrev)
let fsEspera = false;
fs.watch(archivo, (event, filename) => {
if (filename) {
    if (fsEspera) return;
    fsEspera = setTimeout(() => {
    fsEspera = false;
    }, 1000/2);
    console.log(`${filename} El archivo ha cambiado`);
    let reservasNew = tryHARD()
    setRecordatorios(reservasNew)
}
});

function tryHARD(){

    try{
        let reservasNew = fs.readFileSync(archivo,"utf-8")
        reservasNew = JSON.parse(reservasNew)
        return reservasNew
    }catch(e){
        return tryHARD()
    }

    


}




/**
 * Cuando cambia el archivo, itera sobre el mismo para verificar si hay nuevos recordatorios a enviar, y en caso de haberlos
 * los programa para enviarlos.
 */
const setRecordatorios =  (reservasNew)=>{
    console.log("NuevaLectura")
    let nuevasReservas = []


    reservasNew.forEach(reservaNueva =>{
        let reservaPrev = reservasPrev.find(x => x.id == reservaNueva.id)
        //Si la reserva ya existia
        if (reservaPrev != null){
            //Hubo un cambio, hay que resetear el intervalo
            if (reservaNueva.userId != reservaPrev.userId || reservaNueva.email != reservaPrev.email){
                clearInterval(reservaPrev.idTimer)
                reservaPrev = reservaNueva; // Piso los valores
                reservaPrev.idTimer = setTimeout(() => {
                    enviarRecordatorio(reservaPrev)
                }, calculaTiempo(reservaNueva.dateTime,24)); 
            }
        }
        //La reserva no existia
        else{
            reservaNueva.idTimer = setTimeout(()=>enviarRecordatorio(reservaNueva),
                                                calculaTiempo(reservaNueva.dateTime,24))
        }
    })
    reservasPrev = reservasNew
}