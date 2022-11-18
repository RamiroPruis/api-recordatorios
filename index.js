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
    console.log("El tiempo que le pasa por parametro es: ",tiempo)
    const date = new Date()
    let tiempoRecordatorio = new Date(tiempo)
    tiempoRecordatorio.setUTCHours(tiempoRecordatorio.getUTCHours()-intervalo)
    let tiempoEnMilisegundos = (tiempoRecordatorio-date)
    console.log("Fecha recordatorio:",tiempoRecordatorio)
    console.log("Fecha ahora:",date)

    console.log(tiempoEnMilisegundos)
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

    const archivo = '../Reservas.json';

    console.log(`Esperando cambios en ${archivo}`);

    let reservasPrev = fs.readFileSync("../Reservas.json","utf-8")
    console.log(JSON.parse(reservasPrev))
    reservasPrev = JSON.parse(reservasPrev)
    programaRecordatorios(reservasPrev)

    let fsEspera = false;
    fs.watch(archivo, (event, filename) => {
    if (filename) {
        if (fsEspera) return;
        fsEspera = setTimeout(() => {
        fsEspera = false;
        }, 1000);
        console.log(`${filename} El archivo ha cambiado`);
        setRecordatorios()
    }
});

/**
 * Cuando cambia el archivo, itera sobre el mismo para verificar si hay nuevos recordatorios a enviar, y en caso de haberlos
 * los programa para enviarlos.
 */
const setRecordatorios = ()=>{
    let reservasNew = fs.readFileSync("../Reservas.json","utf-8")
    reservasNew = JSON.parse(reservasNew)
    let nuevasReservas = []

    console.log("el reservas new es ", reservasNew)

    reservasNew.forEach(reservaNueva =>{
        let reservaPrev = reservasPrev.find(x => x.id == reservaNueva.id)
        //Si la reserva ya existia
        if (reservaPrev != null){
            //Hubo un cambio, hay que resetear el intervalo
            if (reservaNueva.userId != reservaPrev.userId || reservaNueva.email != reservaPrev.email){
                console.log("Se modifico la reserva ", reservaNueva.id)
                clearInterval(reservaPrev.idTimer)
                reservaPrev = reservaNueva; // Piso los valores
                reservaPrev.idTimer = setTimeout(() => {
                    enviarRecordatorio(reservaPrev)
                }, calculaTiempo(reservaNueva.dateTime,24)); 
            }
        }
        //La reserva no existia
        else{
            console.log(reservaNueva)
            reservaNueva.idTimer = setTimeout(()=>enviarRecordatorio(reservaNueva),
                                                calculaTiempo(reservaNueva.dateTime,24))
        }
    })
    reservasPrev = reservasNew
}