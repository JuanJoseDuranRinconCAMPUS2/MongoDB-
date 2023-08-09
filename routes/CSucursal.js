import { Router } from "express";
import {limitGColecciones, limitPColecciones, limitDColecciones} from '../middleware/limit.js';
import bodyParser  from 'body-parser';
import { Collection, ObjectId } from 'mongodb';
import { con } from '../db/atlas.js';

const AppSucursal = Router();
let db = await con();

AppSucursal.get('/GetSucursal', limitGColecciones(), async (req, res) =>{
    if(!req.rateLimit) return;
    let sucursal = db.collection("sucursal");
    let result = await sucursal.find({}).sort( { _id: 1 } ).toArray();
    res.send(result)

})

AppSucursal.post('/PostSucursal', limitPColecciones(200, "sucursal"), async (req, res) =>{
    if(!req.rateLimit) return;
    let sucursal = db.collection("sucursal");

    try {
        let result = await sucursal.insertOne(req.body)
        res.send(`Data Enviada correctamente`);
      } catch (error) {
        res.send(`Error al guardar la data, _id ya se encuentra en uso`);
      }
})

AppSucursal.put('/PutSucursal', limitPColecciones(200, "sucursal"), async (req, res) =>{
    if(!req.rateLimit) return;
    let sucursal = db.collection("sucursal");
    const id = parseInt(req.query.id, 10);
    try {
        
        let result = await sucursal.updateOne({ _id: id }, { $set: req.body })
        if (result.modifiedCount > 0) {
            res.send("Documento actualizado correctamente");
        } else {
            res.send("El documento no pudo ser encontrado o no se realizaron cambios");
        }
      } catch (error) {
        res.send(`Error al Actualizar la data`);
      }
})

AppSucursal.delete('/DeleteSucursal', limitDColecciones(), async (req, res) =>{
    if(!req.rateLimit) return;
    let sucursal = db.collection("sucursal");
    const id = parseInt(req.body.id, 10);
    try {
        let result = await sucursal.deleteOne({ _id: id })
        if (result.deletedCount > 0) {
            res.send("Documento ha sido eliminado correctamente");
        } else {
            res.send("El documento no pudo ser encontrado o no se elimino el documento");
        }
      } catch (error) {
        res.send(`Error al Actualizar la data`);
      }
})

export default AppSucursal;