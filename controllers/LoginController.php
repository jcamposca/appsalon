<?php

namespace Controllers;

use Model\Usuario;
use MVC\Router;
use Classes\Email;

class LoginController {

    public static function login(Router $router) {

        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);
            $alertas = $auth->validarLogin();

            if(empty($alertas)){
                //Comprobar que exista el usuario
                $usuario = Usuario::where('email', $auth->email);

                if($usuario) {
                    //verificamos el apssword
                    if($usuario->comprobarPasswordAndVerificado($auth->password) ) {
                        
                        session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;

                        //Redireccionamiento
                        if($usuario->admin === "1"){
                            $_SESSION['admin'] = $usuario->admin ?? null;
                            header('Location: /admin');
                        }else{
                            header('Location: /cita');
                        }
                    }
                } else {
                    Usuario::setAlerta('error', 'Usuario no encontrado');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
            'alertas' => $alertas
        ]);
    }

    public static function logout() {
        session_start();
        $_SESSION = [];
        header('Location: /');
        
    }

    public static function recuperar(Router $router) {
        $alertas = [];
        $error = false;

        $token = s($_GET['token']);

        //Buscar usuario por su token
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            Usuario::setAlerta('error', 'Token No Valido');
            $error = true;
        }

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            //Leer el nuevo password y guardar

            $password = new Usuario($_POST);
            $alertas = $password->validarPassword();

            if(empty($alertas)){
                //borramos el password anterior
                $usuario->password = null;

                //ponesmos el password nuevo 
                $usuario->password = $password->password;
                //haseamos el password
                $usuario->hashPassword();
                //borramos el token
                $usuario->token=null;
                //guardamos cambios
                $resultado = $usuario->guardar();
                //redireccionamos al usuario
                if($resultado){
                    header('Location: /');
                }

            }
            
        }

        //obtener alertas
        $alertas = Usuario::getAlertas();

        $router->render('auth/recuperar-password', [
            'alertas'=>$alertas,
            'error'=>$error
        ]);
    }

    public static function olvide(Router $router) {

        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)){
                $usuario = Usuario::where('email', $auth->email);

                if($usuario && $usuario->confirmado === "1"){
                    //Generar un toque unico
                    $usuario->crearToken();
                    $usuario->guardar();

                    // enviar el email:
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();
                    //alerta de exito
                    Usuario::setAlerta('exito', 'Revisa tu email');
                }else{
                    Usuario::setAlerta('error', 'El correo no existe o no esta confirmado');
                }
            }
        }

        //obtener alertas
        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide-password', [
            'alertas' => $alertas
        ]);
    }

    public static function crear(Router $router) {

        $usuario = new Usuario();

        //alertas vacias
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $usuario ->sincronizar($_POST);
            $alertas = $usuario -> validarNuevaCuenta();

            //Revisar que alerta este vacio
            if(empty($alertas)){
                //Verificar que el usuario no este registrad
                $resultado = $usuario -> existeUsuario();

                if($resultado->num_rows){
                    $alertas = Usuario::getAlertas();
                }else {
                    //Hashear el Password
                    $usuario->hashPassword();
                    //Generar un toque unico
                    $usuario->crearToken();
                    //Enviar el email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarConfirmacion();

                    //crear el usuario
                    $resultado = $usuario->guardar();
                    if($resultado) {
                        header('Location: /mensaje');
                    }
                }
            }
        };

        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);
    }

    public static function mensaje(Router $router) {

        $router->render('auth/mensaje', [

        ]);
    }
    
    public static function confirmar(Router $router) {
        $alertas = [];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            Usuario::setAlerta('error', 'Token No Valido');
        }else {
            //Modificar a usuario confirmado
            $usuario->confirmado = "1";
            $usuario->token = null;
            $usuario->guardar();
            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }

        //obtener alertas
        $alertas = Usuario::getAlertas();

        //renderizar la vista
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }
}