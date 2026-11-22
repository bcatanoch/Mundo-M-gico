// Primer prototipo: mapa interactivo + juego del Bosque de los Sonidos.
// Utiliza la voz del navegador en español. No requiere conexión a internet.
const screens = document.querySelectorAll('.screen');
const animals = [
  {name:'Vaca',emoji:'🐮',sound:'Muuu, muuu'},
  {name:'Perro',emoji:'🐶',sound:'Guau, guau'},
  {name:'Gato',emoji:'🐱',sound:'Miau, miau'},
  {name:'Pato',emoji:'🦆',sound:'Cuac, cuac'},
  {name:'Oveja',emoji:'🐑',sound:'Bee, bee'},
  {name:'Gallo',emoji:'🐓',sound:'Quiquiriquí'}
];
let voiceEnabled = true;
let round = 0;
let correctAnimal = null;
let answered = false;
let roundOptions = [];
const $ = selector => document.querySelector(selector);
// Una celebración común para las doce actividades. Solo aparece cuando hay logros reales.
let rewardRestart=null;
function showReward(title, detail, onRestart){
  rewardRestart=onRestart;
  $('#reward-title').textContent='¡Aventura completada!';
  $('#reward-subtitle').textContent=title;
  $('#reward-detail').textContent=detail;
  const reward=$('#reward-overlay');
  reward.hidden=false;
  $('#reward-again').focus();
  speak('¡Fantástico! Completaste '+title+'. ¡Ganaste una copa y tres estrellas!');
}
function closeReward(){
  const reward=$('#reward-overlay');
  reward.hidden=true;
}
$('#reward-again').addEventListener('click',()=>{closeReward();if(rewardRestart)rewardRestart();});
$('#reward-home').addEventListener('click',()=>{closeReward();show('home');});

function show(screenId){
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  screens.forEach(s => s.classList.toggle('active',s.id===screenId));
  window.scrollTo({top:0,behavior:'smooth'});
}
function speak(message, rate=.85){
  if(!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'es-ES';
  utterance.rate=rate; utterance.pitch=1.15;
  window.speechSynthesis.speak(utterance);
}
function randomUnique(items,count){return [...items].sort(()=>Math.random()-.5).slice(0,count)}
function startForest(){closeReward();round=0;newRound();show('forest');}
function newRound(){
  answered=false;
  // Restaurar el control de avance al comenzar cada ronda y al reiniciar.
  $('#next-round').textContent='¡Siguiente aventura! ➜';
  if(round>=5){
    $('#feedback').textContent='🎉 ¡Fantástico! ¡Completaste el bosque!';
    $('#choices').innerHTML='<div class="finish" style="grid-column:1/-1;font-size:4rem;padding:25px">🏆🌟🎊</div>';
    $('#round-label').textContent='¡5 rondas completadas!';
    $('#next-round').textContent='🔄 Jugar otra vez';
    $('#next-round').hidden=false;
    showReward('El Bosque de los Sonidos','¡Reconociste los animales en cinco rondas!',startForest);
    return;
  }
  correctAnimal=animals[round%animals.length];
  // Variamos qué animales acompañan a la respuesta correcta.
  roundOptions=randomUnique(animals.filter(a=>a!==correctAnimal),2).concat(correctAnimal)
    .sort(()=>Math.random()-.5);
  $('#choices').replaceChildren(...roundOptions.map(animal=>{
    const card=document.createElement('div');
    card.className='animal-card';
    const preview=document.createElement('button');
    preview.type='button';
    preview.className='animal-choice animal-preview';
    preview.setAttribute('aria-label',`Escuchar el sonido de ${animal.name}`);
    preview.innerHTML=`<span aria-hidden="true">${animal.emoji}</span><strong>${animal.name}</strong><small>🔊 Escuchar</small>`;
    preview.addEventListener('click',()=>speak(animal.sound,.72));
    const select=document.createElement('button');
    select.type='button';
    select.className='animal-select';
    select.textContent='👆 Elegir';
    select.setAttribute('aria-label',`Seleccionar ${animal.name} como respuesta`);
    select.addEventListener('click',()=>pickAnimal(animal,select));
    card.append(preview,select);
    return card;
  }));
  $('#feedback').textContent='👂 Toca los animales para escucharlos. Pulsa «Elegir» debajo del que corresponda a la pista.';
  $('#round-label').textContent=`Ronda ${round+1} de 5`;
  $('#next-round').hidden=true;
}
function pickAnimal(animal,button){
  if(answered)return;
  if(animal===correctAnimal){
    answered=true;
    button.classList.add('correct');
    button.closest('.animal-card').classList.add('correct');
    $('#choices').querySelectorAll('.animal-select').forEach(b=>b.disabled=true);
    $('#feedback').textContent=`🌟 ¡Muy bien! ¡Era ${animal.name.toLowerCase()}!`;
    $('#next-round').hidden=false;
    speak(`¡Muy bien! ¡Era ${animal.name}!`);
  } else {
    button.classList.remove('wiggle');void button.offsetWidth;button.classList.add('wiggle');
    $('#feedback').textContent='💛 ¡Buen intento! Escucha otra vez.';
    speak('¡Buen intento! Escucha otra vez.');
  }
}
document.querySelectorAll('[data-world]').forEach(button=>button.addEventListener('click',()=>{
  const world=button.dataset.world;
  if(world==='forest'){startForest();return;}
  show(world);
}));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.back)));
$('#play-sound').addEventListener('click',()=>{
  if(correctAnimal) speak(correctAnimal.sound,.72);
  else $('#feedback').textContent='Pulsa un mundo para comenzar.';
});
$('#voice-toggle').addEventListener('click',()=>{
  voiceEnabled=!voiceEnabled;
  $('#voice-toggle').textContent=voiceEnabled?'🔊 Voz activada':'🔇 Voz apagada';
  $('#voice-toggle').setAttribute('aria-pressed',String(voiceEnabled));
  if(!voiceEnabled && 'speechSynthesis' in window) speechSynthesis.cancel();
});
$('#next-round').addEventListener('click',()=>{if(round>=5){startForest();}else{round++;newRound();}});


// ===== Mundos 2 y 3: seis juegos interactivos =====
const gameInfo={
  train:{world:'factory',title:'El tren de las sílabas',figure:'🚂',intro:'Escucha la palabra y elige el tren con la cantidad correcta de vagones.'},
  rhymes:{world:'factory',title:'Parejas que riman',figure:'🎴',intro:'Voltea las cartas y encuentra las dos parejas que riman.'},
  monster:{world:'factory',title:'Alimenta al monstruo',figure:'👾',intro:'Escucha lo que quiere comer el monstruo y elige su fruta.'},
  vacuum:{world:'detective',title:'Aspiradora de sonidos',figure:'🫧',intro:'Atrapa todas las burbujas que comienzan con el sonido pedido.'},
  intruder:{world:'detective',title:'¿Cuál es el intruso?',figure:'🕵️',intro:'Dos palabras empiezan igual. Encuentra la que empieza diferente.'},
  complete:{world:'detective',title:'Completa la palabra',figure:'🧩',intro:'Escucha la palabra y escoge el sonido que le falta al final.'}
};
const trainData=[
  {word:'sol',syllables:'sol',count:1,emoji:'☀️'},
  {word:'gato',syllables:'ga - to',count:2,emoji:'🐱'},
  {word:'pelota',syllables:'pe - lo - ta',count:3,emoji:'⚽'},
  {word:'mariposa',syllables:'ma - ri - po - sa',count:4,emoji:'🦋'}
];
const foodData=[
  {word:'manzana',split:'man - za - na',emoji:'🍎',options:[['manzana','🍎'],['plátano','🍌'],['pera','🍐']]},
  {word:'pera',split:'pe - ra',emoji:'🍐',options:[['fresa','🍓'],['pera','🍐'],['uva','🍇']]},
  {word:'plátano',split:'plá - ta - no',emoji:'🍌',options:[['sandía','🍉'],['manzana','🍎'],['plátano','🍌']]},
  {word:'fresa',split:'fre - sa',emoji:'🍓',options:[['pera','🍐'],['fresa','🍓'],['uva','🍇']]}
];
const rhymeData=[
  [['gato','🐱'],['pato','🦆'],['mesa','🪑'],['fresa','🍓']],
  [['queso','🧀'],['hueso','🦴'],['cuna','🛏️'],['luna','🌙']],
  [['ratón','🐭'],['botón','🔘'],['silla','🪑'],['semilla','🌱']],
  [['casa','🏠'],['taza','☕'],['flor','🌼'],['tambor','🥁']]
];
// Cada fila: sonido inicial y cuatro objetos, con los correctos marcados.
const vacuumData=[
  {sound:'sss',items:[['sol','☀️',true],['silla','🪑',true],['luna','🌙',false],['perro','🐶',false]]},
  {sound:'mmm',items:[['mesa','🪑',true],['mano','✋',true],['sapo','🐸',false],['oso','🐻',false]]},
  {sound:'lll',items:[['luna','🌙',true],['león','🦁',true],['pato','🦆',false],['mesa','🪑',false]]},
  {sound:'ppp',items:[['pato','🦆',true],['pelota','⚽',true],['luna','🌙',false],['sol','☀️',false]]}
];
const intruderData=[
  [['oso','🐻',false],['ojo','👁️',false],['mesa','🪑',true]],
  [['sol','☀️',false],['sapo','🐸',false],['luna','🌙',true]],
  [['mano','✋',false],['mesa','🪑',false],['pato','🦆',true]],
  [['luna','🌙',false],['león','🦁',false],['gato','🐱',true]]
];
const completeData=[
  {word:'pato',stem:'pat',emoji:'🦆',correct:'o',options:['o','a']},
  {word:'luna',stem:'lun',emoji:'🌙',correct:'a',options:['o','a']},
  {word:'gato',stem:'gat',emoji:'🐱',correct:'o',options:['a','o']},
  {word:'mesa',stem:'mes',emoji:'🪑',correct:'a',options:['o','a']}
];
let activeGame=null,gameRound=0,gameFinished=false,rhymeOpened=[],rhymePairs=0,vacuumFound=0;
const opts=$('#activity-options');
const promptEl=$('#activity-prompt');
const feedbackEl=$('#activity-feedback');
const nextEl=$('#activity-next');
function updateVoiceButtons(){document.querySelectorAll('[data-voice-toggle]').forEach(b=>{b.textContent=voiceEnabled?'🔊 Voz activada':'🔇 Voz apagada';b.setAttribute('aria-pressed',String(voiceEnabled));});}
document.querySelectorAll('[data-voice-toggle]').forEach(b=>b.addEventListener('click',()=>{
  voiceEnabled=!voiceEnabled;updateVoiceButtons();
  $('#voice-toggle').textContent=voiceEnabled?'🔊 Voz activada':'🔇 Voz apagada';
  $('#voice-toggle').setAttribute('aria-pressed',String(voiceEnabled));
  if(!voiceEnabled && 'speechSynthesis' in window) speechSynthesis.cancel();
}));
// Sincronizar también el interruptor original del Bosque.
$('#voice-toggle').addEventListener('click',()=>updateVoiceButtons());
document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>startGame(b.dataset.game)));
$('#back-to-world').addEventListener('click',()=>show(gameInfo[activeGame].world));
$('#activity-listen').addEventListener('click',()=>sayChallenge());
nextEl.addEventListener('click',()=>{
  if(gameRound>=4){startGame(activeGame);return;}
  gameRound++;renderGameRound();
});
function startGame(id){
  closeReward();
  activeGame=id;gameRound=0;gameFinished=false;
  const info=gameInfo[id];
  $('#activity-title').textContent=info.title;
  $('#activity-world').textContent=info.world==='factory'?'🚂 Mundo 2 · 4 años':'🔎 Mundo 3 · 5 años';
  $('#activity-subtitle').textContent=info.intro;
  show('activity');renderGameRound();
}
function gameButton(label,emoji,onClick,extra=''){
  const button=document.createElement('button');button.className='play-option '+extra;
  const e=document.createElement('span');e.className='big';e.textContent=emoji;
  const t=document.createElement('span');t.textContent=label;
  button.append(e,t);button.addEventListener('click',()=>onClick(button));
  return button;
}
function setOptions(buttons,cssClass=''){opts.className='activity-options '+cssClass;opts.replaceChildren(...buttons);}
function success(button,message){
  if(gameFinished)return;
  gameFinished=true;
  if(button)button.classList.add('correct');
  opts.querySelectorAll('button').forEach(b=>b.disabled=true);
  feedbackEl.textContent='🌟 '+message;
  nextEl.hidden=false;
  speak(message);
}
function gentleTry(button){
  button.classList.remove('wiggle');void button.offsetWidth;button.classList.add('wiggle');
  feedbackEl.textContent='💛 ¡Buen intento! Escucha otra vez.';
  speak('¡Buen intento! Escucha otra vez.');
}
function renderGameRound(){
  gameFinished=false;nextEl.hidden=true;nextEl.textContent='¡Siguiente! ➜';
  feedbackEl.textContent='✨ ¡Escucha y elige!';
  $('#activity-progress').textContent=`Ronda ${gameRound+1} de 4`;
  $('#activity-figure').textContent=gameInfo[activeGame].figure;
  if(gameRound>=4){
    gameFinished=true;promptEl.textContent='¡Completaste este juego!';
    $('#activity-figure').textContent='🏆🌈🎉';
    setOptions([]);feedbackEl.textContent='🌟 ¡Eres increíble! ¡Lo lograste!';
    $('#activity-progress').textContent='¡4 rondas completadas!';
    nextEl.textContent='🔄 Jugar otra vez';nextEl.hidden=false;
    showReward(gameInfo[activeGame].title,'¡Terminaste las cuatro rondas de esta actividad!',()=>startGame(activeGame));return;
  }
  if(activeGame==='train')renderTrain();
  if(activeGame==='monster')renderMonster();
  if(activeGame==='rhymes')renderRhymes();
  if(activeGame==='vacuum')renderVacuum();
  if(activeGame==='intruder')renderIntruder();
  if(activeGame==='complete')renderComplete();
}
function renderTrain(){
  const d=trainData[gameRound];$('#activity-figure').textContent=d.emoji;
  promptEl.textContent='¿Cuántas sílabas tiene «'+d.word+'»?';
  const counts=d.count===4?[2,3,4]:d.count===1?[1,2,3]:[1,2,3];
  setOptions(counts.map(n=>gameButton(`${n} ${n===1?'vagón':'vagones'}`,'🚂 '+('🟨'.repeat(n)),b=>{
    if(n===d.count)success(b,`¡Muy bien! ${d.word} tiene ${n} ${n===1?'sílaba':'sílabas'}.`);
    else gentleTry(b);
  })));sayChallenge();
}
function renderMonster(){
  const d=foodData[gameRound];
  promptEl.textContent='👾 ¡Tengo hambre! ¿Dónde está '+d.word+'?';
  const cards=d.options.map(([word,emoji])=>{
    const card=document.createElement('div');
    card.className='monster-fruit-card';

    // Explorar: al tocar la fruta se escucha su nombre, sin responder al reto.
    const preview=document.createElement('button');
    preview.type='button';
    preview.className='play-option monster-fruit-preview';
    preview.setAttribute('aria-label','Escuchar '+word);
    const picture=document.createElement('span');picture.className='big';picture.textContent=emoji;
    const caption=document.createElement('strong');caption.textContent=word;
    const hint=document.createElement('small');hint.textContent='🔊 Escuchar';
    preview.append(picture,caption,hint);
    preview.addEventListener('click',()=>speak(word,.78));

    // Responder: únicamente este botón comprueba la fruta seleccionada.
    const choose=document.createElement('button');
    choose.type='button';
    choose.className='monster-fruit-choose';
    choose.textContent='👆 Elegir';
    choose.setAttribute('aria-label','Elegir '+word+' como respuesta');
    choose.addEventListener('click',()=>{
      if(gameFinished)return;
      if(word===d.word){
        $('#activity-figure').textContent='👾💖';
        card.classList.add('correct');
        choose.classList.add('correct');
        success(null,'¡Ñam, ñam! ¡Delicioso!');
      }else gentleTry(choose);
    });
    card.append(preview,choose);
    return card;
  });
  setOptions(cards,'monster-fruit-grid');
  feedbackEl.textContent='✨ Toca las frutas para escucharlas y pulsa «Elegir» para responder.';
  sayChallenge();
}
function renderRhymes(){
  rhymeOpened=[];rhymePairs=0;
  promptEl.textContent='Toca dos cartas. ¿Cuáles suenan parecido al final?';
  // Cada pareja está en las posiciones 0-1 y 2-3 antes de mezclar.
  const cards=rhymeData[gameRound].map((entry,index)=>({word:entry[0],emoji:entry[1],pair:Math.floor(index/2)}));
  const shuffled=randomUnique(cards,4);
  setOptions(shuffled.map(card=>{
    const b=gameButton('¿Quién será?','❔',button=>{
      if(gameFinished||button.classList.contains('matched')||rhymeOpened.length>=2||rhymeOpened.some(o=>o.button===button))return;
      button.replaceChildren();
      const emoji=document.createElement('span');emoji.className='big';emoji.textContent=card.emoji;
      const word=document.createElement('span');word.textContent=card.word;
      button.append(emoji,word);button.classList.remove('facedown');
      speak(card.word,.75);rhymeOpened.push({button,card});
      if(rhymeOpened.length===2){
        const [a,b]=rhymeOpened;
        if(a.card.pair===b.card.pair){
          a.button.classList.add('matched');b.button.classList.add('matched');
          rhymeOpened=[];rhymePairs++;
          feedbackEl.textContent='🌟 ¡Esas palabras riman!';
          if(rhymePairs===2)success(null,'¡Encontraste las dos parejas de rimas!');
        }else{
          feedbackEl.textContent='💛 ¡Prueba con otras cartas!';
          // Evitamos temporizadores: se voltean al tocar otra carta o el botón de escuchar.
          a.button.classList.add('selected');b.button.classList.add('selected');
        }
      }
    },'facedown');
    return b;
  }), 'rhyme-grid');
  sayChallenge();
}
function resetMismatchedCards(){
  if(activeGame!=='rhymes'||rhymeOpened.length!==2)return;
  if(rhymeOpened[0].card.pair===rhymeOpened[1].card.pair)return;
  rhymeOpened.forEach(({button})=>{
    button.replaceChildren();
    const question=document.createElement('span');question.className='big';question.textContent='❔';
    const caption=document.createElement('span');caption.textContent='¿Quién será?';
    button.append(question,caption);button.classList.remove('selected');button.classList.add('facedown');
  });rhymeOpened=[];
}
// Al pulsar una nueva carta después de un fallo, se voltean primero las dos anteriores.
opts.addEventListener('click',e=>{
  if(activeGame==='rhymes'&&rhymeOpened.length===2&&rhymeOpened[0].card.pair!==rhymeOpened[1].card.pair){
    const pressed=e.target.closest('button');
    if(pressed && !rhymeOpened.some(o=>o.button===pressed))resetMismatchedCards();
  }
},true);
function renderVacuum(){
  const d=vacuumData[gameRound];vacuumFound=0;
  promptEl.textContent=`¡Atrapa las 2 burbujas que empiezan con /${d.sound[0]}/!`;
  const cards=d.items.map(([word,emoji,correct])=>{
    const card=document.createElement('div');
    card.className='monster-fruit-card vacuum-card';

    const preview=document.createElement('button');
    preview.type='button';
    preview.className='play-option bubble-option monster-fruit-preview';
    preview.setAttribute('aria-label','Escuchar '+word);
    const picture=document.createElement('span');picture.className='big';picture.textContent=emoji;
    const caption=document.createElement('strong');caption.textContent=word;
    const hint=document.createElement('small');hint.textContent='🔊 Escuchar';
    preview.append(picture,caption,hint);
    preview.addEventListener('click',()=>speak(word,.78));

    const choose=document.createElement('button');
    choose.type='button';
    choose.className='monster-fruit-choose';
    choose.textContent='👆 Elegir';
    choose.setAttribute('aria-label','Elegir '+word+' como respuesta');
    choose.addEventListener('click',()=>{
      if(gameFinished||choose.disabled)return;
      if(correct){
        card.classList.add('correct');
        preview.classList.add('popped');
        preview.disabled=true;
        choose.disabled=true;
        choose.classList.add('correct');
        vacuumFound++;
        feedbackEl.textContent=`✨ ¡Muy bien! ${vacuumFound} de 2 burbujas correctas.`;
        if(vacuumFound===2) success(null,'¡Atrapaste todos los sonidos correctos!');
        else speak('¡Muy bien!');
      }else gentleTry(choose);
    });

    card.append(preview,choose);
    return card;
  });
  setOptions(cards,'vacuum-listen-grid');
  feedbackEl.textContent='✨ Toca cada burbuja para escuchar la palabra y pulsa «Elegir» para responder.';
  sayChallenge();
}
function renderIntruder(){
  const items=intruderData[gameRound];
  promptEl.textContent='¿Cuál palabra empieza con un sonido diferente?';
  const cards=items.map(([word,emoji,incorrect])=>{
    const card=document.createElement('div');
    card.className='monster-fruit-card intruder-card';

    const preview=document.createElement('button');
    preview.type='button';
    preview.className='play-option monster-fruit-preview intruder-preview';
    preview.setAttribute('aria-label','Escuchar '+word);
    const picture=document.createElement('span');picture.className='big';picture.textContent=emoji;
    const caption=document.createElement('strong');caption.textContent=word;
    const hint=document.createElement('small');hint.textContent='🔊 Escuchar';
    preview.append(picture,caption,hint);
    preview.addEventListener('click',()=>speak(word,.78));

    const choose=document.createElement('button');
    choose.type='button';
    choose.className='monster-fruit-choose';
    choose.textContent='👆 Elegir';
    choose.setAttribute('aria-label','Elegir '+word+' como respuesta');
    choose.addEventListener('click',()=>{
      if(gameFinished)return;
      if(incorrect){
        card.classList.add('correct');
        choose.classList.add('correct');
        success(null,'¡Sí! '+word+' empieza con un sonido diferente.');
      }else gentleTry(choose);
    });

    card.append(preview,choose);
    return card;
  });
  setOptions(cards,'intruder-listen-grid');
  feedbackEl.textContent='✨ Toca cada tarjeta para escuchar la palabra y pulsa «Elegir» para responder.';
  sayChallenge();
}
function renderComplete(){
  const d=completeData[gameRound];
  $('#activity-figure').textContent=d.emoji;
  promptEl.innerHTML='';
  const line=document.createElement('span');
  line.className='word-blank';
  line.textContent=d.stem+' _';
  promptEl.append('¿Qué sonido falta? ',line);

  const cards=d.options.map(vowel=>{
    const card=document.createElement('div');
    card.className='monster-fruit-card complete-vowel-card';

    // Escuchar nunca selecciona: solamente pronuncia el sonido de la vocal.
    const preview=document.createElement('button');
    preview.type='button';
    preview.className='play-option monster-fruit-preview complete-vowel-preview';
    preview.setAttribute('aria-label','Escuchar sonido '+vowel);
    const picture=document.createElement('span');
    picture.className='big';
    picture.textContent=vowel.toUpperCase();
    const caption=document.createElement('strong');
    caption.textContent='Sonido '+vowel;
    const hint=document.createElement('small');
    hint.textContent='🔊 Escuchar';
    preview.append(picture,caption,hint);
    preview.addEventListener('click',()=>speak(vowel,.75));

    // Elegir comprueba el sonido que completa la palabra.
    const choose=document.createElement('button');
    choose.type='button';
    choose.className='monster-fruit-choose';
    choose.textContent='👆 Elegir';
    choose.setAttribute('aria-label','Elegir sonido '+vowel+' como respuesta');
    choose.addEventListener('click',()=>{
      if(gameFinished)return;
      if(vowel===d.correct){
        line.textContent=d.word;
        card.classList.add('correct');
        choose.classList.add('correct');
        success(null,'¡Exacto! ¡'+d.word+'!');
      }else gentleTry(choose);
    });
    card.append(preview,choose);
    return card;
  });
  setOptions(cards,'complete-vowel-grid');
  feedbackEl.textContent='✨ Toca cada vocal para escucharla y después pulsa «Elegir».';
  sayChallenge();
}

function sayChallenge(){
  if(!activeGame||gameFinished)return;
  if(activeGame==='train'){
    const d=trainData[gameRound];speak(`Escucha. ${d.syllables.replaceAll(' - ','... ')}. ${d.word}. ¿Cuántas sílabas tiene?`,.72);
  }else if(activeGame==='monster'){
    const d=foodData[gameRound];speak(`Tengo hambre. Quiero ${d.split.replaceAll(' - ','... ')}. ¡${d.word}!`,.76);
  }else if(activeGame==='rhymes'){
    resetMismatchedCards();speak('Encuentra las dos parejas de palabras que riman. Toca una carta para escucharla.');
  }else if(activeGame==='vacuum'){
    speak(`Busca las palabras que empiezan con el sonido ${vacuumData[gameRound].sound}. Escucha y toca dos burbujas.`,.76);
  }else if(activeGame==='intruder'){
    speak('Escucha las palabras. '+intruderData[gameRound].map(o=>o[0]).join('... ')+'. ¿Cuál empieza diferente?',.75);
  }else if(activeGame==='complete'){
    const d=completeData[gameRound];speak(`Escucha. ${d.word}. ¿Qué sonido falta al final de ${d.stem}?`,.75);
  }
}


// ===== V4.2: El tren escucha cada vagón sin modificarlo =====
// Las oraciones avanzan únicamente cuando se pulsa «Siguiente frase».
// Cada entrada define una frase coherente con su imagen y su conjugación.
const trainSentences = [
  {who:['Yo','🙋'],verb:['como','🍽️'],thing:['una manzana','🍎'],place:['en casa','🏠']},
  {who:['Ella','👧'],verb:['pinta','🎨'],thing:['una flor','🌼'],place:['en la escuela','🏫']},
  {who:['Ellos','👬'],verb:['leen','📖'],thing:['un cuento','📚'],place:['en casa','🏠']},
  {who:['Nosotros','👫'],verb:['llevamos','🎒'],thing:['una pelota','⚽'],place:['al parque','🌳']},
  {who:['Él','👦'],verb:['toca','🎵'],thing:['un tambor','🥁'],place:['en el patio','🌻']},
  {who:['Tú','🧒'],verb:['miras','👀'],thing:['una mariposa','🦋'],place:['en el jardín','🌷']},
  {who:['Ella','👧'],verb:['come','🍽️'],thing:['una pera','🍐'],place:['en el parque','🌳']},
  {who:['Yo','🙋'],verb:['leo','📖'],thing:['un libro','📗'],place:['en la escuela','🏫']},
  {who:['Nosotros','👫'],verb:['pintamos','🎨'],thing:['una casa','🏠'],place:['en el aula','🏫']},
  {who:['Ellos','👬'],verb:['tocan','🎵'],thing:['una guitarra','🎸'],place:['en el escenario','🎭']},
  {who:['Él','👦'],verb:['lleva','🎒'],thing:['una mochila','🎒'],place:['a la escuela','🏫']},
  {who:['Tú','🧒'],verb:['comes','🍽️'],thing:['una banana','🍌'],place:['en casa','🏠']}
];
const trainKeys=['who','verb','thing','place'];
const trainQuestions={who:'¿Quién?',verb:'¿Qué hace?',thing:'¿Qué?',place:'¿Dónde?'};
let trainIndex=0;
let trainHeard=new Set();
let trainCelebrated=false;
function trainParts(){
  const sentence=trainSentences[trainIndex];
  return trainKeys.map(key=>sentence[key][0]);
}
function trainFullSentence(){
  const parts=trainParts();
  return parts[0]+' '+parts.slice(1).join(' ')+'.';
}
function renderSentence(){
  const sentence=trainSentences[trainIndex];
  for(const key of trainKeys){
    document.getElementById('s-'+key+'-emoji').textContent=sentence[key][1];
    document.getElementById('s-'+key+'-word').textContent=sentence[key][0];
    document.getElementById('s-'+key).setAttribute('aria-label','Escuchar: '+trainQuestions[key]+' '+sentence[key][0]);
  }
  $('#sentence-output').textContent=trainFullSentence();
  $('#sentence-progress').textContent='Frase '+(trainIndex+1)+' de '+trainSentences.length;
}
for(const key of trainKeys){
  $('#s-'+key).addEventListener('click',()=>{
    const word=trainSentences[trainIndex][key][0];
    const question=trainQuestions[key];
    speak(question+' '+word,.78);
    $('#sentence-feedback').textContent='👂 '+question+' '+word+'. ¡Puedes tocarlo otra vez!';
  });
}
function hearSentence(){
  const phrase=trainFullSentence();
  $('#sentence-feedback').textContent='🌟 ¡Escucha la oración completa!';
  speak(phrase,.79);
  trainHeard.add(trainIndex);
  if(trainHeard.size===trainSentences.length && !trainCelebrated){
    trainCelebrated=true;
    showReward('El Tren Constructor de Oraciones','¡Escuchaste las doce oraciones completas!',restartSentenceAdventure);
  }
}
function restartSentenceAdventure(){
  trainIndex=0;trainHeard=new Set();trainCelebrated=false;
  renderSentence();
  $('#sentence-feedback').textContent='🚂 ¡Una nueva aventura! Escucha cada oración.';
  show('sentence-train');
}
$('#s-engine').addEventListener('click',hearSentence);
$('#s-speak').addEventListener('click',hearSentence);
$('#sentence-instructions').addEventListener('click',()=>speak('Toca cada vagón para escuchar primero su pregunta y después su respuesta. Naranja: quién. Verde: qué hace. Azul: qué. Amarillo: dónde. Toca la locomotora para escuchar la oración completa. Cuando termines, pulsa siguiente frase.',.83));
$('#s-next').addEventListener('click',()=>{
  trainIndex=(trainIndex+1)%trainSentences.length;
  renderSentence();
  $('#sentence-feedback').textContent='🚂 ¡Nueva frase! Toca cada vagón para escuchar sus palabras.';
  speak('¡Nueva frase! '+trainFullSentence(),.82);
});
$('#s-reset').addEventListener('click',()=>{
  trainIndex=0;trainHeard=new Set();trainCelebrated=false;
  renderSentence();
  $('#sentence-feedback').textContent='💛 ¡Volvemos a la primera frase!';
  speak('Volvemos a la primera frase.',.83);
});
$('#open-sentence-train').addEventListener('click',()=>{restartSentenceAdventure();});
renderSentence();


// ===== V4.4 · Fábrica de Criaturas y Objetos =====
// Ocho consignas guiadas: cuatro monstruos y cuatro pelotas.
const creatureChallenges = [
 {type:'monster',size:'big',color:'red',mood:'happy',texture:'smooth'},
 {type:'monster',size:'small',color:'blue',mood:'sad',texture:'dots'},
 {type:'ball',size:'small',color:'green',texture:'stripes'},
 {type:'monster',size:'big',color:'purple',mood:'happy',texture:'dots'},
 {type:'ball',size:'big',color:'red',texture:'smooth'},
 {type:'monster',size:'small',color:'green',mood:'happy',texture:'stripes'},
 {type:'ball',size:'small',color:'blue',texture:'dots'},
 {type:'ball',size:'big',color:'purple',texture:'stripes'}
];
const creatureNames = {
 size:{big:'grande',small:'pequeño'},
 color:{red:'rojo',blue:'azul',purple:'morado',green:'verde'},
 mood:{happy:'feliz',sad:'triste'},
 texture:{smooth:'lisa',dots:'con lunares',stripes:'con rayas'}
};
let creatureIndex=0;
let creatureCompleted=new Set();
let creatureCelebrated=false;
// Los valores sin seleccionar son null. Ninguna cualidad aparece marcada al empezar.
let creatureState={type:'monster',size:null,color:null,mood:null,texture:null};
function creatureIsBall(){return creatureState.type==='ball';}
function creatureArticle(){return creatureIsBall()?'La pelota':'El monstruo';}
function creatureForm(word){
  const forms={rojo:'roja',morado:'morada',pequeño:'pequeña'};
  return creatureIsBall()?(forms[word]||word):word;
}
function creatureDesc(){
  const st=creatureState;
  const details=[];
  if(st.size)details.push(creatureForm(creatureNames.size[st.size]));
  if(st.color)details.push(creatureForm(creatureNames.color[st.color]));
  if(!creatureIsBall() && st.mood)details.push(creatureNames.mood[st.mood]);
  let sentence='';
  if(details.length){
    const joined=details.length===1?details[0]:details.slice(0,-1).join(', ')+' y '+details.at(-1);
    sentence=creatureArticle()+' es '+joined+'.';
  }
  if(st.texture){
    const textureSentence=st.texture==='smooth'?'Tiene una textura lisa.':st.texture==='dots'?'Tiene lunares.':'Tiene rayas.';
    sentence+=(sentence?' ':'')+textureSentence;
  }
  return sentence||'Elige las características para crear tu '+(creatureIsBall()?'pelota.':'monstruo.');
}
function creaturePrompt(ch){
  const kind=ch.type==='ball'?'una pelota':'un monstruo';
  const size=ch.type==='ball'?(ch.size==='small'?'pequeña':'grande'):creatureNames.size[ch.size];
  const color=ch.type==='ball'?({red:'roja',purple:'morada'}[ch.color]||creatureNames.color[ch.color]):creatureNames.color[ch.color];
  const mood=ch.type==='monster'?' y '+creatureNames.mood[ch.mood]:'';
  const texture=ch.texture==='smooth'?'con textura lisa':ch.texture==='dots'?'con lunares':'con rayas';
  return '¡Crea '+kind+' '+size+', '+color+mood+', '+texture+'!';
}
function renderCreature(){
  const st=creatureState, element=$('#creature-character');
  element.className=['character','is-'+st.type,'is-'+(st.size||'unset-size'),'is-'+(st.color||'unset-color'),'is-'+(st.mood||'unset-mood'),'is-'+(st.texture||'unset-texture')].join(' ');
  const description=creatureDesc();
  element.setAttribute('aria-label',description);
  $('#creature-description').textContent=description;
  document.querySelectorAll('.creature-control-group').forEach(group=>{
    const attr=group.dataset.attribute;
    group.querySelectorAll('button').forEach(button=>{
      const selected=st[attr]!==null && button.dataset.value===st[attr];
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
  });
  $('#creature-mood-group').hidden=creatureIsBall();
}
function loadCreatureChallenge(){
  const ch=creatureChallenges[creatureIndex];
  // Cada reto empieza sin selecciones: la pista es la meta y la descripción refleja la creación real.
  creatureState={type:ch.type,size:null,color:null,mood:null,texture:null};
  $('#creature-progress').textContent='Reto '+(creatureIndex+1)+' de '+creatureChallenges.length;
  $('#creature-prompt').textContent=creaturePrompt(ch);
  $('#creature-feedback').textContent='💛 Escucha la pista y selecciona cada característica. Ninguna está marcada todavía.';
  $('#creature-next').textContent=creatureIndex===creatureChallenges.length-1?'🔄 Volver al primer reto':'➡️ Siguiente reto';
  renderCreature();
}
$('#open-creature-factory').addEventListener('click',()=>{
  creatureIndex=0;creatureCompleted=new Set();creatureCelebrated=false;loadCreatureChallenge();show('creature-factory');
  speak(creaturePrompt(creatureChallenges[creatureIndex]),.79);
});
$('#creature-controls').addEventListener('click',event=>{
  const button=event.target.closest('button[data-value]');
  if(!button)return;
  const group=button.closest('[data-attribute]');
  if(!group)return;
  const attr=group.dataset.attribute;
  creatureState[attr]=button.dataset.value;
  renderCreature();
  const word=creatureNames[attr][button.dataset.value];
  speak(creatureForm(word),.78);
  $('#creature-feedback').textContent='✨ ¡Así cambia tu creación! Sigue escuchando las pistas.';
});
$('#creature-repeat').addEventListener('click',()=>speak(creaturePrompt(creatureChallenges[creatureIndex]),.77));
$('#creature-describe').addEventListener('click',()=>speak(creatureDesc(),.78));
$('#creature-check').addEventListener('click',()=>{
  const challenge=creatureChallenges[creatureIndex];
  const checks=['size','color','texture',...(challenge.type==='monster'?['mood']:[])];
  const missing=checks.filter(key=>creatureState[key]!==challenge[key]);
  if(!missing.length){
    $('#creature-feedback').textContent='🎉 ¡Genial! ¡Tu creación coincide con todas las pistas!';
    creatureCompleted.add(creatureIndex);
    if(creatureCompleted.size===creatureChallenges.length && !creatureCelebrated){
      creatureCelebrated=true;
      showReward('La Fábrica de Criaturas y Objetos','¡Completaste los ocho retos de creación!',()=>{
        creatureIndex=0;creatureCompleted=new Set();creatureCelebrated=false;
        loadCreatureChallenge();show('creature-factory');
      });
      return;
    }
    speak('¡Genial! ¡Tu creación coincide con todas las pistas! '+creatureDesc(),.8);
  }else{
    const guidance={size:'el tamaño',color:'el color',texture:'la textura',mood:'la emoción'};
    $('#creature-feedback').textContent='💛 ¡Muy bien por intentarlo! Revisa '+missing.map(k=>guidance[k]).join(' y ')+'.';
    speak('¡Buen intento! Revisa '+missing.map(k=>guidance[k]).join(' y ')+'.',.8);
  }
});
$('#creature-next').addEventListener('click',()=>{
  creatureIndex=(creatureIndex+1)%creatureChallenges.length;
  loadCreatureChallenge();
  speak(creaturePrompt(creatureChallenges[creatureIndex]),.8);
});
$('#creature-reset').addEventListener('click',()=>{
  creatureIndex=0;creatureCompleted=new Set();creatureCelebrated=false;loadCreatureChallenge();
  speak('¡Comenzamos de nuevo! '+creaturePrompt(creatureChallenges[0]),.8);
});


// ===== V4.6 · Estudio de Acciones y Movimiento =====
const movementActions={
  run:{verb:'corre',label:'correr',cls:'run',effect:'💨'},
  walk:{verb:'camina',label:'caminar',cls:'walk',effect:'👣'},
  jump:{verb:'salta',label:'saltar',cls:'jump',effect:'✨'},
  eat:{verb:'come',label:'comer',cls:'eat',effect:'🥕'},
  sleep:{verb:'duerme',label:'dormir',cls:'sleep',effect:'💤'}
};
const movementSpeeds={fast:{word:'rápidamente'},slow:{word:'lentamente'}};
const movementPlaces={park:{words:'en el parque',scene:['🌳','🌼']},home:{words:'en casa',scene:['🏡','🪴']},garden:{words:'en el jardín',scene:['🌷','🌻']}};
let movementState={action:null,speed:null,place:null};
let movementSeen=new Set();
let movementCelebrated=false;
const movementExamples=[
  {action:'run',speed:'fast',place:'park'},
  {action:'walk',speed:'slow',place:'garden'},
  {action:'jump',speed:'fast',place:'park'},
  {action:'eat',speed:'slow',place:'home'},
  {action:'sleep',speed:null,place:'home'},
  {action:'walk',speed:'fast',place:'park'},
  {action:'run',speed:'slow',place:'garden'},
  {action:'jump',speed:'slow',place:'home'}
];
let movementExampleIndex=-1;
function movementPhrase(){
  const st=movementState;
  if(!st.action)return 'El conejo está listo para jugar.';
  const verb=movementActions[st.action].verb;
  const how=st.action==='sleep'?'tranquilamente':(st.speed?movementSpeeds[st.speed].word:'');
  return 'El conejo '+verb+(how?' '+how:'')+(st.place?' '+movementPlaces[st.place].words:'')+'.';
}
function renderMovement(){
  const st=movementState;
  document.querySelectorAll('#movement-studio [data-action],#movement-studio [data-speed],#movement-studio [data-place]').forEach(btn=>{
    const selected=(btn.dataset.action&&btn.dataset.action===st.action)||(btn.dataset.speed&&btn.dataset.speed===st.speed)||(btn.dataset.place&&btn.dataset.place===st.place);
    btn.classList.toggle('selected',!!selected);
    btn.setAttribute('aria-pressed',String(!!selected));
  });
  const isSleep=st.action==='sleep';
  $('#movement-speeds').classList.toggle('movement-disabled',isSleep);
  document.querySelectorAll('#movement-speeds button').forEach(b=>b.disabled=isSleep);
  $('#movement-speed-hint').textContent=isSleep?'Al dormir, el conejito descansa tranquilamente.':(!st.action?'Primero elige una acción.':'Elige si lo hace rápido o lento.');
  const scene=$('#movement-scene');
  scene.className='movement-scene place-'+(st.place||'park');
  const placeEl=$('#movement-place-emoji');
  placeEl.innerHTML = movementPlaces[st.place||'park'].scene.map((item,i)=>`<span class="scene-item item-${i+1}">${item}</span>`).join('');
  const character=$('#movement-character');
  character.className='movement-character';
  $('#movement-actor').className='movement-actor action-'+(st.action||'idle')+' speed-'+(st.speed||'slow');
  $('#movement-effect').textContent=st.action?movementActions[st.action].effect:'';
  $('#movement-sentence').textContent=movementPhrase();
  scene.setAttribute('aria-label',movementPhrase());
}
function movementRestart(){
  movementSeen=new Set();movementCelebrated=false;
  movementState={action:null,speed:null,place:null};
  movementExampleIndex=-1;
  $('#movement-feedback').textContent='💛 Elige una acción, una forma de realizarla y un lugar.';
  renderMovement();
}
$('#open-movement-studio').addEventListener('click',()=>{
  movementRestart();show('movement-studio');
  speak('¡Bienvenido al estudio de acciones! Primero toca qué hace el conejo. Después elige cómo lo hace y dónde sucede. Escucha tu oración.',.8);
});
$('#movement-instructions').addEventListener('click',()=>speak('Elige qué hace el conejito. Luego cómo lo hace y dónde sucede. Puedes tocar cada botón para escucharlo y pulsar ver mi acción.',.8));
$('#movement-studio .movement-controls').addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn||btn.disabled)return;
  if(btn.dataset.action){
    movementState.action=btn.dataset.action;
    if(movementState.action==='sleep')movementState.speed=null;
    speak('¿Qué hace? '+movementActions[movementState.action].verb+'.',.8);
  }else if(btn.dataset.speed){
    movementState.speed=btn.dataset.speed;
    speak('¿Cómo lo hace? '+movementSpeeds[movementState.speed].word+'.',.8);
  }else if(btn.dataset.place){
    movementState.place=btn.dataset.place;
    speak('¿Dónde? '+movementPlaces[movementState.place].words+'.',.8);
  }
  renderMovement();
  $('#movement-feedback').textContent='✨ ¡Muy bien! Sigue eligiendo o escucha tu oración.';
});
function movementPlay(){
  if(!movementState.action||!movementState.place||(!movementState.speed&&movementState.action!=='sleep')){
    $('#movement-feedback').textContent='💛 Elige la acción, cómo se realiza y el lugar. Si duerme, no necesita velocidad.';
    speak('¡Vamos! Elige la acción, cómo la hace y el lugar.',.8);
    return;
  }
  const character=$('#movement-actor');
  character.classList.remove('movement-replay');
  void character.offsetWidth;
  character.classList.add('movement-replay');
  const sentence=movementPhrase();
  $('#movement-feedback').textContent='🌟 ¡Fantástico! '+sentence;
  speak(sentence,.8);
  movementSeen.add(movementState.action);
  if(movementSeen.size===Object.keys(movementActions).length && !movementCelebrated){
    movementCelebrated=true;
    showReward('El Estudio de Acciones y Movimiento','¡Viste al conejito realizar sus cinco acciones!',()=>{
      movementRestart();show('movement-studio');
    });
  }
}
$('#movement-play').addEventListener('click',movementPlay);
$('#movement-speak').addEventListener('click',()=>speak(movementPhrase(),.8));
$('#movement-next').addEventListener('click',()=>{
  movementExampleIndex=(movementExampleIndex+1)%movementExamples.length;
  movementState={...movementExamples[movementExampleIndex]};
  renderMovement();
  $('#movement-feedback').textContent='🎬 ¡Nueva escena! Toca las opciones o escucha la frase.';
  speak('¡Nueva escena! '+movementPhrase(),.8);
});
$('#movement-reset').addEventListener('click',()=>{movementRestart();speak('¡Comenzamos de nuevo! Elige una acción.',.8)});


// ===== V4.12: Máquina del Tiempo =====
// Las tres variantes de cada rutina están escritas expresamente para evitar
// conjugaciones incorrectas y mantener clara la referencia temporal.
const timeStories=[
 {emoji:'🌱',intro:'Una niña planta una flor.',past:'Ayer planté una flor.',present:'Hoy planto una flor.',future:'Mañana plantaré una flor.'},
 {emoji:'🍎',intro:'Un niño come una manzana.',past:'Ayer comí una manzana.',present:'Hoy como una manzana.',future:'Mañana comeré una manzana.'},
 {emoji:'🛝',intro:'Una niña juega en el parque.',past:'Ayer jugué en el parque.',present:'Hoy juego en el parque.',future:'Mañana jugaré en el parque.'}
];
const timeOrder=['past','present','future','present','future','past','future','past','present'];
const timeTitles={past:'AYER',present:'HOY',future:'MAÑANA'};

function timeUnderline(sentence){
  const parts=sentence.split(' ');
  const first=parts.shift()||'';
  return `<span class="time-underline">${first}</span>${parts.length?' '+parts.join(' '):''}`;
}

let timeRound=0,timeAnswered=false,timeHeard=new Set();
function timeData(){return {story:timeStories[Math.floor(timeRound/3)],tense:timeOrder[timeRound]};}
function timeStart(){
  timeRound=0;timeRender();show('time-machine');
  speak('¡Bienvenido a la Máquina del Tiempo! Primero escucha los tres portales: ayer, hoy y mañana. Después escucha la oración y marca la respuesta en los recuadros de abajo.',.8);
}
function timeRender(){
  const {story,tense}=timeData();
  timeAnswered=false;timeHeard=new Set();
  const shownSentence=story[tense];
  $('#time-progress').textContent=`Reto ${timeRound+1} de ${timeOrder.length}`;
  $('#time-story-emoji').textContent=story.emoji;
  $('#time-story-text').innerHTML=timeUnderline(shownSentence);
  $('#time-question-text').innerHTML='Escucha la oración y elige cuándo ocurre.';
  $('#time-past').textContent='Ya pasó';
  $('#time-present').textContent='Está pasando';
  $('#time-future').textContent='Pasará después';
  $('#time-guide').textContent='🔊 Primero toca los tres portales y escucha sus oraciones.';
  $('#time-sequence').classList.remove('revealed');
  $('#time-next').hidden=true;
  $('#time-feedback').textContent='💛 Escucha cada portal antes de marcar una respuesta.';
  document.querySelectorAll('.time-portal').forEach(btn=>{
    btn.disabled=false;btn.classList.remove('wrong','right','heard');
    btn.setAttribute('aria-pressed','false');
  });
  document.querySelectorAll('.time-answer').forEach(btn=>{
    btn.disabled=true;btn.classList.remove('wrong','right');
    btn.setAttribute('aria-pressed','false');
  });
}
function timeSay(){
  const {story,tense}=timeData();
  speak('Escucha la oración. '+story[tense]+' ¿Cuándo ocurre? ¿Ayer, hoy o mañana?',.82);
}
$('#open-time-machine').addEventListener('click',timeStart);
$('#time-repeat').addEventListener('click',timeSay);
// Los portales solo enseñan las tres formas de la misma acción: nunca califican respuestas.
document.querySelectorAll('.time-portal').forEach(btn=>btn.addEventListener('click',()=>{
  const chosen=btn.dataset.tense;
  const {story}=timeData();
  speak(timeTitles[chosen]+'. '+story[chosen],.8);
  timeHeard.add(chosen);
  btn.classList.add('heard');
  btn.setAttribute('aria-pressed','true');
  if(timeHeard.size===3){
    $('#time-sequence').classList.add('revealed');
    if(!timeAnswered){
      document.querySelectorAll('.time-answer').forEach(b=>b.disabled=false);
      $('#time-guide').textContent='✅ ¡Ya escuchaste los tres tiempos! Responde abajo.';
      $('#time-feedback').textContent='🌟 Ahora escucha la oración y toca AYER, HOY o MAÑANA en los recuadros.';
    }
  }else if(!timeAnswered){
    $('#time-feedback').textContent=`🔊 ¡Muy bien! Escucha ${3-timeHeard.size} ${3-timeHeard.size===1?'portal más':'portales más'} para descubrir las respuestas.`;
  }
}));
// Las tarjetas inferiores son la única zona donde el niño responde.
document.querySelectorAll('.time-answer').forEach(btn=>btn.addEventListener('click',()=>{
  if(timeAnswered||timeHeard.size!==3)return;
  const {story,tense}=timeData();
  if(btn.dataset.answer!==tense){
    btn.classList.remove('wrong');void btn.offsetWidth;btn.classList.add('wrong');
    $('#time-feedback').textContent='💛 ¡Buen intento! Escucha la oración otra vez y prueba otra respuesta.';
    speak('¡Buen intento! Escucha otra vez la oración y vuelve a elegir.',.8);
    return;
  }
  timeAnswered=true;btn.classList.add('right');btn.setAttribute('aria-pressed','true');
  document.querySelectorAll('.time-answer').forEach(b=>b.disabled=true);
  $('#time-feedback').textContent=`🌟 ¡Muy bien! ${timeTitles[tense]}: ${story[tense]}`;
  $('#time-next').hidden=false;
  $('#time-next').textContent=timeRound===timeOrder.length-1?'🎉 Volver a jugar':'➡️ Siguiente reto';
  speak('¡Muy bien! '+timeTitles[tense]+'. '+story[tense],.8);
  if(timeRound===timeOrder.length-1){
    showReward('La Máquina del Tiempo','¡Reconociste ayer, hoy y mañana en nueve retos!',timeStart);
  }
}));
$('#time-next').addEventListener('click',()=>{
  if(timeRound===timeOrder.length-1){timeStart();return;}
  timeRound++;timeRender();timeSay();
});
$('#time-reset').addEventListener('click',timeStart);


// ===== V4.14: Detectives Preguntones =====
// Preguntas con respuesta visual explícita, incluidas pistas para "por qué".
const questionScenes=[
  {id:'park',title:'🌳 Un día en el parque',story:'En el parque, Ana usa un paraguas porque está lloviendo. Luis juega en el tobogán por la tarde.',items:[
    {id:'ana',emoji:'👧',label:'Ana',x:19,y:55},
    {id:'umbrella',emoji:'☂️',label:'Paraguas',x:22,y:27},
    {id:'slide',emoji:'🛝',label:'Tobogán',x:77,y:65},
    {id:'rain',emoji:'🌧️',label:'Lluvia',x:53,y:21},
    {id:'evening',emoji:'🌇',label:'La tarde',x:79,y:22},
    {id:'luis',emoji:'👦',label:'Luis',x:51,y:70}
  ],questions:[
    {kind:'¿Quién?',icon:'👤',prompt:'¿Quién usa el paraguas?',answer:'ana',success:'Ana usa el paraguas. Ella se protege de la lluvia.'},
    {kind:'¿Qué?',icon:'🔎',prompt:'¿Qué usa Ana?',answer:'umbrella',success:'Ana usa un paraguas.'},
    {kind:'¿Dónde?',icon:'🗺️',prompt:'¿Dónde juega Luis?',answer:'slide',success:'Luis juega en el tobogán.'},
    {kind:'¿Cuándo?',icon:'🕒',prompt:'¿Cuándo juega Luis?',answer:'evening',success:'Luis juega por la tarde.'},
    {kind:'¿Por qué?',icon:'🤔',prompt:'¿Por qué Ana usa paraguas?',answer:'rain',success:'Porque está lloviendo.'}
  ]},
  {id:'farm',title:'🐔 Un día en la granja',story:'En la granja, el granjero alimenta a la gallina con maíz. Lo hace en el corral por la mañana porque la gallina tiene hambre.',items:[
    {id:'farmer',emoji:'👨‍🌾',label:'Granjero',x:20,y:56},
    {id:'corn',emoji:'🌽',label:'Maíz',x:40,y:72},
    {id:'corral',emoji:'🏡',label:'Corral',x:80,y:54},
    {id:'morning',emoji:'🌅',label:'Mañana',x:75,y:20},
    {id:'hungry',emoji:'🍽️',label:'Tiene hambre',x:39,y:25},
    {id:'hen',emoji:'🐔',label:'Gallina',x:58,y:62}
  ],questions:[
    {kind:'¿Quién?',icon:'👤',prompt:'¿Quién alimenta a la gallina?',answer:'farmer',success:'El granjero alimenta a la gallina. Él la cuida.'},
    {kind:'¿Qué?',icon:'🔎',prompt:'¿Qué comida le da el granjero?',answer:'corn',success:'Le da maíz a la gallina.'},
    {kind:'¿Dónde?',icon:'🗺️',prompt:'¿Dónde está la gallina?',answer:'corral',success:'La gallina está en el corral.'},
    {kind:'¿Cuándo?',icon:'🕒',prompt:'¿Cuándo la alimenta?',answer:'morning',success:'La alimenta por la mañana.'},
    {kind:'¿Por qué?',icon:'🤔',prompt:'¿Por qué el granjero alimenta a la gallina?',answer:'hungry',success:'Porque la gallina tiene hambre.'}
  ]},
  {id:'classroom',title:'📚 Una mañana en el salón',story:'En el salón, la profesora lee un cuento con un libro. Lo hace en el rincón de lectura durante la mañana porque los niños quieren escuchar una historia.',items:[
    {id:'teacher',emoji:'👩‍🏫',label:'Profesora',x:18,y:57},
    {id:'book',emoji:'📖',label:'Libro',x:42,y:65},
    {id:'corner',emoji:'🛋️',label:'Rincón de lectura',x:80,y:63},
    {id:'clock',emoji:'🕘',label:'La mañana',x:79,y:20},
    {id:'story',emoji:'💭',label:'Escuchar cuento',x:42,y:22},
    {id:'children',emoji:'👧👦',label:'Niños',x:62,y:49}
  ],questions:[
    {kind:'¿Quién?',icon:'👤',prompt:'¿Quién lee el cuento?',answer:'teacher',success:'La profesora lee el cuento. Ella cuenta una historia.'},
    {kind:'¿Qué?',icon:'🔎',prompt:'¿Qué usa la profesora para leer?',answer:'book',success:'La profesora usa un libro.'},
    {kind:'¿Dónde?',icon:'🗺️',prompt:'¿Dónde lee el cuento?',answer:'corner',success:'Lee en el rincón de lectura.'},
    {kind:'¿Cuándo?',icon:'🕒',prompt:'¿Cuándo leen el cuento?',answer:'clock',success:'Leen el cuento durante la mañana.'},
    {kind:'¿Por qué?',icon:'🤔',prompt:'¿Por qué la profesora lee el cuento?',answer:'story',success:'Porque los niños quieren escuchar una historia.'}
  ]}
];
let questionRound=0,questionAnswered=false;
const questionTotal=questionScenes.reduce((n,s)=>n+s.questions.length,0);
function questionCurrent(){
  let r=questionRound;
  for(const scene of questionScenes){if(r<scene.questions.length)return {scene,question:scene.questions[r]};r-=scene.questions.length;}
  return {scene:questionScenes[0],question:questionScenes[0].questions[0]};
}
function questionSay(){const {question}=questionCurrent();speak(question.prompt+'. Toca la imagen que muestra la respuesta.',.78);}
function questionTellStory(){const {scene}=questionCurrent();speak(scene.story,.8);}
function questionStart(){questionRound=0;questionRender();show('question-detectives');speak('¡Bienvenidos, detectives! Primero escucha la historia. Luego escucha la pregunta y toca la respuesta en la imagen.',.8);}
function questionRender(){
  const {scene,question}=questionCurrent();questionAnswered=false;
  $('#questions-scene-title').textContent=scene.title;
  $('#questions-progress').textContent=`Pregunta ${questionRound+1} de ${questionTotal}`;
  $('#questions-story-text').textContent=scene.story;
  $('#questions-kind-emoji').textContent=question.icon;
  $('#questions-prompt').textContent=question.prompt;
  $('#questions-feedback').textContent='💛 Escucha y toca la imagen correcta.';
  $('#questions-next').hidden=true;
  const picture=$('#questions-picture');picture.className='questions-picture scene-'+scene.id;
  picture.replaceChildren(...scene.items.map(item=>{
    const btn=document.createElement('button');btn.type='button';btn.className='question-object';
    btn.style.setProperty('--qx',item.x+'%');btn.style.setProperty('--qy',item.y+'%');
    btn.setAttribute('aria-label',item.label);
    const emoji=document.createElement('span');emoji.className='question-object-emoji';emoji.setAttribute('aria-hidden','true');emoji.textContent=item.emoji;
    const label=document.createElement('span');label.className='question-object-label';label.textContent=item.label;
    btn.append(emoji,label);
    btn.addEventListener('click',()=>{
      if(questionAnswered)return;
      if(item.id===question.answer){
        questionAnswered=true;btn.classList.add('correct');
        picture.querySelectorAll('.question-object').forEach(b=>b.disabled=true);
        $('#questions-feedback').textContent='🌟 ¡Muy bien! '+question.success;
        const next=$('#questions-next');next.hidden=false;next.textContent=questionRound===questionTotal-1?'🎉 Volver a jugar':'➡️ Siguiente pregunta';
        speak('¡Muy bien! '+question.success,.8);
        if(questionRound===questionTotal-1){
          showReward('Los Detectives Preguntones','¡Resolviste las quince preguntas!',questionStart);
        }
      }else{
        btn.classList.remove('wrong');void btn.offsetWidth;btn.classList.add('wrong');
        $('#questions-feedback').textContent='💛 ¡Buen intento! Escucha la pregunta otra vez.';
        speak('Ese dibujo es '+item.label+'. Inténtalo otra vez.',.8);
      }
    });
    return btn;
  }));
}
$('#open-question-detectives').addEventListener('click',questionStart);
$('#questions-instructions').addEventListener('click',()=>speak('Escucha la historia y la pregunta. Busca la respuesta entre las imágenes. Si te equivocas, puedes intentarlo de nuevo.',.8));
$('#questions-story-audio').addEventListener('click',questionTellStory);
$('#questions-repeat').addEventListener('click',questionSay);
$('#questions-next').addEventListener('click',()=>{
  if(!questionAnswered)return;
  if(questionRound===questionTotal-1){questionStart();return;}
  questionRound++;questionRender();
  const {scene,question}=questionCurrent();
  speak('Nueva pregunta. '+(question.kind==='¿Quién?'?scene.story+'. ':'')+question.prompt,.8);
});
$('#questions-reset').addEventListener('click',questionStart);
