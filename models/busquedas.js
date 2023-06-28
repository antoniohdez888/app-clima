import fs from 'fs';
import axios from 'axios';

export class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map( h => {

            let palabras = h.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
            return palabras.join(' ');
            
        })
    }

    get paramsMapbox() {
        return{
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'lang': 'es',
            'units': 'metric'
        }
    }

    async ciudad( lugar = '' ) {

        try {
            
            // petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
    
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (error) {

           return [] ;

        }

    }

    async climaLugar( lat, lon ) {

        try {

            // instancia de axios
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params:{
                    ...this.paramsOpenWeather,
                    lat,
                    lon
                }
            })

            // extraer info de la respuesta
            const resp = await instance.get();
            const { weather, main } = resp.data;

            // retornar objeto con descripcion, temperatura actual, maxima y minima
            return {
                desc: weather[0].description,
                temp: main.temp,
                min: main.temp_min,
                max: main.temp_max,

            }
            
        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar = '' ) {

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }

        this.historial = this.historial.splice(0,5);

        // TODO: prevenir duplicados
        this.historial.unshift( lugar );

        // grabar en DB
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) )

    }

    leerDB() {
        
        // Verificar que exista 
        if( !fs.existsSync( this.dbPath ) ){
            return;
        }

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } )

        // cargar la info
        const data = JSON.parse( info );

        this.historial = data.historial;

    }

}