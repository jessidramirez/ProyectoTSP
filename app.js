// 
const express = require('express');
const app = express();

//
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// variables de entorno
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//directorio de recursos
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname+'/public'));

//Plantillas
app.set('view engine','ejs');


//bcryptjs
const bcryptjs = require('bcryptjs');

//Variables de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

const connction = require('./database/db');
const connection = require('./database/db');

// registros de usuarios
app.post('/registro', async(req,res)=>{
    const Usuario= req.body.Usuario;
    const Correo= req.body.Correo;
    const Pass= req.body.Contraseña;
    let paswordHash = await bcryptjs.hash(Pass,8);
    connection.query('INSERT INTO usuarios SET ?', {Usuario:Usuario, Correo:Correo,Contraseña:paswordHash}, async(error,results)=>{
        if (error) {
            console.log(error);
        } else {
           res.render('registro',{
                alert:true,
                alertTitle:"Registro",
                alertMessage:"¡Registro Exitoso!",
                alertIcon:'success',
                ShowConfirmButton:false,
                timer:1500,
                ruta:'login'
           })
        }
    })
})
app.post('/addCarrito', async(req,res)=>{
    const id_producto= req.body.id_producto;
    const id_usuario= req.session.id_usuario;
    if (req.session.loggedin) {
        connection.query('INSERT INTO carrito SET ?', {id_producto:id_producto, id_usuario:id_usuario, cantidad:1}, async(error,results)=>{
        if (error) {
            console.log(error);
        } else {
            connection.query('SELECT * FROM productos ORDER BY nombre', async(error,results)=>{
            if (error) {
                
            } else {
                res.render('catalogo',{
                login: true,
                name:req.session.name,
                id_usuario:req.session.id_usuario,
                productos:results,
                alert:true,
                alertTitle:"Agregado",
                alertMessage:"¡Se agrego el producto al carrito!",
                alertIcon:'success',
                ShowConfirmButton:false,
                timer:1500,
                ruta:'catalogo'
            })}
            })
        }
        })
    } else {
            connection.query('SELECT * FROM productos ORDER BY nombre', async(error,results)=>{
            if (error) {

            } else {
            res.render('login',{
            login: false,
            name:'Debe iniciar sesión',
            id_usuario:0,
            productos:results,
            alert:true,
            alertTitle:"Debe iniciar sesion",
            alertMessage:"Debe iniciar sesion para agregar productos",
            alertIcon:'error',
            ShowConfirmButton:false,
            timer:1500,
            ruta:'login'
        })}
    })}
})

app.post('/addCarritoVer', async(req,res)=>{
    const id_producto= req.body.id_producto;
    const cantidad= req.body.cantidad;
    const id_usuario= req.session.id_usuario;
    if (req.session.loggedin) {
        connection.query('INSERT INTO carrito SET ?', {id_producto:id_producto, id_usuario:id_usuario, cantidad:cantidad}, async(error,results)=>{
        if (error) {
            console.log(error);
        } else {
            connection.query('SELECT * FROM productos ORDER BY nombre', async(error,results)=>{
            if (error) {
                
            } else {
                res.render('catalogo',{
                login: true,
                name:req.session.name,
                id_usuario:req.session.id_usuario,
                productos:results,
                alert:true,
                alertTitle:"Agregado",
                alertMessage:"¡Se agrego el producto al carrito!",
                alertIcon:'success',
                ShowConfirmButton:false,
                timer:1500,
                ruta:'catalogo'
            })}
            })
        }
        })
    } else {
            connection.query('SELECT * FROM productos ORDER BY nombre', async(error,results)=>{
            if (error) {

            } else {
            res.render('login',{
            login: false,
            name:'Debe iniciar sesión',
            id_usuario:0,
            productos:results,
            alert:true,
            alertTitle:"Error",
            alertMessage:"Debe iniciar sesion para agregar productos",
            alertIcon:'error',
            ShowConfirmButton:false,
            timer:2000,
            ruta:'login'
        })}
    })}
})


//log in
app.post('/ingreso', async(req,res)=>{
    const Usuario=req.body.Usuario;
    const Contraseña=req.body.Contraseña;
    let passwordHaash=await bcryptjs.hash(Contraseña,8);
    connection.query('SELECT * FROM usuarios WHERE Usuario=?',[Usuario], async(error,results)=>{
        if (results.length==0 || !(await bcryptjs.compare(Contraseña,results[0].Contraseña))) {
            res.render('login',{

                alert:true,
                alertTitle:"Error",
                alertMessage:"¡Usuario o contraseña incorrectos!",
                alertIcon:'error',
                ShowConfirmButton:true,
                timer:false,
                ruta:'login',
                login: false,
                name:req.session.name,
                id_usuario:req.session.id_usuario
           })
        } else {
            req.session.loggedin = true;
            req.session.name = results[0].Usuario;
            req.session.id_usuario = results[0].id_usuario;
            res.render('login',{
                alert:true,
                alertTitle:"Ingreso exitoso",
                alertMessage:"¡INGRESO EXITOSO!",
                alertIcon:'success',
                ShowConfirmButton:true,
                timer:false,
                ruta:'',
                login: true,
                name:req.session.name,
                id_usuario:req.session.id_usuario
           })
        }
    })
})

app.get('/',(req,res)=>{
    if (req.session.loggedin) {
        res.render('index',{
            login: true,
            name:req.session.name,
            id_usuario:req.session.id_usuario
        });
    } else {
        res.render('index',{
            login: false,
            name:'Debe iniciar sesión',
            id_usuario:0
        });
    }
    
})
app.get('/login',(req,res)=>{
    if (req.session.loggedin) {
        res.render('login',{
            login: true,
            name:req.session.name,
            id_usuario:req.session.id_usuario
        });
    } else {
        res.render('login',{
            login: false,
            name:'Debe iniciar sesión',
            id_usuario:0
        });
    }
})
app.get('/registro',(req,res)=>{
    if (req.session.loggedin) {
        res.render('registro',{
            login: true,
            name:req.session.name,
            id_usuario:req.session.id_usuario
        });
    } else {
        res.render('registro',{
            login: false,
            name:'Debe iniciar sesión',
            id_usuario:0
        });
    }
})
app.get('/catalogo',(req,res)=>{
    connection.query('SELECT * FROM productos ORDER BY nombre', async(error,results)=>{
        if (error) {
            
        } else {
            if (req.session.loggedin) {
                res.render('catalogo',{
                    login: true,
                    name:req.session.name,
                    id_usuario:req.session.id_usuario,
                    productos:results
                });
            } else {
                res.render('catalogo',{
                    login: false,
                    name:'Debe iniciar sesión',
                    id_usuario:0,
                    productos:results
                });
            }
        }
    })
 
})

app.get('/carrito',(req,res)=>{
    connection.query('SELECT (carrito.cantidad*productos.valor) AS total,productos.*,carrito.cantidad FROM carrito INNER JOIN productos ON carrito.id_producto = productos.id_producto INNER JOIN usuarios ON carrito.id_usuario = usuarios.id_usuario WHERE carrito.id_usuario=? ORDER BY productos.id_producto',req.session.id_usuario, async(error,results)=>{
        if (error) {
            
        } else {
            var n=0;
            for (i=0;i<results.length;i++){  
                n=n+results[i].total;
            }
            console.log(n);
            if (req.session.loggedin) {
                res.render('carrito',{
                    login: true,
                    name:req.session.name,
                    id_usuario:req.session.id_usuario,
                    productos:results,
                    pagar:n

                });
            } else {
                res.render('carrito',{
                    login: false,
                    name:'Debe iniciar sesión',
                    id_usuario:0,
                    productos:results,
                });
            }
        }
    })
 
})

app.post('/verP',(req,res)=>{
    const id_producto=req.body.id_producto;
    const id_usuario= req.session.id_usuario;
    console.log();
    connection.query('SELECT * FROM productos WHERE id_producto=?',id_producto, async(error,results)=>{
        if (error) {
            console.log(error.message);
        } else {
            if (req.session.loggedin) {
                res.render('verP',{
                    login: true,
                    name:req.session.name,
                    id_usuario:req.session.id_usuario,
                    productos:results[0]
                });
            } else {
                res.render('verP',{
                    login: false,
                    name:'Debe iniciar sesión',
                    id_usuario:0,
                    productos:results[0]
                });
            }
        }
    })
})

app.post('/delete',(req,res)=>{
    const id_producto= req.body.id_producto;
    const id_usuario= req.session.id_usuario;
    connection.query('DELETE FROM carrito WHERE id_producto='+id_producto+' AND id_usuario='+id_usuario+' LIMIT 1', async(error,results)=>{
        if (error) {
             console.log(error.message);
             console.log('DELETE FROM carrito WHERE id_producto='+id_producto+' AND id_usuario='+id_usuario+' LIMIT 1');

        } else {
            connection.query('SELECT productos.*,carrito.cantidad FROM carrito INNER JOIN productos ON carrito.id_producto = productos.id_producto INNER JOIN usuarios ON carrito.id_usuario = usuarios.id_usuario WHERE carrito.id_usuario=? ORDER BY productos.id_producto',req.session.id_usuario, async(error,results)=>{
                if (error) {
                    
                } else {
                    if (req.session.loggedin) {
                        res.render('carrito',{
                            login: true,
                            name:req.session.name,
                            id_usuario:req.session.id_usuario,
                            productos:results,
                            total:0
                        });
                    } else {
                        res.render('carrito',{
                            login: false,
                            name:'Debe iniciar sesión',
                            id_usuario:0,
                            productos:results,
                            total:0
                        });
                    }
                }
            })
        }
    })
})

app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000,(req,res)=>{
    console.log('SERVER RUNNING http://localhost:3000');
})
