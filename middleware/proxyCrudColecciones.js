import  express from 'express';
import 'reflect-metadata';
import { plainToClass } from "class-transformer";
import { validatePostAlquiler, validatePutAlquiler } from "../controllers/vCrudAlquiler.js";
import { validatePostAuto, validatePutAuto } from '../controllers/vCrudAutomovil.js';
import { validatePostCliente, validatePutCliente} from '../controllers/vCrudCliente.js'
import { validate } from 'class-validator';

const proxyPutColeccion = express();

const Validaciones = {
    "alquileresPut" : validatePutAlquiler,
    "alquileresPost" : validatePostAlquiler,
    "automovilesPut" : validatePutAuto,
    "automovilesPost" : validatePostAuto,
    "clientePut" : validatePutCliente,
    "clientePost" : validatePostCliente,
}

//proxy usado para validar los metodos put y post
export function proxyPostC(coleccion) {
    const proxyPostColeccion = express();
    console.log(coleccion);
    proxyPostColeccion.use(async(req, res, next)=>{
        try {
            let validation = Validaciones[coleccion];
            let data = plainToClass(validation, req.body, {excludeExtraneousValues: true});
            await validate(data);
            req.body = JSON.parse(JSON.stringify(data));
            next();
        } catch (err) {
            res.status(err.status).send(err);
        }
    });

    return proxyPostColeccion;
}
