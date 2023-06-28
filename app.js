import dotenv from 'dotenv';
import { inquirerMenu, leerInput, listarLugares, pausa } from './helpers/inquirer.js';
import { Busquedas } from './models/busquedas.js';

dotenv.config();
console.clear();

const main = async() => {

    let opt;

    const busquedas = new Busquedas();

    do {

        opt = await inquirerMenu();

        switch ( opt ) {
            
            case 1:

                // Mostrar mensaje 
                const termino = await leerInput('Ciudad: ');
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino );
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if( id === '0') continue;

                const seleccion = lugares.find( l => l.id === id );

                // guardar en DB
                busquedas.agregarHistorial( seleccion.nombre );

                // Clima

                const clima = await busquedas.climaLugar( seleccion.lat, seleccion.lng );

                // Mostrar resultados
                console.clear();
                console.log(`\nInformación de la ciudad\n`.green);
                console.log('Ciudad:', seleccion.nombre);
                console.log('Lat:', seleccion.lat);
                console.log('Long:', seleccion.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Descripción:', clima.desc.green);
                
            break;

            case 2:
                
                busquedas.historialCapitalizado.forEach( ( lugar, i ) => {
                    const idx = `${ i }.`.green;
                    console.log(`${ idx } ${ lugar }`);
                })

            break;
        
            default:
            break;
        }

        if ( opt !== 0 ) await pausa();
        
    } while ( opt !== 0 );

}

main();