import fs from "fs";
// require('log-timestamp');

const calculaTiempo = (tiempo,intervalo) => {
    const date = new Date()
    const tiempoRecordatorio = new Date(tiempo)
    console.log(tiempoRecordatorio, "DIA:", tiempoRecordatorio.getUTCDay))
    tiempoRecordatorio.setDate(tiempoRecordatorio.getDay()-intervalo)
    let tiempoEnMilisegundos = (tiempoRecordatorio-date)
    console.log("Fecha recordatorio:",tiempoRecordatorio)
    console.log("Fecha ahora:",date)

    console.log(tiempoEnMilisegundos)
    return tiempoEnMilisegundos
}


const programaRecordatorios = (reservas) => {
    for (let reserva of reservas){
        reserva.idTimer = setTimeout(()=>enviarRecordatorio(reserva),calculaTiempo(reserva.datetime,1))
    }
}

const enviarRecordatorio = () => {
    console.log("Mandando Recordatorioooo")
}


const archivo = './reservas.json';

console.log(`Esperando cambios en ${archivo}`);



let reservasPrev = fs.readFileSync("./reservas.json","utf-8")
console.log(JSON.parse(reservasPrev))
reservasPrev = JSON.parse(reservasPrev)
programaRecordatorios(reservasPrev)
console.log(reservasPrev)
console.log("**********************************************")

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

    // {
    //     id: 3,
    //     datetime: '2022-09-02T19:58:10.406Z',
    //     userId: 3,
    //     email: 'joaquinfioriti9@gmail.com',
    //     branchId: 3,
    //     idTimer: 1,
    // }




const setRecordatorios = ()=>{
    let reservasNew = fs.readFileSync("./reservas.json","utf-8")
    reservasNew = JSON.parse(reservasNew)
    let nuevasReservas = []

    reservasNew.forEach(reservaNueva =>{
        reservaPrev = reservasPrev.find(x => x.id == reservaNueva.id)
        //Si la reserva ya existia
        if (reservasPrev != null){
            //Hubo un cambio, hay que resetear el intervalo
            if (reservaNueva.userId != reservaPrev.userId || reservaNueva.email != reservaPrev.email){
                console.log("Se modifico la reserva ", reservaNueva.id)
                clearInterval(reservaPrev.idTimer)
                reservaPrev = reservaNueva; // Piso los valores
                reservaPrev.idTimer = setTimeout(() => {
                    enviarRecordatorio(reservaPrev)
                }, calculaTiempo(reservasNew.datetime,1)); 
            }
        }
        //La reserva no existia
        else{
            reservaNueva.idTimer = setTimeout(()=>enviarRecordatorio(),
                                                calculaTiempo(reservaNueva.datetime,1))
            nuvevasReservas.push(reservaNueva)
        }
    })
    reservasPrev.concat(nuevasReservas)
}
 

/**
 * 
 * 
 * 
 */


