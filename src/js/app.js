let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion();//Muestra y oculta las secciones
    tabs(); //cambia secciones cuando se presionen los tabs
    botonesPaginador(); //Agrega o quita los botones del paginador
    paginaSiguiente();
    paginaAnterior();


    consultarAPI(); //Consulta la API en el backen de php

    idCliente();
    nombreCliente(); //añade el nombre del cliente al objeto de cita
    seleccionarFecha();// Añade la fecha de la cita en el objeto
    seleccionarHora();// Añade la hora de la cita en el objeto
    
    mostrarResumen();// muestra el resumen de la cita
}

function mostrarSeccion() {
    //ocultar la seccion que tenga la clase mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar');
    }

    //Seleccionar la seccion con el paso...
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');

    cambiarColor();

}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');

    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        });
    })
}

function cambiarColor() {
    //ocultar la seccion que tenga la clase mostrar
    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual');
    }

    //Seleccionar la seccion con el paso...
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');

}

function botonesPaginador(){
    const paginaAnterior = document.querySelector('#anterior')
    const paginaSiguiente = document.querySelector('#siguiente')

    if(paso === 1){
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
    }else{
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
      
    if(paso === 3){
        mostrarResumen();
    }
}


function paginaSiguiente() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function(){
        if(paso <= pasoInicial) return;
        paso--;

        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function(){
        if(paso >= pasoFinal) return;
        paso++;

        botonesPaginador();
    })

}

//para utilisar el AWAIT necesitas una funcion async
async function consultarAPI() {

    try{
        const url = `${location.origin}/api/servicios`;
        const resultado = await fetch(url);// el await espera a que cargen todos lo almacenado para seguir recorriendo
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    
    }catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {

    //recorremos un arreglo
    servicios.forEach(servicio => {
        const { id, nombre, precio } = servicio;

        //createElement crea una etiqueta html
        const nombreServicio = document.createElement('P');
        //classList.add añade una clase a la etiqueta
        nombreServicio.classList.add('nombre-servicio');
        //textContent añades lo que contenera la etiqueta
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        //dataset.(El nombre que quieras que tenga el atributo y lo igualas con lo que quieras que valga)
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function(){
            seleccionarServicio(servicio);
        }

        //appendChild agrega todo lo que estara dentro del div creado anteriormente o dentro de alguna etiqueta contenedor
        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        //mostrarlo en la vista
        document.querySelector('#servicios').appendChild(servicioDiv);


    });
}


function seleccionarServicio(servicio) {

    const { id } = servicio;
    //tomo el arreglo de servicios que esta en cita
    const { servicios } = cita;

    //Identifica al elemento que se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    //comprobar si un servicio ya fue agregado ya fue arreglado
    //some itera y ve si ya existe el elemento
    if(servicios.some( agregado => agregado.id === id )) {
        //elimina
        cita.servicios = servicios.filter( agregado => agregado.id !== id);
        divServicio.classList.remove('seleccionado');
    }else {
        //lo que selecciono lo copio en el arreglo de servicios
        cita.servicios = [...servicios, servicio];
        //classList.add añade una clase a la etiqueta
        divServicio.classList.add('seleccionado');
    }
    console.log(cita);
}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e){

        const dia = new Date(e.target.value).getUTCDay();

        //deshabilitar los dias que no quieres
        if([6, 0].includes(dia)){
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        }else {
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e){
        const horaCita = e.target.value;
        const hora = horaCita.split(":")[0];
        if(hora < 10 || hora > 18){
            e.target.value = '';
            mostrarAlerta('Hora no permitida', 'error', '.formulario');
        }else {
            cita.hora = e.target.value;
        }
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true){

    //previene que se genere mas de 1 alerta
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        alertaPrevia.remove();
    }

    // scripting para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece){
        //Eliminar la alerta
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');


    //Limpiar el contenido de resumen
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0){
        mostrarAlerta('Faltan datos de Servicios', 'error', '.contenido-resumen', false);

        return;
    }

    //Formatear el div de resumen
    const {nombre, fecha, hora, servicios} = cita;

    //Heding para servicios en Resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    //Iterando y mostrando los servicios
    servicios.forEach(servicio => {
        const {id, precio, nombre} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio')

        const textoServicio = document.createElement('P')
        textoServicio.textContent = nombre;
        
        const precioServicio = document.createElement('P')
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;
        
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        
        resumen.appendChild(contenedorServicio);
    });
    
    const headingCliente = document.createElement('H3');
    headingCliente.textContent = 'Resumen de Cliente';
    resumen.appendChild(headingCliente);

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`

    //Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const opciones = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const fechaUTC = new Date(Date.UTC(year, mes, dia));
    const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora} horas`

    //Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);
}

async function reservarCita() {

    const { nombre, fecha, hora, servicios, id} = cita;

    const idServicios = servicios.map(servicio => servicio.id);


    const datos = new FormData();
    
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicios);
    
    //console.log([...datos]);

    try {
        //peticion hacia la api
        const url = `${location.origin}/api/citas`;
    
        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });
    
        const resultado = await respuesta.json();
        console.log(resultado.resultado);
    
        if(resultado.resultado) {
            Swal.fire({
                icon: "success",
                title: "Cita creada",
                text: "Tu cita fue creada",
                button: 'OK'
            }).then( ()  =>{
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error...",
            text: "Hubo un error al guardar la cita",
        });
    }

    //console.log([...datos]);
}

