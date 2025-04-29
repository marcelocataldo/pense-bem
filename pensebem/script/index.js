import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOhf84gzU4d8UdaUtW55KLkTxM-d-wrsU",
    authDomain: "projeto-pense-bem.firebaseapp.com",
    projectId: "projeto-pense-bem",
    storageBucket: "projeto-pense-bem.appspot.com",
    messagingSenderId: "11385909843",
    appId: "1:11385909843:web:eab4448c1b8bf4026dcca6"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let jogadorAtual, livroAtual, questAtual = 0, vidas = 3;
let erros = [], acertos = 0, respondidas = 0;
let gravacao = [], gravando = false, tempoInicioGravacao, intervaloReproducao;

const notas = {
    'do': 261.63, 're': 293.66, 'mi': 329.63, 'fa': 349.23,
    'sol': 392.00, 'la': 440.00, 'si': 493.88,
    'doM': 523.25, 'reM': 587.33
  };

const gabarito = {
  '011': { respostas: ["d","b","c","a","d","b","b","a","a","a","d","b","b","b","b","c","c","d","d","b","a","c","d","b","c","a","a","c","b","a"], total: 30 },
  '012': { respostas: ["d","b","d","a","c","a","a","d","d","c","a","d","b","a","c","b","b","a","d","b","a","b","a","b","c","c","d","d","a","c"], total: 30 },
  '013': { respostas: ["a","c","d","b","a","d","b","c","d","c","d","d","d","a","a","b","a","c","b","a","a","b","a","d","c","c","d","d","c","a","d"], total: 31 }
};

function fadeOut(elemento, tempo = 100) {
  let opacidade = 1;
  const intervalo = 50;
  const reducao = intervalo / tempo;

  const fade = setInterval(() => {
    if (opacidade <= 0) {
      clearInterval(fade);
      elemento.style.display = "none";
    }
    elemento.style.opacity = opacidade;
    opacidade -= reducao;
  }, intervalo);
}

function fadeIn(elemento, tempo = 100, display = "flex") {
  let opacidade = 0;
  const intervalo = 50;
  const aumento = intervalo / tempo;

  elemento.style.display = display;
  elemento.style.opacity = opacidade;

  const fade = setInterval(() => {
    if (opacidade >= 1) {
      clearInterval(fade);
    }
    elemento.style.opacity = opacidade;
    opacidade += aumento;
  }, intervalo);
}

function playSound(id, volume = 1.0) {
    const sound = document.getElementById(id);
    sound.volume = volume;
    sound.currentTime = 0; 
    sound.play().catch(e => console.log("Erro ao tocar som:", e));
  }
  
  function playLoginSound() {
    playSound("sound-login", 0.7);
  }
  
  function playAcertoSound() {
    playSound("sound-acerto", 0.5);
  }
  
  function playErroSound() {
    playSound("sound-erro", 0.5);
  }
  
  function playGameOverSound() {
    playSound("sound-gameover", 0.7);
  }

function iniciarJogo() {
    const cadastroJogador = document.getElementById('jogadorCad').value.trim();
    const cadastroLivro = document.getElementById('livroCad').value.trim();
    
    if (!cadastroJogador || cadastroJogador.length < 3) {
        alert("Nome deve ter pelo menos 3 caracteres!");
        return;
    }
    
    if (!cadastroLivro || !gabarito[cadastroLivro]) {
        alert("Número de livro inválido!");
        return;
    }

    jogadorAtual = cadastroJogador;
    livroAtual = cadastroLivro;
    questAtual = 0;
    vidas = 3;
    erros = [];
    acertos = 0;
    
    document.getElementById('jogadorAtual').textContent = jogadorAtual;
    document.getElementById('livroAtual').textContent = livroAtual;
    document.getElementById('questaoAtual').textContent = 1;
    
    resetJogo();
    
    fadeOut(document.getElementById("login"), 100);
    setTimeout(() => fadeIn(document.getElementById("game"), 100, "flex"), 100);
    playLoginSound();
}

function verificarResposta(letra) {
    const respostaCorreta = gabarito[livroAtual].respostas[questAtual];
    
    if (respostaCorreta === letra) {
        playAcertoSound();
        acertos++;
    } else {
        playErroSound();
        vidas--;
        erros.push(questAtual + 1);
        atualizarVidas(); 
    }

    questAtual++;
    respondidas++;
    
    document.getElementById('questaoAtual').textContent = questAtual + 1;
    
    if (questAtual === gabarito[livroAtual].total || vidas === 0) {
        playGameOverSound();
        gameOverScreen();
    }
}

function resetJogo() {
    questAtual = 0;
    vidas = 3;
    erros = [];
    acertos = 0;
    respondidas = 0;
    gravacao = [];
    
    document.getElementById('questaoAtual').textContent = 1;

    const coracoes = document.querySelectorAll('.coracao');
    coracoes.forEach(coracao => {
        coracao.src = 'img/heart.png';
        coracao.style.display = 'inline';
        coracao.style.animation = 'none';
    });
}

function atualizarVidas() {
    const coracoes = document.querySelectorAll('.coracao');
    
    coracoes.forEach((coracao, index) => {
        if (index < vidas) {
            coracao.src = 'img/heart.png';
        } else {
            coracao.src = 'img/heart2.png';
        }
    });
    
    if (vidas > 0) {
        const ultimoCoracaoCheio = coracoes[vidas - 1];
        ultimoCoracaoCheio.style.animation = 'tremer 0.5s';
        setTimeout(() => {
            ultimoCoracaoCheio.style.animation = 'none';
        }, 500);
    }
}

function gameOverScreen() {
  const totalPerguntas = gabarito[livroAtual].total;
  const gameOver = document.getElementById("gameOverScreen");
  
  document.getElementById('progressoQuest').textContent = questAtual;
  document.getElementById('totalPerguntas').textContent = totalPerguntas;
  document.getElementById('acertos').textContent = acertos;
  document.getElementById('questsErrada').textContent = erros.join(', ') || 'Nenhuma!';
  
  fadeIn(gameOver, 100, "flex");
  updateLeaderboard();
}

function tocarNota(nota, duracao = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscilador = audioContext.createOscillator();
  const ganho = audioContext.createGain();

  oscilador.type = 'sine';
  oscilador.frequency.value = notas[nota];
  
  ganho.gain.setValueAtTime(0, audioContext.currentTime);
  ganho.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
  ganho.gain.linearRampToValueAtTime(0, audioContext.currentTime + duracao);

  oscilador.connect(ganho);
  ganho.connect(audioContext.destination);
  
  oscilador.start();
  oscilador.stop(audioContext.currentTime + duracao);

  if (gravando) {
    gravacao.push({
      nota,
      tempo: Date.now() - tempoInicioGravacao
    });
  }
}

async function updateLeaderboard() {
    try {
      await addDoc(collection(db, "leaderboard"), {
        player: jogadorAtual,
        correct: Number(acertos) || 0, 
        total: Number(respondidas) || 0, 
        book: livroAtual,
        timestamp: new Date().getTime()
      });
      console.log("Pontuação salva!");
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  }

  async function displayLeaderboard() {
    const tbody = document.getElementById('leaderboardEntries');
    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    
    try {
      const q = query(
        collection(db, "leaderboard"), 
        orderBy("correct", "desc")
      );
      
      const snapshot = await getDocs(q);
      tbody.innerHTML = '';
      
      let playerPosition = -1;
      const allPlayers = [];
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        allPlayers.push(data);
        if (data.player === jogadorAtual && data.book === livroAtual) {
          playerPosition = index + 1;
        }
      });
      
      const topPlayers = allPlayers.slice(0, 10);
      
      topPlayers.forEach((data, index) => {
        tbody.innerHTML += `
          <tr ${data.player === jogadorAtual && data.book === livroAtual ? 'class="current-player"' : ''}>
            <td>${index + 1}</td>
            <td>${data.player}</td>
            <td>${data.correct}</td>
            <td>${data.total}</td>
            <td>${data.book}</td>
          </tr>
        `;
      });

      if (playerPosition > 10) {
        const playerData = allPlayers.find(p => p.player === jogadorAtual && p.book === livroAtual);
        if (playerData) {
          tbody.innerHTML += `
            <tr class="current-player">
              <td>${playerPosition}</td>
              <td>${playerData.player}</td>
              <td>${playerData.correct}</td>
              <td>${playerData.total}</td>
              <td>${playerData.book}</td>
            </tr>
          `;
        }
      }
      
    } catch (e) {
      console.error("Erro ao carregar:", e);
      tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar</td></tr>';
    }
  }


document.getElementById('loginEnter').addEventListener('click', iniciarJogo);
document.getElementById('resetBtn').addEventListener('click', resetJogo);

document.getElementById('btna').addEventListener('click', () => verificarResposta('a'));
document.getElementById('btnb').addEventListener('click', () => verificarResposta('b'));
document.getElementById('btnc').addEventListener('click', () => verificarResposta('c'));
document.getElementById('btnd').addEventListener('click', () => verificarResposta('d'));

document.getElementById('do').addEventListener('click', () => tocarNota('do'));
document.getElementById('re').addEventListener('click', () => tocarNota('re'));
document.getElementById('mi').addEventListener('click', () => tocarNota('mi'));
document.getElementById('fa').addEventListener('click', () => tocarNota('fa'));
document.getElementById('sol').addEventListener('click', () => tocarNota('sol'));
document.getElementById('la').addEventListener('click', () => tocarNota('la'));
document.getElementById('si').addEventListener('click', () => tocarNota('si'));
document.getElementById('doM').addEventListener('click', () => tocarNota('doM'));
document.getElementById('reM').addEventListener('click', () => tocarNota('reM'));
document.getElementById('gravar').addEventListener('click', function() {
  gravando = !gravando;
  
  if (gravando) {
    this.style.backgroundColor = 'red';
    gravacao = [];
    tempoInicioGravacao = Date.now();
    this.textContent = 'Parar';
  } else {
    this.style.backgroundColor = '';
    this.textContent = 'Gravar';
  }
});

document.getElementById('reproduzir').addEventListener('click', function() {
  if (!gravacao.length) return;
  
  this.style.backgroundColor = 'green';
  setTimeout(() => this.style.backgroundColor = '', gravacao[gravacao.length-1].tempo || 0);
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let ultimoTempo = 0;

  if (intervaloReproducao) clearTimeout(intervaloReproducao);

  gravacao.forEach((item, index) => {
    const atraso = index === 0 ? 0 : item.tempo - gravacao[index-1].tempo;
    
    intervaloReproducao = setTimeout(() => {
      const osc = audioContext.createOscillator();
      const ganho = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = notas[item.nota];
      ganho.gain.setValueAtTime(0, audioContext.currentTime);
      ganho.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
      ganho.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      osc.connect(ganho);
      ganho.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.5);
    }, ultimoTempo + atraso);
    
    ultimoTempo += atraso;
  });
});

document.getElementById("leaderboardBtn").addEventListener("click", () => {
  displayLeaderboard();
  fadeOut(document.getElementById("gameScreen"), 100);
  fadeIn(document.getElementById("leaderboardScreen"), 100);
});

document.getElementById("leaderboardBack").addEventListener("click", () => {
  fadeOut(document.getElementById("leaderboardScreen"), 100);
  fadeIn(document.getElementById("gameScreen"), 100);
});

document.getElementById("gameOverReset").addEventListener("click", () => {
  fadeOut(document.getElementById("gameOverScreen"), 500);
  iniciarJogo();
});

document.getElementById("gameOverLogin").addEventListener("click", () => {
  window.location.reload();
});

window.onload = function() {
  Particles.init({
    connectParticles: true,
    color: '#ffffff',
    selector: '.bg'
  });
};