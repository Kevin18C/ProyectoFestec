/* Recursos.js
 * Esta es simplemente una utilidad de carga de imágenes. Facilita el proceso de carga
 * archivos de imagen para que puedan ser utilizados dentro de su juego. También incluye
 * una simple capa de "caché" para reutilizar las imágenes en caché si se intenta
 * cargar la misma imagen varias veces.
 */
(function () {
  var resourceCache = {};
  var loading = [];
  var readyCallbacks = [];

  /*Esta es la función de carga de imágenes de acceso público. Acepta
   * una matriz de cadenas que apuntan a archivos de imagen o una cadena para una sola
   * imagen. Entonces llamará a nuestra función privada de carga de imágenes.
   */
  function load(urlOrArr) {
    if (urlOrArr instanceof Array) {
      /* Si el desarrollador pasa un array de imágenes
       * bucle a través de cada valor y llamar a nuestra imagen
       * cargador en ese archivo de imagen
       */
      urlOrArr.forEach(function (url) {
        _load(url);
      });
    } else {
      /* El desarrollador no pasó un array a esta función,
       * asume que el valor es una cadena y llama a nuestro cargador de imágenes
       * directamente.
       */
      _load(urlOrArr);
    }
  }

  /* Esta es nuestra función privada del cargador de imágenes, es
   * llamada por la función pública del cargador de imágenes.
   */
  function _load(url) {
    if (resourceCache[url]) {
      /* Si esta URL ha sido cargada previamente existirá dentro de
       * nuestra matriz resourceCache. Simplemente devuelva esa imagen en lugar de
       * recargar la imagen.
       */
      return resourceCache[url];
    } else {
      /* Esta URL no ha sido cargada previamente y no está presente
       * en nuestra caché; tendremos que cargar esta imagen.
       */
      var img = new Image();
      img.onload = function () {
        /* Una vez que nuestra imagen se ha cargado correctamente, añadirlo a nuestra caché
         * para que podamos simplemente devolver esta imagen si el desarrollador
         * intenta cargar este archivo en el futuro.
         */
        resourceCache[url] = img;

        /* Una vez que la imagen está cargada y almacenada en caché,
         * llamar a todos los onReady() callbacks que hemos definido.
         */
        if (isReady()) {
          readyCallbacks.forEach(function (func) {
            func();
          });
        }
      };

      /*Establece el valor inicial de la caché en false, esto cambiará cuando
       * se llame al manejador del evento onload de la imagen. Finalmente, apunta
       * el atributo src de la imagen a la URL pasada.
       */
      resourceCache[url] = false;
      img.src = url;
    }
  }

  /* Esto es utilizado por los desarrolladores para agarrar referencias a las imágenes que saben
   * han sido cargadas previamente. Si una imagen se almacena en caché, esto funciona
   * lo mismo que llamar a load() en esa URL.
   */
  function get(url) {
    return resourceCache[url];
  }

  /* Tsta función determina si todas las imágenes que se han solicitado
   * para su carga se han cargado correctamente.
   */
  function isReady() {
    var ready = true;
    for (var k in resourceCache) {
      if (resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
        ready = false;
      }
    }
    return ready;
  }

  /* Esta función añadirá una función a la pila de llamadas de retorno que se llama
   * cuando todas las imágenes solicitadas se hayan cargado correctamente.
   */
  function onReady(func) {
    readyCallbacks.push(func);
  }

  /* Este objeto define las funciones de acceso público disponibles para
   * desarrolladores mediante la creación de un objeto global Resources.
   */
  window.Resources = {
    load: load,
    get: get,
    onReady: onReady,
    isReady: isReady,
  };
})();

("use strict");
// - - - - VARIABLES - - - -
// Personajes
const allEnemies = [];
const allKids = [];
const allFish = [];

// contador
let fishCounter = 0;
let timing;
let time = false;
let secCounter = 0;
let minCounter = 0;

// pantallas
let won;
let lost;
let pauseScreen;

// sonidos y música
const mainMusic = new Audio(
  "./fondo.mp3"
);
mainMusic.loop = true;
const fishSound = new Audio(
  "./banana - sound.wav"
);
const hurtSound = new Audio(
  "./hurt.mp3"
);
const babySound = new Audio(
  "./baby.wav"
);
const gameOverSound = new Audio(
  "./game_over.mp3"
);
const winSound = new Audio(
  "./win.wav"
);
const allSounds = [
  mainMusic,
  fishSound,
  hurtSound,
  babySound,
  gameOverSound,
  winSound,
];
let muted = false;

// - - - - Personaje - - - -
// clase de personaje básico
class Character {
  constructor(sprite, x, y) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 - 30);
  }
}

// - - - - jugdor - - - -
class Player extends Character {
  constructor(sprite, x, y) {
    super(sprite, x, y);
    this.grab = false;
    this.fish = false;
    this.life = 3;
  }

  // comprobar colisión con enemigos - perder vida y pez si el jugador lo estaba sujetando
  update() {
    allEnemies.forEach(
      function (enemy) {
        if (
          (enemy.direction === -1 &&
            enemy.x + enemy.length - 0.2 >= this.x &&
            enemy.x < this.x + 1 - 0.4 &&
            this.y === enemy.y) ||
          (enemy.direction === 1 &&
            enemy.x <= this.x + 1 - 0.4 &&
            enemy.x + enemy.length - 0.4 > this.x &&
            this.y === enemy.y)
        ) {
          this.x = 3;
          this.y = 1;
          this.life--;
          this.sprite = "./mono.png";
          if (this.grab === true) {
            this.fish.x = this.fish.originalX;
            this.fish.y = this.fish.originalY;
            this.fish.sprite = "./bananasmall.png";
            this.fish.grabbed = false;
            this.grab = false;
          }
          if (this.life < 0) {
            loose();
          } else {
            hurtSound.play();
            looseLife();
          }
        }
      }.bind(this)
    );
  }

  // mover al jugador en la pantalla de juego
  handleInput(key) {
    if (key === "up" && this.y - 1 > 0) {
      this.y--;
      if (this.y === 1) {
        this.sprite = "./mono.png";
      } else {
        this.sprite = "./mono.png";
      }
      if (this.grab === true) {
        this.fish.y--;
        this.fish.sprite = "./bananasmall.png";
      }
    } else if (
      key === "down" &&
      this.y + 1 <= Math.round(document.querySelector("canvas").height / 115)
    ) {
      this.y++;
      if (this.y === 2) {
        this.sprite = "./mono.png"; //moverhacia arriba
      } else {
        this.sprite = "./mono.png"; // mover hacia abajo
      }
      if (this.grab === true) {
        this.fish.y++;
        this.fish.sprite = "./bananasmall.png";
      }
    } else if (key === "left" && this.x - 1 >= 0) {
      this.x--;
      if (this.y === 1) {
        this.sprite = "./mono.png";
      } else {
        this.sprite = "./mono.png"; // moverse hacia la izquierda
      }
      if (this.grab === true) {
        this.fish.x--;
        if (this.y === 1) {
          this.fish.sprite = "./bananasmall.png";
        } else {
          this.fish.sprite = "./bananasmall.png";
        }
      }
    } else if (
      key === "right" &&
      this.x + 1 < Math.round(document.querySelector("canvas").width / 100)
    ) {
      this.x++;
      if (this.y === 1) {
        this.sprite = "./mono.png";
      } else {
        this.sprite = "./mono.png";
      }
      if (this.grab === true) {
        this.fish.x++;
        if (this.y === 1) {
          this.fish.sprite = "./mono.png"; //Moverse hacia la derecha
        } else {
          this.fish.sprite = "./bananasmall.png";
        }
      }
    }
    // agarra un banano si está en la misma manzana
    if (
      this.grab === false &&
      allFish.find((a) => a.x === this.x && a.y === this.y) !== undefined
    ) {
      let grabbedFish = allFish.find((a) => a.x === this.x && a.y  === this.y);
      this.grab = true;
      grabbedFish.grabbed = true;
      this.fish = grabbedFish;
      fishSound.play();
    }
    // pasa un banano a la cría de mono si está debajo de uno sin banano
    if (this.grab === true && this.y === 1) {
      let kidAbove = allKids.find((b) => b.x === this.x);
      if (kidAbove.hasFish === false) {
        babySound.play();
        kidAbove.hasFish = true;
        this.fish.y--;
        this.grab = false;
        kidAbove.jump = true;
        this.fish.grabbed = false;
        fishCounter++;
        // si se pasan 7 bananos al bebé mono, el jugador gana
        if (fishCounter === 7) {
          disable();
          setTimeout(function () {
            win();
          }, 1000);
        }
      }
    }
  }
}

// - - - INPUT HANDLER - - - -
// Escucha las pulsaciones de teclas y las envía al método Player.handleInput()
function movement(e) {
  const allowedKeys = {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
  };
  player.handleInput(allowedKeys[e.keyCode]);
}

// - - - - Enemigos - - - -
// nuestro jugador debe evitar
class Enemy extends Character {
  constructor(sprite, direction, length, speed, min, max) {
    super(sprite);
    this.direction = direction === "right" ? -1 : 1;
    this.x =
      direction === "right"
        ? this.direction * (Math.floor(Math.random() * 10) + 3)
        : Math.floor(Math.random() * 10) + 7;
    this.y = Math.floor(Math.random() * (max - min + 1) + min);
    this.length = length;
    this.originalSpeed = speed;
    this.speed = speed;
    this.min = min;
    this.max = max;
  }

  // Actualizar la posición del enemigo
  // Parámetro: dt, un delta de tiempo entre ticks
  update(dt) {
    this.x = this.x + -1 * this.direction * this.speed * dt;
    if (
      (this.direction === -1 && this.x > 7) ||
      (this.direction === 1 && this.x < -2)
    ) {
      this.x =
        this.direction === -1
          ? this.direction * (Math.floor(Math.random() * 10) + 3)
          : Math.floor(Math.random() * 12) + 9;
      this.y = Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
    }
  }
}

// - - - - babe mono to feed - - - -
class Kids extends Character {
  constructor(sprite, x, y) {
    super(sprite, x, y);
    this.hasFish = false;
    this.fishNumber = "none";
    this.jump = false;
  }

  update() {
    if (this.jump === true) {
      this.y -= 0.5;
      player.fish.y -= 0.5;
      let k = this;
      setTimeout(function () {
        k.y += 0.5; // cuando se le da una banana a el mono con el signo (-) se va, con el signo(+) se queda
        player.fish.y += 0.5;
      }, 200);
      this.jump = false;
    }
  }
}

// - - - - Coleccion de bananos- - - -
class Fish extends Character {
  constructor(sprite, x, y) {
    super(sprite, x, y);
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.grabbed = false;
  }
}

// barajar la matriz para aleatorizar la posición x del banano
let fishX = shuffle([0, 1, 2, 3, 4, 5, 6]);

// - - - - FUNCIÓN SHUFFLE para aleatorizar el orden de los caracteres - - - -
function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// - - - - Inicializar personajes
// jugador
let player = new Player("./mono.png", 3, 1);

// enemigos
for (let i = 0; i < 7; i++) {
  let e = new Enemy("./Serpiente.png", "right", 2, 2, 3, 6);
  allEnemies.push(e);
}
let polar = new Enemy("./Jaguar.png", "left", 2, 1, 2, 2);
allEnemies.push(polar);

// bebe mono
for (let j = 0; j < 7; j++) {
  let k = new Kids("./babymono.png", j, 0);
  allKids.push(k);
}

// banano
for (let k = 0; k < 7; k++) {
  let f = new Fish(
    "./bananasmall.png",
    fishX[k],
    Math.floor(Math.random() * (6 - 3 + 1) + 3)
  );
  allFish.push(f);
}

// - - - - Tiempo- - - -
function timer() {
  if (time === false) {
    time = true;
    timing = setInterval(function () {
      secCounter++;
      //añadir un cero inicial a los segundos
      if (String(secCounter).length === 1) {
        secCounter = "0" + secCounter;
      }
      // si segundos llega a 60 reiniciar segundos, incrementar minutos
      if (secCounter === 60) {
        secCounter = "00";
        document.querySelector(".secCount").textContent = secCounter;
        minCounter++;
        // añadir un cero inicial a los minutos
        if (String(minCounter).length === 1) {
          minCounter = "0" + minCounter;
        }
        document.querySelector(".minCount").textContent = minCounter;
      } else {
        document.querySelector(".secCount").textContent = secCounter;
      }
    }, 1000);
  }
}

function stopTimer() {
  if (time === true) {
    clearInterval(timing);
    time = false;
  }
}
// - - - - PANTALLA DE INICIO DE LLAMADA - - - -
start();

// - - - - Pantalla de inicio- - - -
function start() {
  // crear pantalla de inicio

  start = document.createElement("DIV");
  start.classList.add("start");

  // agregar encabezado
  let startHeader = document.createElement("H1");
  startHeader.classList.add("startHeader");
  startHeader.textContent = "¿Bienvenido a Monkey in the Jungle?";

  //agregar informacion del juego
  let instructions = document.createElement("DIV");

  let firstLine = document.createElement("DIV");
  firstLine.classList.add("instruction-div");

  let fishImage = document.createElement("IMG");
  fishImage.classList.add("fish");
  fishImage.src = "./bananasmall.png";

  let firstLineText = document.createElement("H2");
  firstLineText.classList.add("instruction-first-line");
  firstLineText.textContent = "Iniciaras una aventura en la recolecciÓn de bananos para K.O";

  firstLine.append(fishImage, firstLineText);

  let secondLine = document.createElement("H2");
  secondLine.classList.add("instruction-text");
  secondLine.textContent =
    "Tendrás que alimentar a los bebes monos y cuando todos los pequeños tengan una banana, ¡tú ganas!";

  let thirdLine = document.createElement("H2");
  thirdLine.classList.add("instruction-text");
  thirdLine.textContent =
    "Guia rapida : Puedes moverte con las flechas del teclado (← ↑ → ↓)  pero asegúrate de evitar a los enemigos.";

  instructions.append(firstLine, secondLine, thirdLine);

  // agregar nuevo boton de juego
  let startGameButton = document.createElement("DIV");
  startGameButton.classList.add("startGameButton");
  startGameButton.textContent = "Jugar";

    // acerca de nosotros
    let botonAcerca = document.createElement("DIV");
    botonAcerca.classList.add("startGameButton");
    botonAcerca.textContent = "Menú";


  //añadir comentario de pulsación de tecla
  let startGameComment = document.createElement("H3");
  startGameComment.classList.add("startGameComment");
  startGameComment.textContent = "Pulse cualquier tecla";

  start.append(startHeader, instructions, startGameButton, startGameComment, botonAcerca);

  document.body.appendChild(start);

  // desactivar el movimiento
  disable();

  // escuchadores de eventos para el nuevo botón del juego - clic o pulsación de tecla
  startGameButton.onclick = function () {
    startGame();
  };

  botonAcerca.onclick = function () {
    acerca();
  };

  window.addEventListener("keypress", acerca, false);

  function acerca(){
    
    window.location.href = "inicio.html"
  
  }

  window.addEventListener("keypress", startGame, false);

}



// - - - - Iniciar juego - - - -
function startGame() {
  // enable movement
  enable();

  // quitar la pantalla de inicio
  start.style.display = "none";
  start.remove();

  // iniciar temporizador
  timer();

  // iniciar música principal
  mainMusic.play();
}

// - - - -CONTADOR DE VIDAS EN EL PANEL DE ESTADÍSTICAS - - - -
function looseLife() {
  // eliminar una imagen de corazón
  let child = document.getElementsByClassName("heart")[player.life];
  child.parentNode.removeChild(child);
}

// - - - -FUNCIÓN DE REINICIO- - - -
const restartButton = document.querySelector(".restart");

restartButton.onclick = function () {
  restart();
};

// función de reinicio, inicia una nueva partida
function restart() {
  window.removeEventListener("keypress", restart);

  // iniciar musica principañ
  mainMusic.play();

  // reiniciar temporizador
  stopTimer();

  document.querySelector(".secCount").textContent = "00";
  document.querySelector(".minCount").textContent = "00";

  // reorganizar la posición x del banano
  fishX = shuffle([0, 1, 2, 3, 4, 5, 6]);

  // aleatorizar la posición de los bananos
  allFish.forEach(function (fish, index) {
    fish.x = fishX[index];
    fish.y = Math.floor(Math.random() * (6 - 3 + 1) + 3);
    fish.grabbed = false;
  });

  // reiniciar y aleatorizar enemigos
  allEnemies.forEach(function (enemy) {
    enemy.x =
      enemy.direction === 1
        ? enemy.direction * (Math.floor(Math.random() * 10) + 3)
        : Math.floor(Math.random() * 10) + 7;
    enemy.y = Math.floor(
      Math.random() * (enemy.max - enemy.min + 1) + enemy.min
    );
  });
  polar.x =
    polar.direction === 1
      ? polar.direction * (Math.floor(Math.random() * 10) + 3)
      : Math.floor(Math.random() * 10) + 7;
  polar.y = Math.floor(Math.random() * (polar.max - polar.min + 1) + polar.min);

  // restablecer bebé mono tiene banano
  allKids.forEach(function (kid) {
    kid.hasFish = false;
  });

  //reiniciar vida
  let addLife = player.life === -1 ? 3 : 3 - player.life;
  if (addLife !== 0) {
    let fragment = document.createDocumentFragment();
    for (let m = 0; m < addLife; m++) {
      let heart = document.createElement("IMG");
      heart.classList.add("heart");
      heart.src = "./heart.png";
      fragment.appendChild(heart);
    }
    document.querySelector(".life").appendChild(fragment);
  }

  //quitar la pantalla si se inicia un nuevo juego desde allí
  if (won !== undefined) {
    won.style.display = "none";
    won.remove();
  }

  if (lost !== undefined) {
    lost.style.display = "none";
    lost.remove();
  }

  // reiniciar variables
  secCounter = 0;
  minCounter = 0;
  player.x = 3;
  player.y = 1;
  player.life = 3;
  fishCounter = 0;

  // permitir el movimiento
  enable();

  // iniciar temporizador
  timer();
}

// - - - - boton de pausa  - - - -
const pauseButton = document.querySelector(".pause");
pauseButton.onclick = function () {
  pause();
};

// - - - - pausa - - -
function pause() {
  //limpiar temporizador
  stopTimer();

  // crear pantalla de pausa
  pauseScreen = document.createElement("DIV");
  pauseScreen.classList.add("pause-screen");

  let pauseText = document.createElement("H1");
  pauseText.textContent = "Juego pausado";
  pauseScreen.appendChild(pauseText);

  let pauseComment = document.createElement("H3");
  pauseComment.textContent = "pulse cualquier tecla o haga clic para volver";
  pauseScreen.appendChild(pauseComment);

  document.body.appendChild(pauseScreen);

  // desactivar el movimiento
  disable();

  //para reanudar un juego con una pulsación de tecla o un clic
  window.addEventListener("keydown", resume);
  pauseScreen.onclick = function () {
    resume();
  };
}

// - - - - REANUDAR el juego después de haberlo pausado - - - -
function resume() {
  window.removeEventListener("keypress", resume);

  // ocultar la pantalla de pausa y eliminar
  if (pauseScreen !== undefined) {
    pauseScreen.style.display = "none";
    pauseScreen.remove();
  }

  // permitir el movimiento
  enable();

  // iniciar temporizador de nuevo
  timer();
}

// - - - - funcion de volumen- - - -
const volumeButton = document.querySelector(".volume");

volumeButton.onclick = function () {
  let icon = document.querySelector(".volume-icon").classList;
  // si no está silenciada, pausa la música principal y silencia todos los sonidos
  if (muted === false) {
    mainMusic.pause();
    allSounds.forEach(function (sound) {
      sound.muted = true;
    });
    // cambio de icono
    icon.replace("fa-volume-up", "fa-volume-off");
    muted = true;
  }
  //si está silenciado, inicia la música principal, desactiva los sonidos
  else {
    mainMusic.play();
    allSounds.forEach(function (sound) {
      sound.muted = false;
    });
    // icono de retroceso
    icon.replace("fa-volume-off", "fa-volume-up");
    muted = false;
  }
};

// - - - - DESACTIVAR movimiento - - - -
function disable() {
  // poner a cero la velocidad de los enemigos
  allEnemies.forEach(function (enemy) {
    enemy.speed = 0;
  });
  // eliminar el controlador de entrada del reproductor
  document.removeEventListener("keyup", movement);
}

// - - - - ACTIVAR movimiento - - - -
function enable() {
  // eliminar el receptor de eventos de pulsación de tecla
  window.removeEventListener("keypress", resume);

  // añadir controlador de entrada de nuevo para el jugador
  document.addEventListener("keyup", movement);

  // restablecer la velocidad original de los enemigos
  allEnemies.forEach(function (enemy) {
    enemy.speed = enemy.originalSpeed;
  });
}

// - - - -Pantalla de ganador - - - -
function win() {
  //musica de ganar
  // detenr musica de principa
  mainMusic.pause();
  // tocar musica de jugador
  winSound.play();

  //detener temporizador
  stopTimer();

  // crear pantalla de ganador
  won = document.createElement("DIV");
  won.classList.add("winner");

  // agregar encabezado
  let wonHeader = document.createElement("H1");
  wonHeader.classList.add("winnerHeader");
  wonHeader.textContent = "¡Felicidades!";

  // agregar informacion sobre el juego
  let wonText = document.createElement("H2");
  wonText.classList.add("winnerText");
  let wonInfo =
    minCounter === 0
      ? "Ganaste en " + secCounter + " seg!"
      : "Ganaste en " + minCounter + " min " + secCounter + " seg!";
  wonText.textContent = wonInfo;

  // agregar nuevo boton de juego
  let newGameButton = document.createElement("DIV");
  newGameButton.classList.add("newGameButton");
  newGameButton.textContent = "¿Jugar otra vez?";

  // añadir comentario de tecla
  let newGameComment = document.createElement("H3");
  newGameComment.classList.add("newGameComment");
  newGameComment.textContent = "Pulse cualquier tecla";

  won.append(wonHeader, wonText, newGameButton, newGameComment);

  document.body.appendChild(won);

  // escuchadores de eventos para el nuevo botón del juego - clic o pulsación de tecla
  newGameButton.onclick = function () {
    winSound.pause();
    winSound.currentTime = 0;
    restart();
  };
  window.addEventListener("keypress", restart);
}

// pantalla de game over
function loose() {
  // stop main music
  mainMusic.pause();
  // musica de game over 
  gameOverSound.play();

  // desactivar el movimiento
  disable();

  // limpiar temporizador
  stopTimer();

  // crear pantalla de game over
  lost = document.createElement("DIV");
  lost.classList.add("lost");

  // agregar encabezado
  let lostHeader = document.createElement("H1");
  lostHeader.classList.add("lostHeader");
  lostHeader.textContent = "Juego Terminado";

  // agregar nuevo boton de juego
  let newGameButton = document.createElement("DIV");
  newGameButton.classList.add("newGameButton");
  newGameButton.textContent = "¿Jugar otra vez?";

  // añadir comentario de pulsación de tecla
  let newGameComment = document.createElement("H3");
  newGameComment.classList.add("newGameComment");
  newGameComment.textContent = "Pulse cualquier tecla";

  lost.append(lostHeader, newGameButton, newGameComment);

  document.body.appendChild(lost);

  // escuchadores de eventos para el nuevo botón del juego - clic o pulsación de tecla
  newGameButton.onclick = function () {
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
    restart();
  };
  window.addEventListener("keypress", restart);
}

/* Motor.js
 * Este archivo proporciona la funcionalidad del bucle del juego (actualizar entidades y renderizar),
 * dibuja el tablero inicial en la pantalla, y luego llama a los métodos update y
 * métodos de render en tus objetos jugador y enemigo (definidos en tu app.js).
 *
 * Un motor de juego funciona dibujando toda la pantalla del juego una y otra vez, algo así como
 * como un flipbook que puede haber creado como un niño. Cuando el jugador se mueve a través de
 * la pantalla, puede parecer que sólo esa imagen / personaje se está moviendo o siendo
 * pero no es así. Lo que realmente sucede es que toda la "escena"
 * está siendo dibujada una y otra vez, presentando la ilusión de animación.
 *
 * Este motor hace que el contexto del canvas (ctx) este disponible globalmente para hacer
 * escribir app.js un poco más simple de trabajar.
 */

var Engine = (function (global) {
  /* Predefine las variables que usaremos en este ámbito,
   * crear el elemento canvas, coger el contexto 2D para ese canvas
   * Establece la altura/anchura del elemento canvas y añádelo al DOM.
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    lastTime;

  canvas.width = 710;
  canvas.height = 690;
  doc.body.appendChild(canvas);

  /* Esta función sirve como punto de partida para el propio bucle del juego
   * y se encarga de llamar correctamente a los métodos de actualización y renderizado.
   */
  function main() {
    /* Obtenga nuestra información de delta de tiempo que se requiere si su juego
     * requiere una animación suave. Debido a que cada computadora procesa
     * instrucciones a diferentes velocidades necesitamos un valor constante que
     * sea el mismo para todos (independientemente de la velocidad de su
     * ordenador) - ¡viva el tiempo!
     */
    var now = Date.now(),
      dt = (now - lastTime) / 1000.0;

    /* Llama a nuestras funciones update/render, pasa el delta de tiempo a
     * nuestra función de actualización, ya que puede ser utilizado para la animación suave.
     */
    update(dt);
    render();

    /* Establece nuestra variable lastTime que se utiliza para determinar el delta de tiempo
     * para la próxima vez que se llame a esta función.
     */
    lastTime = now;

    /* Utiliza la función requestAnimationFrame del navegador para llamar a esta
     * función de nuevo tan pronto como el navegador sea capaz de dibujar otro fotograma.
     */
    win.requestAnimationFrame(main);
  }

  /* Esta función realiza algunas configuraciones iniciales que sólo deberían ocurrir una vez,
   * en particular el establecimiento de la variable lastTime que se requiere para la
   * bucle de juego.
   */
  function init() {
    reset();
    lastTime = Date.now();
    main();
  }

  /* Esta función es llamada por main (nuestro bucle de juego) y ella misma llama a todas
   * de las funciones que pueden necesitar para actualizar los datos de la entidad. Basado en cómo
   * la detección de colisiones (cuando dos entidades ocupan el mismo espacio, por ejemplo, cuando tu personaje debe morir).
   * mismo espacio, por ejemplo cuando tu personaje debe morir), puede que encuentres
   * la necesidad de añadir una llamada de función adicional aquí. Por ahora, hemos dejado
   * comentada - puede que quieras o no implementar esta
   * funcionalidad de esta manera (podrías simplemente implementar la detección de colisiones
   * en las propias entidades dentro de tu archivo app.js).
   */
  function update(dt) {
    updateEntities(dt);
    // comprobarColisiones();
  }

  /* Esto es llamado por la función de actualización y bucles a través de todos los
   * objetos dentro de su allEnemies matriz como se define en app.js y llamadas
   * sus métodos update(). A continuación, llamará a la función de actualización para su
   * objeto jugador. Estos métodos de actualización deben centrarse exclusivamente en la actualización de
   * los datos/propiedades relacionados con el objeto. Haga su dibujo en su
   * métodos de render.
   */
  function updateEntities(dt) {
    allEnemies.forEach(function (enemy) {
      enemy.update(dt);
    });
    player.update();
    allKids.forEach(function (kid) {
      kid.update(dt);
    });
  }

  /*Esta función inicialmente dibuja el "nivel del juego", luego llamará a
   * la función renderEntities. Recuerde, esta función es llamada cada
   * tick del juego (o bucle del motor del juego) porque así es como funcionan los juegos -
   * son flipbooks creando la ilusión de animación pero en realidad
   * están dibujando toda la pantalla una y otra vez.
   */
  function render() {
    /* Esta matriz contiene la URL relativa a la imagen utilizada
     * para esa fila en particular del nivel de juego.
     */
    var rowImages = [
        "./Pastoverde.png",
        "./Pastoverde.png",
        "./Suelo1.png",
        "./Suelo1.png",
        "./Suelo1.png",
        "./Suelo1.png",
        "./Suelo.png",
      ],
      numRows = 7,
      numCols = 7,
      row,
      col;

    // Antes de dibujar, borra el lienzo existente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Recorre el número de filas y columnas que hemos definido anteriormente
     * y, utilizando la matriz rowImages, dibujar la imagen correcta para que
     * parte de la "cuadrícula
     */
    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* La función drawImage del elemento contextual del lienzo
         * requiere 3 parámetros: la imagen a dibujar, la coordenada x
         * para empezar a dibujar y la coordenada y para empezar a dibujar.
         * Estamos usando nuestros ayudantes Resources para referirnos a nuestras imágenes
         * para que podamos obtener los beneficios de almacenamiento en caché de estas imágenes, ya que
         * las estamos usando una y otra vez.
         */
        ctx.drawImage(Resources.get(rowImages[row]), col * 97, row * 83);
      }
    }

    renderEntities();
  }

  /* Esta función es llamada por la función de render y es llamada en cada juego
   * juego. Su propósito es llamar a las funciones de render que hayas definido
   * en tus entidades enemigas y jugadoras dentro de app.js
   */
  function renderEntities() {
    /* Recorre todos los objetos dentro de la matriz de todos los enemigos y llama a
     * la función de renderizado que hayas definido.
     */

    allKids.forEach(function (kids) {
      kids.render();
    });

    player.render();

    allFish.forEach(function (fish) {
      fish.render();
    });

    allEnemies.forEach(function (enemy) {
      enemy.render();
    });
  }

  /*Esta función no hace nada, pero podría haber sido un buen lugar para
   * manejar los estados de reinicio del juego - tal vez un nuevo menú de juego o una pantalla de game over
   * ese tipo de cosas. Sólo es llamada una vez por el método init().
   */
  function reset() {
    // noop
  }

  /*Seguir adelante y cargar todas las imágenes que sabemos que vamos a necesitar para
   * dibujar nuestro nivel de juego. A continuación, establezca init como el método de devolución de llamada, de modo que cuando
   * todas estas imágenes se cargan correctamente nuestro juego se iniciará.
   */
  Resources.load([
    "./Pastoverde.png",
    "./Suelo.png",
    "./Suelo1.png",
    "./babymono.png",
    "./mono.png",,
    "./Serpiente.png",
    "./Jaguar.png",
    "./bananasmall.png"
    
  ]);
  Resources.onReady(init);

  /* Asignar el objeto de contexto del lienzo a la variable global (la ventana
   * cuando se ejecuta en un navegador) para que los desarrolladores puedan utilizarlo más fácilmente
   * desde dentro de sus archivos app.js.
   */
  global.ctx = ctx;
})(this);
