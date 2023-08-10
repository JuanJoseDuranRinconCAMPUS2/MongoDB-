import { Router } from "express";
import {limitGColecciones, limitPColecciones, limitDColecciones} from '../middleware/limit.js';
import bodyParser  from 'body-parser';
import { Collection, ObjectId } from 'mongodb';
import { con } from '../db/atlas.js';

const AppCliente = Router();
let db = await con();

//1
// Mostrar todos los clientes registrados en la base de datos

AppCliente.get('/GetCliente', limitGColecciones(), async (req, res) =>{
    if(!req.rateLimit) return;
    let cliente = db.collection("cliente");
    let result = await cliente.find({}).sort( { _id: 1 } ).toArray();
    res.send(result)

})

AppCliente.post('/PostCliente', limitPColecciones(250, "cliente"), async (req, res) =>{
    if(!req.rateLimit) return;
    let cliente = db.collection("cliente");

    try {
        let result = await cliente.insertOne(req.body)
        res.send(`Data Enviada correctamente`);
      } catch (error) {
        res.send(`Error al guardar la data, _id ya se encuentra en uso`);
      }
})

AppCliente.put('/PutCliente', limitPColecciones(250, "cliente"), async (req, res) =>{
    if(!req.rateLimit) return;
    let cliente = db.collection("cliente");
    const id = parseInt(req.query.id, 10);
    try {
        
        let result = await cliente.updateOne({ _id: id }, { $set: req.body })
        if (result.modifiedCount > 0) {
            res.send("Documento actualizado correctamente");
        } else {
            res.send("El documento no pudo ser encontrado o no se realizaron cambios");
        }
      } catch (error) {
        res.send(`Error al Actualizar la data`);
      }
})

AppCliente.delete('/DeleteCliente', limitDColecciones(), async (req, res) =>{
    if(!req.rateLimit) return;
    let cliente = db.collection("cliente");
    const id = parseInt(req.body.id, 10);
    try {
        let result = await cliente.deleteOne({ _id: id })
        if (result.deletedCount > 0) {
            res.send("Documento ha sido eliminado correctamente");
        } else {
            res.send("El documento no pudo ser encontrado o no se elimino el documento");
        }
      } catch (error) {
        res.send(`Error al Actualizar la data`);
      }
})

//9
// Listar los clientes con el DNI específico.
//DNI DISPONIBLES
// 343434
// 1225631215
// 22554451
// 45897812564
// 125233544
AppCliente.get('/ClienteDNI', limitGColecciones(), async (req, res) =>{
  if(!req.rateLimit) return;
  let cliente = db.collection("cliente");
  const DNI = String(req.query.DNI);
  console.log(DNI);
  let result = await cliente.find({ DNI: { $eq: DNI }}).toArray();
  res.send(result)

})

//14
// Obtener los datos de los clientes que realizaron al menos un alquiler

AppCliente.get('/Clientes_Alquiler', limitGColecciones(), async (req, res) =>{
  if(!req.rateLimit) return;
  let cliente = db.collection("cliente");
  let result = await cliente.aggregate([  
      {    
          $lookup: {      
              from: "alquiler",     
              localField: "_id",      
              foreignField: "cliente_id",      
              as: "Alquiler"   
          }  
      },  
      {
          $match: {Alquiler: { $ne: [] }}
      },
      {
          $unwind: "$Alquiler"
      },
      {
          $set: { Estado: "El cliente tiene alquileres registrados" }
      },
      {
          $group: {
              _id: "$_id",
              Nombre: {
                  $first: "$Nombre"
              },
              Apellido: {
                  $first: "$Apellido"
              },
              DNI: {
                  $first: "$DNI"
              },
              Direccion: {
                  $first: "$Direccion"
              },
              Telefono: {
                  $first: "$Telefono"
              },
              Email: {
                  $first: "$Email"
              },
              Estado: {
                  $first: "$Estado"
              }
          }
      }
  ]).sort( { _id: 1 } ).toArray();
  res.send(result)

})

//19
// Obtener los datos del cliente que realizó la reserva con ID_Reserva específico.
AppCliente.get('/DatosClientesPorReserva', limitGColecciones(), async (req, res) =>{
    if(!req.rateLimit) return;
    let cliente = db.collection("cliente");
    let id_Reserva = parseInt(req.query.id_Reserva, 10);
    let result = await cliente.aggregate([  
        {    
            $lookup: {      
                from: "reserva",     
                localField: "_id",      
                foreignField: "cliente_id",      
                as: "Reserva"   
             }  
        },  
        {
            $unwind: "$Reserva"
        },
        {
            $match: {Reserva: { $ne: [] }, "Reserva._id": {$gte: id_Reserva}}
        },
        {
            $set: { Estado: {
                $concat: [
                    "El cliente tiene una reserva con el id ", " ", { $toString: "$Reserva._id" }
                ]
            } }
        },
        {
            $group: {
                _id: "$_id",
                Nombre: {
                    $first: "$Nombre"
                },
                Apellido: {
                    $first: "$Apellido"
                },
                DNI: {
                    $first: "$DNI"
                },
                Direccion: {
                    $first: "$Direccion"
                },
                Telefono: {
                    $first: "$Telefono"
                },
                Email: {
                    $first: "$Email"
                },
                Estado: {
                    $first: "$Estado"
                }
            }
        }
    ]).toArray();
    res.send(result)

})

export default AppCliente;