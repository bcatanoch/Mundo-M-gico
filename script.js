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
function startForest(){round=0;newRound();show('forest');}
function newRound(){
  answered=false;
  if(round>=5){
    $('#feedback').textContent='🎉 ¡Fantástico! ¡Completaste el bosque!';
    $('#choices').innerHTML='<div class="finish" style="grid-column:1/-1;font-size:4rem;padding:25px">🏆🌟🎊</div>';
    $('#round-label').textContent='¡5 rondas completadas!';
    $('#next-round').textContent='🔄 Jugar otra vez';
    $('#next-round').hidden=false;
    speak('¡Fantástico! ¡Completaste el bosque de los sonidos!');
    return;
  }
  correctAnimal=animals[round%animals.length];
  // Variamos qué animales acompañan a la respuesta correcta.
  roundOptions=randomUnique(animals.filter(a=>a!==correctAnimal),2).concat(correctAnimal)
    .sort(()=>Math.random()-.5);
  $('#choices').replaceChildren(...roundOptions.map(animal=>{
    const button=document.createElement('button');
    button.className='animal-choice';
    button.setAttribute('aria-label',animal.name);
    button.innerHTML=`<span aria-hidden="true">${animal.emoji}</span>${animal.name}`;
    button.addEventListener('click',()=>pickAnimal(animal,button));
    return button;
  }));
  $('#feedback').textContent='¡Escucha y elige el animal!';
  $('#round-label').textContent=`Ronda ${round+1} de 5`;
  $('#next-round').hidden=true;
}
function pickAnimal(animal,button){
  if(answered)return;
  if(animal===correctAnimal){
    answered=true;
    button.classList.add('correct');
    $('#choices').querySelectorAll('button').forEach(b=>b.disabled=true);
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
    speak('¡Felicidades! ¡Completaste la aventura!');return;
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
  const d=foodData[gameRound];promptEl.textContent='👾 ¡Tengo hambre! ¿Dónde está '+d.word+'?';
  setOptions(d.options.map(([word,emoji])=>gameButton(word,emoji,b=>{
    if(word===d.word){$('#activity-figure').textContent='👾💖';success(b,'¡Ñam, ñam! ¡Delicioso!');}
    else gentleTry(b);
  })));sayChallenge();
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
  setOptions(d.items.map(([word,emoji,correct])=>gameButton(word,emoji,b=>{
    if(b.disabled||gameFinished)return;
    if(correct){b.classList.add('popped');b.disabled=true;vacuumFound++;
      feedbackEl.textContent=`✨ ¡Muy bien! ${vacuumFound} de 2 burbujas.`;
      if(vacuumFound===2)success(null,'¡Atrapaste todos los sonidos correctos!');
      else speak('¡Muy bien!');
    }else gentleTry(b);
  },'bubble-option')));sayChallenge();
}
function renderIntruder(){
  const items=intruderData[gameRound];
  promptEl.textContent='¿Cuál palabra empieza con un sonido diferente?';
  setOptions(items.map(([word,emoji,incorrect])=>gameButton(word,emoji,b=>{
    if(incorrect)success(b,'¡Sí! '+word+' empieza con un sonido diferente.');
    else gentleTry(b);
  })));sayChallenge();
}
function renderComplete(){
  const d=completeData[gameRound];$('#activity-figure').textContent=d.emoji;
  promptEl.innerHTML='';
  const line=document.createElement('span');line.className='word-blank';line.textContent=d.stem+' _';
  promptEl.append('¿Qué sonido falta? ',line);
  setOptions(d.options.map(vowel=>gameButton('Sonido '+vowel,vowel.toUpperCase(),b=>{
    if(vowel===d.correct){line.textContent=d.word;success(b,'¡Exacto! ¡'+d.word+'!');}
    else gentleTry(b);
  })));sayChallenge();
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
