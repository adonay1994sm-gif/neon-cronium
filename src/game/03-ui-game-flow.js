  const CLASSIC_EQUIPMENT_KEY = "neonCronium.flightEquipment.v1";

  function classicChapterControlsLocked() {
    return Boolean(classicChapterView?.opening?.controlsLocked);
  }

  function classicChapterEvent(event) {
    if(event.type!=="transmission")return;
    flightTransmission={speaker:event.speaker,speakerId:event.speakerId,text:event.text,remaining:event.duration||4.6};
    flightHudSignature="";syncClassicFlightHud();
  }

  function signalClassicChapter(name) {
    if(!classicChapterStory)return;
    classicChapterStory.signal(name,classicChapterEvent);
    classicChapterView=classicChapterStory.snapshot();
  }

  function syncClassicChapterPresentation() {
    const opening=classicChapterView?.opening;
    const active=Boolean(state==="playing"&&opening?.active);
    document.body.classList.toggle("chapter-opening",active&&opening.controlsLocked);
    // Al acabar (o saltar) la animación del inicio, la nave entra desde abajo.
    const locked=classicChapterControlsLocked();
    if(classicFilmLocked&&!locked){classicShipEntry=.9;if(classicChapterView&&isSectorRun())rememberIntroSeen();}
    classicFilmLocked=locked;
    ui.chapterSkip?.classList.toggle("hidden",!active||!opening.canSkip);
    if(ui.chapterSkip)ui.chapterSkip.disabled=state!=="playing";
    syncClassicMissileHud();
  }

  function syncClassicMissileHud() {
    if(!ui.classicMissile)return;
    const count=classicSalvageState?.missileAmmo??0;
    ui.classicMissileCount.textContent=String(count);
    ui.classicMissile.disabled=state!=="playing"||classicChapterControlsLocked()||count<=0||Boolean(atlasBoss?.disabled);
    ui.classicMissile.setAttribute("aria-label",`Lanzar misil especial. ${count} disponibles. Reposición en C9.`);
  }

  function loadClassicSalvage() {
    if(!classicSalvageLedger)classicSalvageLedger=NeonCampaign.createScrapLedger({storage});
    const result=classicSalvageLedger.load();
    classicSalvageState=result.ok?result.state:null;
    if(!result.ok&&!classicSalvageWarningShown) {
      classicSalvageWarningShown=true;
      toast("La bodega no se puede guardar. Conservamos sus datos y bloqueamos las compras para evitar pérdidas.");
    }
    if(result.ok)projectClassicSalvageUpgrades();
    return result.ok;
  }

  // A purchase owns its entitlement in the same atomic record as its price.
  // The old equipment record is only a replayable projection, never the money
  // transaction. A failed projection can be retried without charging again.
  function projectClassicSalvageUpgrades() {
    const upgrades=classicSalvageState?.upgrades||[];
    let projected=true;
    if(upgrades.includes("twin-preparation")&&classicEquipment.recoveredTwin&&!classicEquipment.twinPrepared) {
      projected=persistClassicEquipment(NeonCampaign.prepareClassicTwin(classicEquipment));
    }
    const workshop=NeonCampaign.classicWorkshopState(classicSalvageState);
    const equipment=NeonCampaign.syncClassicWorkshopWeapons(classicEquipment,classicSalvageState);
    if(JSON.stringify(equipment)!==JSON.stringify(classicEquipment))projected=persistClassicEquipment(equipment)&&projected;
    if(classicWeapons){
      NeonCampaign.setClassicRechargeInterval(classicWeapons,workshop.rechargeSeconds);
      NeonCampaign.setClassicWeaponTuning(classicWeapons,workshop.weaponRanks);
    }
    const capacity=workshop.reserveCapacity;
    if(capacity>classicHullReserveCapacity)classicHullReserve+=capacity-classicHullReserveCapacity;
    classicHullReserveCapacity=capacity;
    classicHullReserve=Math.min(classicHullReserve,capacity);
    return projected;
  }

  function applyClassicSalvageShield() {
    // Kept as the existing checkpoint call site: changing a stage must neither
    // refill reinforcement nor create a timed shield.
    powers.shield=0;
    updatePowerHud();
  }

  function beginClassicSalvageRun(resuming=false) {
    classicSalvageRunId=null;classicSalvageEnemySequence=0;
    if(!loadClassicSalvage())return false;
    const scope=classicSideVoyage?`voyage:${classicSideVoyage.ficha.id}`:`classic:${currentLevel+1}`;
    const canResume=resuming&&classicSalvageState.activeRun?.scope===scope;
    const result=classicSalvageLedger.beginRun({scope,fresh:Boolean(classicSalvageState.activeRun&&!canResume)});
    if(!result.ok)return false;
    classicSalvageRunId=result.runId;classicSalvageState=result.state;
    return true;
  }

  function buyClassicC9Upgrade(sku) {
    if(!classicSalvageLedger)return false;
    if(sku==="twin-preparation"&&(!classicEquipment.recoveredTwin||classicEquipment.twinPrepared||classicEquipment.unlocked.includes("twin")))return false;
    const sequence=classicSalvageState?.missileRefillSequence||0;
    const result=classicSalvageLedger.purchase({transactionId:sku==="missile-refill"?`c9:missiles:${sequence+1}`:`c9:${sku}`,sku});
    if(result.state)classicSalvageState=result.state;
    if(!result.ok&&result.reason!=="already-owned") {
      if(ui.c9PurchaseStatus)ui.c9PurchaseStatus.textContent=result.reason==="insufficient-funds"
        ? `Faltan ${result.missing} de chatarra. Recupera restos de las naves enemigas.`
        : result.reason==="prerequisite-required" ? "Instala primero el módulo anterior de esta rama."
        : "No se ha confirmado el pago. La mejora no se aplica; puedes reintentarlo.";
      updateClassicDock();return false;
    }
    const projected=projectClassicSalvageUpgrades();
    if(ui.c9PurchaseStatus)ui.c9PurchaseStatus.textContent=!projected
      ? "Pago guardado. El montaje queda pendiente; al reabrir C9 se reintentará sin cobrar otra vez."
      : sku==="twin-preparation" ? "Emisor preparado. Atlas sigue custodiando la autorización del segundo cañón."
      : sku==="hull-reinforcement" ? "Placas integradas. La reserva de casco ahora admite 45 puntos, sin temporizador."
      : sku==="missile-refill" ? "Misiles cargados. Cada unidad repuesta cuesta 6 de chatarra."
      : NeonCampaign.SCRAP_UPGRADES[sku] ? `${NeonCampaign.SCRAP_UPGRADES[sku].label}: ${NeonCampaign.SCRAP_UPGRADES[sku].description}`
      : "Mejora instalada y guardada.";
    shipPresentationSignature="";flightHudSignature="";updateClassicDock();updateAmmoHud();hud();
    if(projected)uiSound("confirm");
    return projected;
  }

  function spawnClassicScrap(target) {
    if(!target||target.salvageDropped||!classicSalvageRunId||!classicSalvageState)return null;
    if(target.salvageRunId&&target.salvageRunId!==classicSalvageRunId)return null;
    const boss=target.bossSalvage===true;
    const wreckage=["debris","satellite"].includes(target.type);
    // Enemigos de Gaia y hordas no llevan piloto clásico, pero también sueltan chatarra.
    const enemy=target.classicScout||target.gaiaEnemy||target.hordeUnit;
    if(!boss&&((!enemy&&!wreckage)||target.classicScoutProjectile||target.guardianProjectile))return null;
    const enemyType=boss?(target.salvageRole||"guardian-atlas"):wreckage?target.type:target.salvageRole||target.classicScout?.role||"scout";
    const amount=NeonCampaign.rewardForEnemy(enemyType);
    if(!amount)return null;
    const stage=classicFlightView?.stageId||`${currentLevel+1}.0`;
    const dropId=target.salvageDropId||`${stage}:enemy:${classicSalvageEnemySequence++}`;
    target.salvageDropId=dropId;target.salvageDropped=true;
    if(classicSalvageState.activeRun?.claimed.some(receipt=>receipt.id===dropId))return null;
    if(items.some(item=>item.salvagePickup&&item.runId===classicSalvageRunId&&item.dropId===dropId))return null;
    if(!boss&&items.filter(item=>item.salvagePickup&&!item.bossSalvage).length>=32)return null;
    const item={id:`salvage:${classicSalvageRunId}:${dropId}`,type:"salvage",salvagePickup:true,
      bossSalvage:boss,runId:classicSalvageRunId,dropId,enemyType,amount,
      x:target.x,y:target.y,baseX:target.x,r:18,s:65,vx:0,vy:65,life:boss?4:14,
      rot:0,rs:.12,p:0,phase:0,amp:0,alpha:1};
    items.push(item);return item;
  }

  function collectClassicScrap(item) {
    if(!item?.salvagePickup||!classicSalvageLedger)return false;
    const result=classicSalvageLedger.claimDrop({runId:item.runId,dropId:item.dropId,enemyType:item.enemyType});
    if(!result.ok) {
      if(!item.salvageSaveWarning){item.salvageSaveWarning=true;toast("No se ha guardado la chatarra. La recogida se reintentará sin duplicarla.");}
      return false;
    }
    classicSalvageState=result.state;
    if(!result.duplicate){uiSound("pickup-scrap",item.x);toast(`+${result.amount} chatarra`);}
    return true;
  }

  // Meteoritos dirigidos del sector (plan F3b): sin pasillo marcado; avisos en el borde.
  let classicAimedRain=null,classicMeteorWarnings=[];
  function resetClassicCometShower() {
    classicCometShower=null;classicCometCorridor=null;classicAimedRain=null;classicMeteorWarnings=[];
    const view=classicFlightView,comets=view&&NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.comets;
    if(!comets)return;
    if(comets==="aimed"){classicAimedRain=NeonCampaign.createAimedMeteorRain({seed:view.stageNumber*811,width:W,height:H});return;}
    classicCometShower=NeonCampaign.createCometShower({width:W,height:H,seed:view.stageNumber*811,
      shipWidth:SHIP_VISUAL.assemblySize,shipSideClearance:119*SHIP_VISUAL.classicScale,
      stageId:view.stageId,elapsed:view.stageElapsed});
  }

  // Lluvia en curso: desde el aviso hasta que sale el último cometa. Mientras
  // dura, el pasillo seguro se dibuja y las patrullas no disparan (J04).
  function cometShowerActive() {
    if(!classicCometCorridor)return false;
    if((classicFlightView?.stageElapsed??Infinity)<classicCometCorridor.until||items.some(item=>item.showerComet))return true;
    classicCometCorridor=null;return false;
  }

  function recoverCampaignCompletion() {
    if(!completionJournal)completionJournal=NeonCampaign.createCompletionJournal({storage,keys:KEYS,
      levelCount:LEVELS.length,checkpointKey:NeonCampaign.CHRONOS_VOYAGE_KEY,
      validateCheckpoint:value=>normalizeClassicVoyageRecord(value)!==null,
      equipmentKey:CLASSIC_EQUIPMENT_KEY,
      validateEquipment:value=>NeonCampaign.normalizeClassicEquipment(value)!==null});
    const result=completionJournal.recover();
    completionPersistenceBlocked=!result.ok;
    if(result.ok) {
      const recovered=NeonCampaign.normalizeClassicEquipment(storage.getJSON(CLASSIC_EQUIPMENT_KEY,null));
      if(recovered)classicEquipment=recovered;
    }
    if(!result.ok)toast("Guardado pendiente: no se sobrescribirá. Reintenta cuando el almacenamiento esté disponible.");
    return result.ok;
  }

  function setupClassicFlight() {
    loadClassicVoyage();
    const raw = storage.getRaw(CLASSIC_EQUIPMENT_KEY);
    if (raw !== null) {
      try {
        const value = JSON.parse(raw);
        const normalized = NeonCampaign.normalizeClassicEquipment(value);
        if (!normalized) throw new Error("Invalid equipment");
        classicEquipment = normalized;
      } catch {
        const backupKey = CLASSIC_EQUIPMENT_KEY + ":invalid-backups";
        const previous = storage.getJSON(backupKey, []);
        const backups = Array.isArray(previous) ? previous.filter(value => typeof value === "string") : [];
        classicEquipmentWritable = backups.includes(raw) || storage.setJSON(backupKey, [...backups, raw]);
      }
    }
    loadClassicSalvage();
    document.body.classList.add("flight-mode");
    const mount = document.createElement("div");
    mount.innerHTML = `<div id="flightHud" class="flight-hud cockpit-flight hidden">
      <section id="flightRoute" class="flight-route hidden" aria-label="Trayecto espacial"><div><small id="flightDestination">CHRONOS → GAIA NOVA</small><b id="flightStage">Recupera el CRONIUM</b></div><progress id="flightDistance" max="1" value="0" aria-label="Recorrido hasta el destino"></progress></section>
      <p id="flightObjective" class="flight-comms" role="status" aria-live="polite" data-active="false"></p>
      <button id="flightWeapon" class="flight-weapon cockpit-control" type="button"><small id="flightWeaponDamage">DAÑO ×1</small><b id="flightWeaponName">PULSO</b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg></button>
      <div id="flightPilotHint" class="flight-pilot-hint" aria-hidden="true"><span></span>DESLIZA PARA MOVER</div>
      <div id="flightPilotStick" class="flight-pilot-stick hidden" aria-hidden="true"><span id="flightPilotKnob"></span></div>
      </div>
      <div id="flightDock" class="overlay" role="dialog" aria-modal="true" aria-labelledby="c9Title"><section class="panel flight-dock cockpit-dialog"><header class="c9-header cockpit-section-head"><span class="chapter-face" data-actor="mira" aria-hidden="true"></span><div><small>C9 · MIRA</small><h2 id="c9Title">Taller de a bordo</h2></div></header><div class="c9-preview"><canvas id="flightDockCanvas" width="384" height="300" aria-label="Nave con su armamento instalado"></canvas><p id="flightDockStatus"></p></div><aside class="cockpit-ledger" aria-label="Bodega de la nave"><small>CHATARRA DISPONIBLE</small><p id="c9Balance" class="c9-wallet" aria-label="Chatarra disponible">0 chatarra</p></aside><div class="c9-upgrades"><button id="flightInstallTwin" class="primary" type="button"><span class="c9-upgrade-art" data-upgrade="emitter" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>PREPARAR EMISOR · 24 CHATARRA</b><small>Segundo cañón · autorización tras Atlas</small></span></button><button id="c9BuyShield" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="hull" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REFUERZO DE CASCO · 30 CHATARRA</b><small>15 puntos de blindaje adicionales</small></span></button><button id="c9BuyMissiles" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="missiles" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REPONER MISILES</b><small>18 de daño · 6 de chatarra por unidad</small></span></button><button id="c9BuyCoolant" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="coolant" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REFRIGERACIÓN · 45 CHATARRA</b><small>Recuperación de energía un 25 % más rápida</small></span></button></div><p id="c9PurchaseStatus" class="c9-purchase-status" role="status"></p><div class="c9-actions"><button id="flightDockContinue" class="secondary" type="button">VOLVER A PILOTAR</button><button id="flightDockHome" class="secondary" type="button">GUARDAR Y VOLVER AL MENÚ</button></div></section></div>`;
    canvas.parentElement.append(mount);
    const chapterControls=document.createElement("div");
    chapterControls.innerHTML=`<button id="classicC9" class="classic-c9 cockpit-control hidden" type="button" aria-label="Abrir taller C9; pausa el viaje"><b>C9</b><span>TALLER</span></button><button id="chapterSkip" class="chapter-skip hidden" type="button">OMITIR INTRODUCCIÓN →</button><button id="classicMissile" class="classic-missile cockpit-control hidden" type="button" aria-label="Lanzar misil"><span class="missile-symbol" aria-hidden="true"></span><span>MISIL <b id="classicMissileCount">3</b></span></button>`;
    canvas.parentElement.append(chapterControls);
    ui.classicC9=$("classicC9");ui.classicC9.onclick=()=>openClassicDock("hud");
    ui.chapterSkip=$("chapterSkip");ui.classicMissile=$("classicMissile");ui.classicMissileCount=$("classicMissileCount");
    ui.chapterSkip.onclick=skipChapterIntro;
    // Missile pointer/touch ownership is installed with the other flight
    // controls in 08-loop-input-bootstrap, including accessible click fallback.
    for (const id of ["flightHud","flightRoute","flightDestination","flightStage","flightWeapon","flightWeaponName","flightWeaponDamage","flightDistance","flightObjective","flightPilotHint","flightPilotStick","flightPilotKnob","flightDock","flightDockCanvas","flightDockStatus","flightInstallTwin","c9Balance","c9BuyShield","c9BuyMissiles","c9BuyCoolant","c9PurchaseStatus"]) ui[id] = $(id);
    const calibrate=document.createElement("button");calibrate.id="flightCalibrateLance";calibrate.className="secondary";calibrate.type="button";
    ui.flightInstallTwin.after(calibrate);ui.flightCalibrateLance=calibrate;
    const loadout = document.createElement("div");
    loadout.id="flightLoadoutChoices";loadout.className="flight-loadout-choices";
    loadout.setAttribute("role","group");loadout.setAttribute("aria-label","Arma al salir de C9");
    ui.flightDockStatus.closest('.c9-preview').after(loadout);
    setupClassicWorkshopSections(loadout,calibrate);
    for(const [type,weapon] of Object.entries(NeonCampaign.CLASSIC_WEAPON_RULES.types)) {
      const button=document.createElement("button");button.type="button";button.dataset.flightLoadout=type;
      button.className="cockpit-loadout-card";
      const roles={pulse:"Precisión · una carga",twin:"Dos pulsos centrados",lance:"Perfora dos objetivos",scatter:"Tres pulsos · corta distancia",needle:"Perfora tres objetivos"};
      const art={pulse:"emitter",twin:"emitter",lance:"needle",scatter:"scatter",needle:"needle"};
      button.innerHTML=`<span class="c9-upgrade-art" data-upgrade="${art[type]}" aria-hidden="true"></span><span class="cockpit-loadout-copy"><b>${weapon.label} ×${weapon.damageMultiplier}</b><small>${roles[type]}</small><em data-loadout-state></em></span>`;
      button.onclick=()=>{
        if(!classicEquipment.unlocked.includes(type))return;
        if(persistClassicEquipment({...classicEquipment,selected:type})) {
          updateClassicDock();syncClassicFlightHud();uiSound("weapon-switch");
        }
      };
      loadout.append(button);
    }
    ui.flightWeapon.onclick = () => {
      if (classicEquipment.unlocked.length < 2) { toast("El segundo cañón se desbloquea al vencer a Atlas"); return; }
      const selected = classicEquipment.unlocked[(classicEquipment.unlocked.indexOf(classicEquipment.selected)+1)%classicEquipment.unlocked.length];
      if (persistClassicEquipment({...classicEquipment, selected})) { uiSound("weapon-switch"); syncClassicFlightHud(); }
    };
    $("beaconBuy").onclick=()=>buySectorBeacon();$("beaconSkip").onclick=()=>closeSectorBeacon();
    ui.flightInstallTwin.onclick = () => buyClassicC9Upgrade("twin-preparation");
    ui.c9BuyShield.onclick=()=>buyClassicC9Upgrade("hull-reinforcement");
    ui.c9BuyMissiles.onclick=()=>buyClassicC9Upgrade("missile-refill");
    ui.c9BuyCoolant.onclick=()=>buyClassicC9Upgrade("coolant-feed");
    // Historical Lanza owners keep their weapon; the workshop no longer grants
    // two power tiers for free before the first real guardian.
    calibrate.onclick=()=>{
      if (!classicEquipment.unlocked.includes("lance")) return;
      if (persistClassicEquipment({...classicEquipment,selected:"lance"})) updateClassicDock();
    };
    $("flightDockContinue").onclick = closeClassicDock;
    ui.flightDock.addEventListener("keydown",event=>{
      if(!ui.flightDock.classList.contains("show"))return;
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();closeClassicDock();return;}
      if(event.key!=="Tab")return;
      const controls=[...ui.flightDock.querySelectorAll("button:not(:disabled)")].filter(node=>!node.classList.contains("hidden")&&node.getClientRects().length);
      const first=controls[0],lastControl=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();lastControl?.focus();}
      else if(!event.shiftKey&&document.activeElement===lastControl){event.preventDefault();first?.focus();}
    });
    $("flightDockHome").onclick = goHome;
    const workshop = document.createElement("button"); workshop.id="openFlightDock"; workshop.className="secondary hidden";
    workshop.type="button"; workshop.textContent="FORJA C9"; workshop.onclick=()=>openClassicDock("menu");
    ui.menu.querySelector(".menu-actions")?.append(workshop);
    const stages = document.createElement("section");
    stages.id="chronosStages"; stages.className="chronos-stages cockpit-stage-list hidden";
    stages.innerHTML='<small>CHRONOS → GAIA · TRAMOS DEL VIAJE</small><div id="chronosStageGrid" class="chronos-stage-grid"></div><p id="chronosStagesNote"></p>';
    // La lista va encima del bloque de botones, que queda fijo abajo del panel.
    ($("briefingActions") || $("launch")).before(stages);
    syncClassicFlightHud();
  }

  function setupClassicWorkshopSections(loadout,calibrate) {
    const panel=ui.flightDock.querySelector('.flight-dock');
    $('c9Title').textContent='FORJA C9';
    panel.querySelector('.c9-header small').textContent='MIRA · INGENIERÍA DE A BORDO';
    ui.classicC9.querySelector('span').textContent='FORJA';
    ui.classicC9.setAttribute('aria-label','Abrir Forja C9. Pausa el viaje.');
    const oldGrid=panel.querySelector('.c9-upgrades');
    const nav=document.createElement('nav');nav.className='c9-navigation';nav.setAttribute('aria-label','Secciones de la Forja');
    const sections={};
    for(const [id,label,description] of [
      ['arsenal','01 · ARSENAL','Elige cómo quieres combatir. Comprar no equipa automáticamente.'],
      ['systems','02 · EVOLUCIÓN','Cada conexión requiere el módulo anterior. Tú eliges la rama.'],
      ['supplies','03 · SUMINISTROS','Tres misiles de reserva. Pagas únicamente las unidades que faltan.']]) {
      const section=document.createElement('section');section.id=`c9-${id}`;section.className='c9-section cockpit-workshop-section';
      const heading=document.createElement('h3');heading.textContent=label;heading.className='cockpit-section-title';
      const help=document.createElement('p');help.className='c9-section-help';help.textContent=description;
      const grid=document.createElement('div');grid.className='c9-upgrades';
      section.append(heading,help,grid);sections[id]={section,grid};
      const link=document.createElement('button');link.type='button';link.textContent=label.slice(5);link.setAttribute('aria-controls',section.id);
      link.onclick=()=>{
        for(const other of nav.querySelectorAll('button'))other.removeAttribute('aria-current');
        link.setAttribute('aria-current','true');
        section.scrollIntoView?.({behavior:settings.reduceEffects?'instant':'smooth',block:'start'});
      };
      if(id==='arsenal')link.setAttribute('aria-current','true');
      nav.append(link);oldGrid.before(section);
    }
    ui.c9Balance.closest('.cockpit-ledger').after(nav);
    sections.arsenal.grid.before(loadout);
    for(const node of [ui.flightInstallTwin,ui.c9BuyShield,ui.c9BuyCoolant,calibrate])sections.systems.grid.append(node);
    sections.supplies.grid.append(ui.c9BuyMissiles);
    oldGrid.remove();
    for(const [sku,definition] of Object.entries(NeonCampaign.SCRAP_UPGRADES)) {
      if(['twin-preparation','hull-reinforcement','coolant-feed'].includes(sku))continue;
      const weapon=sku.startsWith('weapon-'),kind=sku.includes('scatter')?'scatter':sku.includes('needle')?'needle':sku.includes('hull')?'hull-ii':'coolant-ii';
      const button=document.createElement('button');button.type='button';button.className='secondary c9-tree-node';button.dataset.c9Sku=sku;
      const art=document.createElement('span');art.className='c9-upgrade-art';art.dataset.upgrade=kind;art.setAttribute('aria-hidden','true');
      const copy=document.createElement('span');copy.className='c9-upgrade-copy';
      const label=document.createElement('b');label.setAttribute('data-c9-label','');label.textContent=definition.label;
      const detail=document.createElement('small');detail.textContent=definition.description;
      const status=document.createElement('em');status.dataset.c9State='';
      copy.append(label,detail,status);button.append(art,copy);button.onclick=()=>buyClassicC9Upgrade(sku);
      (weapon?sections.arsenal:sections.systems).grid.append(button);
    }
    const repeat=document.createElement('button');repeat.type='button';repeat.id='replayFlightTutorial';repeat.className='secondary';repeat.textContent='REPETIR GUÍA DE VUELO';
    repeat.onclick=()=>{
      settings.flightTutorial=null;saveSettings();
      if(classicFlightView){classicTutorial=NeonCampaign.createFlightTutorial({routeElapsed:classicFlightView.elapsed,replay:true});classicTutorialAnchor={x:player.x,y:player.y};}
      repeat.textContent='GUÍA PREPARADA · VUELVE AL VUELO';
    };
    sections.supplies.section.append(repeat);
    $('replayTutorialSettings').onclick=()=>{
      repeat.click();toast('Guía de vuelo preparada. Aprenderás maniobrando en el viaje.');
    };
    const tree=sections.systems.grid;tree.classList.add('c9-skill-tree');
    for(const [label,first,next] of [
      ['BLINDAJE','hull-reinforcement','hull-plating-ii'],['REFRIGERACIÓN','coolant-feed','coolant-feed-ii'],
      ['ABANICO · CONVERGENCIA',null,'scatter-focus'],['AGUJA · RESONANCIA',null,'needle-resonance']]) {
      const branch=document.createElement('div');branch.className='c9-branch';
      const name=document.createElement('h4');name.textContent=label;branch.append(name);
      if(first)branch.append(first==='hull-reinforcement'?ui.c9BuyShield:ui.c9BuyCoolant);
      const node=tree.querySelector(`[data-c9-sku="${next}"]`);if(node)branch.append(node);
      tree.append(branch);
    }
    // El marco pintado no se desplaza: todo menos los botones finales va en una
    // zona interior con su propia barra (auditoría del 25/10, A4).
    const scroll=document.createElement('div');scroll.className='c9-scroll';
    scroll.append(...[...panel.children].filter(node=>!node.classList.contains('c9-actions')));
    panel.prepend(scroll);
  }

  function normalizeClassicVoyageRecord(value) {
    try {
      const checkpoint=NeonCampaign.normalizeChronosVoyageCheckpoint(value?.checkpoint,{goal:LEVELS[0].goal});
      if(value?.version!==2 || !checkpoint || !Number.isInteger(value.unlockedStage) || value.unlockedStage<checkpoint.stageNumber || value.unlockedStage>10 ||
        typeof value.completed!=="boolean" || (value.completed && checkpoint.stageNumber!==10) ||
        !Number.isFinite(value.entry?.hull) || value.entry.hull<=0 || value.entry.hull>100 ||
        !Number.isInteger(value.entry?.score) || value.entry.score<0 ||
        !Number.isFinite(value.entry?.maxCombo) || value.entry.maxCombo<1 || value.entry.maxCombo>12 ||
        value.entry?.collected!==checkpoint.collected)throw new Error("Invalid voyage save");
      if(value.entry.reserve!==undefined&&(!Number.isFinite(value.entry.reserve)||value.entry.reserve<0||value.entry.reserve>65))throw new Error("Invalid hull reserve");
      if(value.entry.missed!==undefined&&(!Number.isInteger(value.entry.missed)||value.entry.missed<0))throw new Error("Invalid missed count");
      return {...value,checkpoint,chapter:value.chapter?NeonCampaign.normalizeChronosChapterCheckpoint(value.chapter):null};
    } catch {return null;}
  }

  function loadClassicVoyage() {
    const key=NeonCampaign.CHRONOS_VOYAGE_KEY,raw=storage.getRaw(key);
    if(raw===null)return;
    let normalized=null;
    try {normalized=normalizeClassicVoyageRecord(JSON.parse(raw));} catch {}
    if(normalized)classicVoyageRecord=normalized;
    else {
      const backup=key+":invalid-backups",previous=storage.getJSON(backup,[]);
      const copies=Array.isArray(previous)?previous.filter(value=>typeof value==="string"):[];
      classicVoyageWritable=copies.includes(raw)||storage.setJSON(backup,[...copies,raw]);
    }
  }

  // Al reanudar o reintentar un tramo se restaura el casco guardado a su
  // entrada, pero nunca por debajo de este mínimo: si se entró al tramo de
  // Atlas casi destruido, cada reintento sería una derrota segura. Valor de
  // trabajo reversible; el guardado conserva el casco real de entrada.
  const CLASSIC_RESUME_HULL_FLOOR = 50;

  function classicVoyageCheckpointRecord(checkpoint,completed=false) {
    if(!checkpoint)return null;
    const previous=classicVoyageRecord;
    const entry=completed && previous ? previous.entry : {
      hull:Math.max(1,Math.min(100,hull)),reserve:classicHullReserve,score:Math.max(0,Math.floor(score)),maxCombo,collected:checkpoint.collected,
      // CRONIUM perdido, como en los viajes del mapa (auditoría L03).
      missed:Math.max(0,energySpawned-collected-items.filter(item=>item.type==="energy").length)};
    return {version:2,checkpoint,entry,chapter:classicChapterStory?.checkpoint()||null,unlockedStage:Math.max(previous?.unlockedStage||1,checkpoint.stageNumber),completed};
  }

  function saveClassicVoyageCheckpoint(checkpoint,completed=false) {
    if(!checkpoint)return false;
    if(isSectorRun()){
      const save=loadSectorSave();
      if(!save.run)return false;
      const next=NeonCampaign.enterStage(save,checkpoint.stageNumber,hull),saved=saveSector(next);
      // El hangar queda abierto al pasar por el tramo 6, aunque luego mueras.
      if(saved)rememberMenuUnlocks(NeonCampaign.menuView(next,loadMenuUnlocks()).unlocks);
      return saved;
    }
    if(classicSideVoyage)return saveSideVoyage(checkpoint,completed);
    if(completionPersistenceBlocked&&!recoverCampaignCompletion())return false;
    const record=classicVoyageCheckpointRecord(checkpoint,completed);
    // New route data has its own key. Old classic/N-7 saves are never inferred,
    // renumbered or replaced. Invalid raw data is backed up before any write.
    const saved=classicVoyageWritable&&storage.setJSON(NeonCampaign.CHRONOS_VOYAGE_KEY,record);
    classicVoyageRecord=record;
    if(!saved)toast("No se pudo guardar esta etapa. El guardado anterior sigue conservado.");
    return saved;
  }

  function buildChronosStageGrid() {
    const section=$("chronosStages");if(!section)return;
    section.classList.toggle("hidden",pendingLevel!==0);
    if(pendingLevel!==0)return;
    const selected=classicVoyageRequestedStage||(!classicVoyageRecord?.completed?classicVoyageRecord?.checkpoint.stageNumber:1)||1;
    const unlocked=classicVoyageRecord?.unlockedStage||1,grid=$("chronosStageGrid");grid.innerHTML="";
    for(const stage of NeonCampaign.CHRONOS_VOYAGE_STAGES){
      const number=stage.number||stage.stageNumber||Number(stage.id.split(".")[1]);
      const button=document.createElement("button");button.type="button";button.dataset.voyageStage=String(number);
      button.disabled=number>unlocked;button.classList.toggle("selected",number===selected);
      button.setAttribute("aria-pressed",String(number===selected));
      button.className=`cockpit-stage${number===selected?" selected":""}`;
      const identifier=document.createElement("small");identifier.className="cockpit-stage-number";identifier.textContent=`1.${number}`;
      const name=document.createElement("b");name.textContent=stage.name;
      const status=document.createElement("span");status.className="cockpit-stage-state";
      status.textContent=number>unlocked?"BLOQUEADO":number===selected?"SELECCIONADO":"DISPONIBLE";
      button.append(identifier,name,status);
      button.setAttribute("aria-label",`Tramo 1.${number}. ${stage.name}. ${status.textContent.toLowerCase()}.`);
      button.onclick=()=>{classicVoyageRequestedStage=number;buildChronosStageGrid();};
      grid.append(button);
    }
    $("chronosStagesNote").textContent=`Tramo 1.${selected} · ${unlocked}/10 disponibles. Reanudas desde la entrada del tramo guardado.`;
    const stage=NeonCampaign.CHRONOS_VOYAGE_STAGES[selected-1];
    ui.briefingSector.textContent=`TRAMO 1.${selected} · CHRONOS → GAIA`;
    ui.briefingName.textContent=stage.name;
    ui.briefingZone.textContent=`${stage.origin} → ${stage.destination}`;
    ui.briefingGoal.textContent=`${stage.goal}/36 CRONIUM`;
    ui.briefingSupply.textContent="Rastro recuperable";
    ui.briefingMission.textContent=stage.objective+". La ruta continúa desde el último punto de etapa guardado.";
  }

  function beginClassicVoyageService() {
    if(state!=="playing"||classicFlightView?.waitingFor!=="service")return;
    // Preserve the v2 route checkpoint and one emergency repair, without
    // inserting an orbital station or forcing a workshop/modal interruption.
    signalClassicChapter("c9-arrival");
    hull=100;
    classicFlight.resolveService(classicFlightEvent);classicFlightView=classicFlight.snapshot();
    signalClassicChapter("c9-departure");
    saveClassicVoyageCheckpoint(classicFlight.exportCheckpoint());hud();
    offerSectorBeacon();
  }

  // Baliza de reaparición (plan F3c): se ofrece en la parada de C9 si el CH-03
  // cayó en este intento y el sector no la tiene. La partida queda en pausa.
  // El recibo lleva el id de la partida de chatarra: reintentar no cobra dos veces.
  let sectorBeaconOffered=false;
  function offerSectorBeacon() {
    if(HARDCORE||!isSectorRun()||!subBossBeaten||sectorBeaconOffered||state!=="playing")return false;
    if(loadSectorSave().sectors[classicSideVoyage.ficha.sector]?.beacon)return false;
    sectorBeaconOffered=true;
    if(typeof resetGameInput==="function")resetGameInput();
    NeonCampaign.endFlightInput(classicFlightInput);
    setState("paused");pauseStartedAt=performance.now();
    const price=NeonCampaign.SCRAP_CONSUMABLES["sector-beacon"].price,balance=classicSalvageState?.balance??0;
    const buy=$("beaconBuy");
    buy.disabled=!classicSalvageLedger||balance<price;
    buy.textContent=balance<price?`FALTAN ${price-balance} CHATARRA`:`COMPRAR · ${price} CHATARRA`;
    $("beaconStatus").textContent=balance<price?"Recupera restos de las naves enemigas para la próxima vez.":"";
    overlay(ui.beaconOffer);return true;
  }
  function buySectorBeacon() {
    if(!classicSalvageLedger||!classicSalvageRunId||!isSectorRun())return false;
    const result=classicSalvageLedger.buyConsumable({transactionId:`beacon:${classicSalvageRunId}`,sku:"sector-beacon"});
    if(result.state)classicSalvageState=result.state;
    if(!result.ok) {
      $("beaconStatus").textContent=result.reason==="insufficient-funds"
        ? `Faltan ${result.missing} de chatarra.` : "No se ha confirmado el pago. Puedes reintentarlo.";
      return false;
    }
    const sector=classicSideVoyage.ficha.sector;
    if(!saveSector(NeonCampaign.buyBeacon(loadSectorSave(),sector))) {
      $("beaconStatus").textContent="Pago guardado. Pulsa otra vez para activar la baliza sin volver a cobrar.";
      return false;
    }
    uiSound("confirm");updateAmmoHud();
    closeSectorBeacon();return true;
  }
  function closeSectorBeacon() {
    if(state!=="paused"||!ui.beaconOffer.classList.contains("show"))return;
    // Pagada pero sin guardar en el sector (fallo de escritura): se reintenta
    // al salir, así seguir sin pulsar otra vez no pierde el pago.
    const sector=classicSideVoyage.ficha.sector,save=loadSectorSave();
    if(classicSalvageState?.lastConsumable?.id===`beacon:${classicSalvageRunId}`&&!save.sectors[sector]?.beacon)saveSector(NeonCampaign.buyBeacon(save,sector));
    if(typeof resetGameInput==="function")resetGameInput();
    setState("playing");overlay();last=performance.now();resumeAudio();
    grantResumeGrace();syncClassicFlightHud();hud();
  }

  function resumeClassicVoyageService() {
    if(flightDockReturn!=="voyage"||state!=="paused"||!classicFlight)return;
    if(typeof resetGameInput==="function")resetGameInput();
    setState("playing");overlay();last=performance.now();
    signalClassicChapter("c9-departure");
    classicFlight.resolveService(classicFlightEvent);classicFlightView=classicFlight.snapshot();
    saveClassicVoyageCheckpoint(classicFlight.exportCheckpoint());
    applyClassicSalvageShield();
    syncClassicFlightHud();hud();resumeAudio();
  }

  function persistClassicEquipment(next) {
    if (!classicEquipmentWritable || !storage.setJSON(CLASSIC_EQUIPMENT_KEY,next)) { toast("No se pudo guardar la pieza. Puedes reintentarlo."); return false; }
    classicEquipment = {...next,unlocked:[...next.unlocked]};
    if (classicWeapons) {
      for (const type of next.unlocked) NeonCampaign.unlockClassicWeapon(classicWeapons,type);
      NeonCampaign.selectClassicWeapon(classicWeapons,next.selected);
    }
    if (["twin","lance"].includes(next.selected)) ensureSprite(SPRITES.flightWeapons);
    if (next.selected === "lance") SPRITE_GROUPS.phaser.forEach(ensureSprite);
    shipPresentationSignature="";
    $("openFlightDock")?.classList.toggle("hidden",!next.recoveredTwin);
    return true;
  }

  function openClassicDock(from="menu") {
    if(from==="hud") {
      if(state!=="playing"||atlasBoss||classicChapterControlsLocked())return false;
      if(typeof resetGameInput==="function")resetGameInput();
      NeonCampaign.endFlightInput(classicFlightInput);
      setState("paused");pauseStartedAt=performance.now();classicWorkshopOpened=true;
    } else if(state!=="menu")return false;
    flightDockReturn=from; updateClassicDock(); overlay(ui.flightDock);
    $("flightDockContinue").focus({preventScroll:true});
    ui.flightDock.querySelector(".c9-scroll").scrollTop=0;
    // Se abre arriba, en ARSENAL: la pestaña marcada tiene que ser esa (revisión tras el PR #56).
    for(const tab of ui.flightDock.querySelectorAll(".c9-navigation button"))
      tab.getAttribute("aria-controls")==="c9-arsenal"?tab.setAttribute("aria-current","true"):tab.removeAttribute("aria-current");
    return true;
  }

  function closeClassicDock() {
    if(flightDockReturn==="hud"&&state==="paused") {
      if(typeof resetGameInput==="function")resetGameInput();
      setState("playing");overlay();last=performance.now();resumeAudio();
      grantResumeGrace(); // misma gracia que al salir de la pausa (B04)
      syncClassicFlightHud();ui.classicC9?.focus({preventScroll:true});return;
    }
    if(flightDockReturn==="voyage"){resumeClassicVoyageService();return;}
    // Sin niveles clásicos: volver de la Forja nunca abre la ficha de otro nivel.
    goHome();$("openFlightDock")?.focus();
  }

  function setC9Label(button,text) {
    const label=button.querySelector("[data-c9-label]");
    if(label)label.textContent=text;else button.textContent=text;
  }

  function updateClassicDock() {
    loadClassicSalvage();
    const installed=classicEquipment.unlocked.includes("twin");
    const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
    const ownedUpgrades=classicSalvageState?.upgrades||[];
    const tuning={scatter:ownedUpgrades.includes('scatter-focus'),needle:ownedUpgrades.includes('needle-resonance')};
    const selectedUpgrade=tuning[classicEquipment.selected]?NeonCampaign.SCRAP_UPGRADES[classicEquipment.selected==='scatter'?'scatter-focus':'needle-resonance']:null;
    const purchasedWeapon=classicEquipment.unlocked.some(id=>id==='scatter'||id==='needle');
    ui.flightDockStatus.textContent=installed||purchasedWeapon
      ? `${weapon.label}${selectedUpgrade?' II':''} equipado. ${selectedUpgrade?.description||weapon.description} Puedes cambiar de arma antes de volver al vuelo.`
      : classicEquipment.twinPrepared ? "Emisor preparado. Conservas Pulso hasta vencer a Atlas: su autorización desbloquea el segundo cañón."
      : classicEquipment.recoveredTwin ? "Emisor recuperado. Prepáralo por 24 de chatarra; vencer a Atlas autoriza el segundo cañón."
      : "Pulso central equipado. Recupera el módulo de Chronos para desarrollar tu nave.";
    for(const button of $("flightLoadoutChoices").querySelectorAll("button")) {
      const type=button.dataset.flightLoadout,unlocked=classicEquipment.unlocked.includes(type);
      button.disabled=!unlocked;button.setAttribute("aria-pressed",String(type===classicEquipment.selected));
      button.querySelector('[data-loadout-state]').textContent=type===classicEquipment.selected?'EQUIPADA':unlocked?'EQUIPAR':type==='twin'?'REQUIERE ATLAS':'SIN ADQUIRIR';
      button.title=unlocked?NeonCampaign.CLASSIC_WEAPON_RULES.types[type].description:type==="twin"?"Supera a Guardian Atlas":"Una frontera posterior desbloquea esta arma";
      button.classList.toggle('hidden',type==='lance'&&!unlocked);
      button.title=type==='scatter'||type==='needle' ? unlocked?NeonCampaign.CLASSIC_WEAPON_RULES.types[type].description:'Disponible en el arsenal de la Forja':button.title;
      if(type==='scatter'||type==='needle') {
        button.querySelector('b').textContent=`${NeonCampaign.CLASSIC_WEAPON_RULES.types[type].label}${tuning[type]?' II':''} ×${NeonCampaign.CLASSIC_WEAPON_RULES.types[type].damageMultiplier}`;
        button.querySelector('small').textContent=type==='scatter'?(tuning[type]?'Tres pulsos · alcance ampliado':'Tres pulsos · corta distancia'):
          tuning[type]?'Perfora cuatro · cadencia mejorada':'Perfora tres objetivos';
      }
    }
    const balance=classicSalvageState?.balance??0,upgrades=classicSalvageState?.upgrades||[];
    ui.c9Balance.textContent=classicSalvageState ? NeonCampaign.formatDenominations(balance).label : "Bodega no disponible · compras protegidas";
    ui.c9Balance.title="100.000 chatarra = 1 plata · 100 plata = 1 oro · 10 oro = 1 estelar";
    ui.flightInstallTwin.disabled=!classicSalvageState || !classicEquipmentWritable || balance<24 || installed || !classicEquipment.recoveredTwin || Boolean(classicEquipment.twinPrepared);
    setC9Label(ui.flightInstallTwin,installed ? "SEGUNDO CAÑÓN AUTORIZADO" : classicEquipment.twinPrepared ? "EMISOR PREPARADO · FALTA ATLAS" : "PREPARAR EMISOR · 24 CHATARRA");
    ui.c9BuyShield.disabled=!classicSalvageState||balance<30||upgrades.includes("hull-reinforcement");
    setC9Label(ui.c9BuyShield,upgrades.includes("hull-reinforcement")?"REFUERZO DE 45 INSTALADO":"AMPLIAR REFUERZO A 45 · 30 CHATARRA");
    ui.c9BuyShield.title="Añade 15 puntos de placas de casco. El refuerzo se consume por impactos, sin temporizador.";
    const missingMissiles=Math.max(0,3-(classicSalvageState?.missileAmmo??0)),missilePrice=missingMissiles*6;
    ui.c9BuyMissiles.disabled=!classicSalvageState||!missingMissiles||balance<missilePrice;
    setC9Label(ui.c9BuyMissiles,missingMissiles?`REPONER ${missingMissiles} MISIL${missingMissiles>1?"ES":""} · ${missilePrice} CHATARRA`:"TRES MISILES CARGADOS");
    ui.c9BuyMissiles.title="Cada misil repuesto cuesta 6 de chatarra. No se cobra una carga que ya tienes.";
    ui.c9BuyCoolant.disabled=!classicSalvageState||balance<45||upgrades.includes("coolant-feed");
    setC9Label(ui.c9BuyCoolant,upgrades.includes("coolant-feed")?"REFRIGERACIÓN INSTALADA":"REFRIGERACIÓN · 45 CHATARRA");
    ui.c9BuyCoolant.title="Recupera un proyectil cada 1,5 segundos; no cambia el daño ni la cadencia.";
    ui.flightCalibrateLance.classList.toggle("hidden",!classicEquipment.unlocked.includes("lance"));
    ui.flightCalibrateLance.disabled=classicEquipment.selected==="lance";
    ui.flightCalibrateLance.textContent="EQUIPAR LANZA ×3 CONSERVADA";
    for(const button of ui.flightDock.querySelectorAll('[data-c9-sku]')) {
      const sku=button.dataset.c9Sku,definition=NeonCampaign.SCRAP_UPGRADES[sku],owned=upgrades.includes(sku);
      const required=definition.requires||[];
      const requirements=Array.isArray(required)?required:[required];
      const missing=requirements.filter(id=>!upgrades.includes(id));
      button.disabled=!classicSalvageState||owned||missing.length>0||balance<definition.price||!classicEquipmentWritable;
      button.dataset.nodeState=owned?'installed':missing.length?'locked':'available';
      setC9Label(button,definition.label.toUpperCase());
      button.querySelector('[data-c9-state]').textContent=owned?'INSTALADO':missing.length
        ?`REQUIERE ${missing.map(id=>NeonCampaign.SCRAP_UPGRADES[id]?.label||id).join(' + ')}`:`${definition.price} CHATARRA`;
    }
    // Desde el menú las dos salidas llevaban al menú: queda una sola (A4).
    const fromMenu=!["voyage","hud"].includes(flightDockReturn);
    $("flightDockContinue").textContent=fromMenu ? "VOLVER AL MENÚ" : "VOLVER A PILOTAR →";
    $("flightDockHome").classList.toggle("hidden",fromMenu);
  }

  function syncClassicFlightHud() {
    if (!ui.flightRoute) return;
    $("openFlightDock")?.classList.toggle("hidden",!classicEquipment.recoveredTwin);
    const view=classicFlightView;
    if(ui.classicC9){
      // Decisión del propietario (24/10): en el sector C9 no se abre en pleno vuelo.
      const c9Recovered=Boolean(classicEquipment.recoveredTwin),c9Blocked=Boolean(atlasBoss)||isSectorRun();
      ui.classicC9.disabled=state!=="playing"||c9Blocked;
      ui.classicC9.classList.toggle("hidden",!c9Recovered||c9Blocked||ui.flightHud.classList.contains("hidden"));
      ui.classicC9.title=!c9Recovered?"Recupera primero el módulo C9":c9Blocked?"C9 no está disponible durante el bloqueo de Atlas":"Taller C9 · pausa el viaje para configurar tu nave";
    }
    ui.flightPilotHint?.classList.toggle("hidden",Boolean(classicEquipment.recoveredTwin));
    const stage=atlasBoss ? "ACCESO ATLAS" : view?.stageNumber ? `${view.stageId} · ${view.stageName}` : view?.stageName || level().name;
    // The primary HUD already shows the quota. This reserved, transparent slot
    // is used only for brief contextual comms; it never repeats the counters.
    const tutorialView=typeof classicTutorial!=="undefined"?classicTutorial?.snapshot():null;
    let guide=!atlasBoss&&state==='playing'?tutorialView?.active:null;
    // Revisión G1: una lección de un paso (target 1) se ve sus segundos, se
    // oculta y vuelve una sola vez a los 30 s de juego; sin «· 0 %».
    if(guide&&guide.target===1&&!flightTransmission) {
      if(classicGuideSeen?.id!==guide.id)classicGuideSeen={id:guide.id,at:elapsed};
      const since=elapsed-classicGuideSeen.at,seconds=guide.seconds||4;
      if(!(since<seconds||(since>=30&&since<30+seconds)))guide=null;
    }
    const objective=flightTransmission ? `${flightTransmission.speaker}: ${flightTransmission.text}` : guide ? (guide.target>1&&guide.progress>0?`${guide.text} · ${Math.round(guide.progress*100)} %`:guide.text) : "";
    const signature=[currentLevel,stage,objective,collected,Math.floor((view?.routeProgress||0)*1000),classicEquipment.selected,classicWeapons?.charges,Math.floor((classicWeapons?.recharge||0)*5)].join(":");
    if(signature===flightHudSignature)return;
    flightHudSignature=signature;
    ui.flightStage.textContent=stage;
    if(ui.flightObjective.textContent!==objective) {
      ui.flightObjective.replaceChildren();
      if(["lira","mira","iria"].includes(flightTransmission?.speakerId)) {
        const face=document.createElement("span");face.className="chapter-face";
        face.dataset.actor=flightTransmission.speakerId;face.setAttribute("aria-hidden","true");ui.flightObjective.append(face);
      }
      const text=document.createElement("span");text.textContent=objective;ui.flightObjective.append(text);
    }
    ui.flightObjective.dataset.active=String(Boolean(flightTransmission||guide));
    ui.flightObjective.classList.toggle('tutorial-active',Boolean(!flightTransmission&&guide));
    ui.flightDestination.textContent=classicSideVoyage ? `TRAMO ${view?.stageNumber||1}/${view?.distance?.stages||1}`
      : currentLevel===0 ? `CHRONOS → GAIA · ${view?.stageNumber||1}/10` : `${level().world} · RASTRO ${currentLevel+1}/10`;
    ui.flightDistance.value=view ? view.routeProgress : collected/level().goal;
    ui.flightDistance.setAttribute("aria-label",view ? "Recorrido hasta el destino" : "CRONIUM recuperado");
    ui.flightDistance.setAttribute("aria-valuetext",view ? `Etapa ${view.stageNumber||1} de ${view.distance?.stages||10}. ${Math.round(view.routeProgress*100)}% del recorrido` : `${collected} de ${level().goal} fragmentos`);
    const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
    ui.flightWeaponName.textContent=weapon.label.toUpperCase();
    ui.flightWeaponDamage.textContent=`DAÑO ×${weapon.damageMultiplier}`;
    ui.flightWeapon.title=weapon.description;
    ui.flightWeapon.dataset.switchable=String(classicEquipment.unlocked.length>1);
    ui.flightWeapon.classList.toggle("hidden",classicEquipment.unlocked.length<2);
    ui.flightWeapon.setAttribute("aria-label",`Cambiar arma. ${weapon.label}. ${weapon.description}`);
    updateAmmoHud();
  }

  function advanceClassicTutorial() {
    // Durante la animación del inicio no hay tutorial: empieza al aparecer la nave.
    if(!classicTutorial||!classicFlightView||classicChapterControlsLocked())return;
    classicTutorial.advance({elapsed:classicFlightView.elapsed,playing:state==='playing',
      shots:classicWeapons?.shotSequence||0,collected,workshopOpened:classicWorkshopOpened,
      moduleRecovered:Boolean(classicEquipment.recoveredTwin),missilesFired:classicSalvageState?.missileShotsSpent||0,
      missileReady:(classicSalvageState?.missileAmmo||0)>0,
      missileOpportunity:items.some(item=>isThreat(item)&&item.y<player.y&&Math.abs(item.x-player.x)<90),
      bossActive:Boolean(atlasBoss),channelBusy:Boolean(flightTransmission)},cue=>{
        flightTransmission={speaker:'N-7 · GUÍA',text:cue.text,remaining:cue.seconds};
        flightHudSignature='';
      });
    const checkpoint=classicTutorial.checkpoint(),signature=JSON.stringify(checkpoint);
    if(signature!==classicTutorialSignature){
      settings.flightTutorial=checkpoint;
      if(saveSettings())classicTutorialSignature=signature;
    }
    syncClassicFlightHud();
  }

  function setClassicFlightHudVisible(visible) {
    ui.flightHud?.classList.toggle("hidden",!visible);
    ui.classicMissile?.classList.toggle("hidden",!visible);
    ui.classicC9?.classList.toggle("hidden",!visible||!classicEquipment.recoveredTwin||Boolean(atlasBoss)||isSectorRun());
    ui.flightWeapon?.classList.toggle("hidden",!visible||classicEquipment.unlocked.length<2);
    ui.flightPilotHint?.classList.toggle("hidden",!visible||Boolean(classicEquipment.recoveredTwin));
    if(!visible)ui.chapterSkip?.classList.add("hidden");
    ui.flightRoute?.classList.toggle("hidden",!visible || Boolean(atlasBoss));
  }

  function classicFlightEvent(event) {
    if(event.type==="checkpoint") {
      classicFlightView=classicFlight.snapshot();
      // Initial assets can finish loading after the player has already fired.
      // Route markers are not scene resets: already visible debris, enemies and
      // real shots keep flying across the boundary. C9 clears its safe dock only.
      classicVoyageStageId=classicFlightView.stageId;
      classicVoyageSpawnTimer=1;classicVoyageHazardTimer=10;
      classicPatrolTimer=classicFlightView.stageNumber===1?4:7;classicCometSequence=0;classicHordeTimer=null;
      classicSalvageEnemySequence=0;resetClassicCometShower();applyClassicSalvageShield();
      resetSectorAttackTokens();
      saveClassicVoyageCheckpoint(event.checkpoint);
    }
    if(event.type==="stage-start") {
      classicFlightView=classicFlight.snapshot();
      if(!classicChapterStory)showStoryTransmission(`TRAYECTO ${classicFlightView.stageId}`,
        `${classicFlightView.stageName} · ${classicFlightView.stageObjective}`,3.2);
      hud();
    }
    if(event.type==="service") { classicFlightView=classicFlight.snapshot();beginClassicVoyageService(); }
    if(event.type==="attack"&&!classicChapterStory) { showStoryTransmission("CONTROL CHRONOS","Nave sin identificación. Está cargando sus armas contra el reactor.",5); uiSound("boss-alert"); }
    if(event.type==="rupture") {
      // The authored reactor/wave layers own this blue temporal rupture. A
      // generic orange/pink combat explosion used to obscure its structure.
      levelOneShockwaveTriggered=true;
      shake=8;stormPulse=.18;uiSound("rupture");
      if(!classicChapterStory)showStoryTransmission("N-7","¡Chronos ha sido alcanzado! Recupera el CRONIUM. Los atacantes siguen en la zona.",6);
    }
    if(event.type==="departure") { if(!classicChapterStory)showStoryTransmission("N-7","Chronos queda atrás. La primera señal conduce a Gaia Nova.",4.6); classicPatrolTimer=.6; }
    if(event.type==="twin-module-marker" && !classicEquipment.recoveredTwin) {
      items.push({type:"flightModule",x:W*.66,baseX:W*.66,y:H*.33,r:29,s:95,rot:0,rs:.12,p:0,phase:0,amp:0,alpha:1});
      showStoryTransmission("MIRA · C9","Hay un emisor gemelo entre los restos. Rescátalo: puedo montarlo en tu nave.",5.5);
    }
    if(event.type==="gaia-beacon") showStoryTransmission("IRIA · GAIA","Tu identificación coincide con el convoy atacante. Atlas exige que detengas los motores.",5);
  }

  // Auditoría B01: el pasillo marcado se vacía de todo lo que no sea cometa:
  // peligros y disparos que entran en él, de frente o de lado. Corre después
  // de mover los objetos, así que no necesita margen (A3).
  function clearCometCorridor() {
    if(!cometShowerActive())return;
    const c=classicCometCorridor.corridor;
    for(let i=items.length-1;i>=0;i--) {
      const item=items[i];
      if(!(item.classicScoutProjectile||(isThreat(item)&&!item.showerComet&&!item.flightPatrol&&!item.classicScout)))continue;
      // Solo lo que tiene el centro dentro del pasillo (A2/C2) y ya toca su
      // zona marcada (P01). La rotura se dibuja sobre la línea y dentro de la
      // propia roca, nunca por encima (A3).
      if(item.x<=c.left||item.x>=c.right||item.y+item.r<=c.top)continue;
      // Lo que se ve no se esfuma: un peligro se rompe con su explosión
      // normal y un disparo con chispas cálidas, nunca cian (R2, C5).
      const breakY=Math.max(item.y,c.top);
      if(item.classicScoutProjectile)burst(item.x,breakY,6,"red");else addExplosion(item.x,breakY,.7,.5);
      items.splice(i,1);
    }
  }

  function advanceClassicFlight(dt) {
    const introBefore=classicFlightView?.elapsed;
    // Mientras el subjefe CH-03 vive, la ruta no avanza (plan F3c).
    if(subBossHolds())return;
    if(classicFlight) classicFlightView=classicFlight.advance(dt,collected,classicFlightEvent);
    // Auditoría J05: en un viaje del mapa, con la cuota del tramo cumplida y
    // 20 s jugados, el reloj del tramo corre al triple para no dejar tiempo
    // muerto. Los eventos siguen en orden. S1-V1 no: su capítulo va narrado.
    // Un tramo con lluvia de cometas tampoco, para no cortar sus tandas (M2).
    const view=classicFlightView;
    if(classicSideVoyage&&view&&!view.canFinish&&view.stageElapsed>=20&&collected>=view.stageGoal&&
      !NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.comets)
      for(let i=0;i<2;i++)classicFlightView=classicFlight.advance(dt,collected,classicFlightEvent);
    // Cronos Prime: suena al frenar sobre la estación, al empezar a alimentarse y al disparar.
    const timeline=NeonCampaign.CHRONOS_INTRO_TIMELINE;
    if(timeline&&Number.isFinite(introBefore)&&classicFlightView) {
      for(const cue of [timeline.arrive,timeline.drain,timeline.beamStart])
        if(introBefore<cue&&classicFlightView.elapsed>=cue)combatSound("atlas-charge",W*.5);
    }
    classicShipEntry=Math.max(0,classicShipEntry-dt);
    if(classicChapterStory&&classicFlightView) {
      classicChapterStory.advance({elapsed:classicFlightView.elapsed,playing:state==="playing"},classicChapterEvent);
      classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
      advanceClassicTutorial();
    }
    if(classicFlightView?.stageNumber) {
      // Revisiones G5 y R6: si el reloj del tramo acaba sin la cuota, el viaje
      // espera; el HUD cuenta la cuota del tramo y N-7 dice cuánto CRONIUM
      // falta, y lo repite cada 10 s de juego mientras siga esperando.
      const wait=classicFlightView;
      if(ui.goal.textContent!==croniumGoalLabel())ui.goal.textContent=croniumGoalLabel();
      const goalTag=ui.goal.previousElementSibling,tag=wait.waitingFor==="cronium"?"TRAMO":"CRONIUM";
      if(goalTag&&goalTag.textContent!==tag)goalTag.textContent=tag;
      // El aviso con la cuenta se retira en cuanto cambia el CRONIUM o acaba la
      // espera, para no contradecir al HUD (revisión C3).
      if(classicCroniumWaitShown!==null&&flightTransmission?.text===classicCroniumWaitShown.text&&
        (collected!==classicCroniumWaitShown.collected||wait.waitingFor!=="cronium")) {
        flightTransmission=null;classicCroniumWaitShown=null;syncClassicFlightHud();
      }
      if(state==="playing"&&wait.waitingFor==="cronium"&&!flightTransmission&&
        (classicCroniumWaitNotice!==wait.stageId||elapsed-classicCroniumWaitAt>=10)) {
        classicCroniumWaitNotice=wait.stageId;classicCroniumWaitAt=elapsed;
        const missing=Math.max(1,wait.stageGoal-collected);
        const text=`${missing===1?"Falta 1":`Faltan ${missing}`} CRONIUM para seguir al siguiente tramo.`;
        showStoryTransmission("N-7",text,4);classicCroniumWaitShown={text,collected};
      }
      if(state==="playing" && !atlasBoss && !subBossHolds() && classicFlightView.waitingFor!=="service") advanceClassicVoyageEncounters(dt);
      syncClassicFlightHud();return;
    }
    if(classicFlightView?.routeProgress>=.30 && classicFlightView.routeProgress<.82) {
      classicPatrolTimer-=dt;
      if(classicPatrolTimer<=0) {
        if(items.filter(item=>item.flightPatrol).length<2) spawnClassicFlightPatrol();
        classicPatrolTimer=9;
      }
    }
    if(classicFlightView) {
      const crossings=[.46,.61,.76],progress=classicFlightView.routeProgress;
      const threshold=crossings[classicCometSequence];
      if(threshold!==undefined && progress>=threshold-.025 && classicCometWarning!==classicCometSequence) {
        classicCometWarning=classicCometSequence;
        showStoryTransmission("N-7","Cometa por babor. Cruza en diagonal; mantén libre su trayectoria.",2.4);
      }
      if(threshold!==undefined && progress>=threshold) {
        classicCometSequence++;
        items.push({id:`chronos-comet:${classicCometSequence}`,type:"meteor",flightComet:true,
          x:-45,y:H*.16,baseX:-45,vx:62,vy:82,r:18,s:82,damage:14,hp:2,maxHp:2,
          special:"comet",spriteKey:"comet",rot:Math.atan2(82,62),rs:0,p:0,phase:classicCometSequence,amp:0,alpha:1,life:16});
      }
    }
    syncClassicFlightHud();
  }

  function advanceClassicVoyageEncounters(dt) {
    const view=classicFlightView,n=view.stageNumber;
    // Los 9 s de espera son el inicio de Chronos (S1-V1 y el sector 1, recoveryAt).
    // Los viajes del mapa no tienen ese inicio: su primer CRONIUM llega en ~1 s.
    if(view.elapsed<(classicSideVoyage?classicSideVoyage.ficha.recoveryAt:9) || view.canFinish || classicChapterControlsLocked())return;
    // Reglas del tramo: salen de la ficha del viaje (patrullas, peligros, cometas y reparación).
    const rules=NeonCampaign.getVoyageStageRulesFor(view.routeId,n,settings.difficulty);
    if(!rules)return;
    classicVoyageSpawnTimer-=dt;
    // Recoverable signals form a short trail rather than an endless rain.
    // Missed fragments are reissued while this stage's objective is incomplete.
    const live=items.filter(item=>item.type==="energy").length;
    if(collected+live<view.stageGoal && live<2 && classicVoyageSpawnTimer<=0) {
      const x=W*(.30+.40*(.5+.5*Math.sin(view.stageElapsed*.31+n)));
      items.push({type:"energy",x,baseX:x,y:-45,r:22,s:175+n*4,rot:0,rs:.2,p:0,phase:n,amp:12,special:"",alpha:1});
      energySpawned++;classicVoyageSpawnTimer=2.8;
    }
    // Escape pressure after the actual rupture, with quiet space and C9 left
    // intact. A two-enemy cap includes survivors from the preceding crossing.
    if(rules.patrol) {
      classicPatrolTimer-=dt;
      if(classicPatrolTimer<=0) {
        // Más presencia y una mezcla de tipos que crece durante el viaje.
        const {cap,roster,gap}=rules.patrol;
        if(items.filter(item=>item.flightPatrol).length<cap)spawnClassicFlightPatrol(roster[classicPatrolSequence%roster.length]);
        classicPatrolTimer=gap*(.8+Math.random()*.4);
      }
    }
    // Hordas de CH-01 en V: la primera a media cadencia y luego cada `every`.
    if(rules.horde) {
      classicHordeTimer=(classicHordeTimer??rules.horde.every/2)-dt;
      if(classicHordeTimer<=0){spawnHordeWave(rules.horde.size);classicHordeTimer=rules.horde.every;}
    }
    // Campo de meteoritos, restos de naves y satélites con densidad propia de
    // cada tramo y un hueco transitable garantizado. Las pruebas que quieren
    // un tramo vacío lo desactivan con un temporizador muy alto (>=900).
    if(classicVoyageHazardTimer<900) {
      if(classicVoyageHazards?.stageNumber!==n)classicVoyageHazards=NeonCampaign.createVoyageHazardField({
        stageNumber:n,profile:rules.hazards,seed:Math.floor(Math.random()*4294967296),width:W,height:H,shipWidth:player.w});
      if(rules.hazards.mix.lavaCore||rules.hazards.mix.plasmaMine)ensureSprite(SPRITES.lavaCoreMine);
      const ambient=items.filter(item=>isThreat(item)&&!item.flightPatrol&&!item.classicScout&&
        !item.classicScoutProjectile&&!item.showerComet&&!item.guardianProjectile);
      NeonCampaign.advanceVoyageHazardField(classicVoyageHazards,dt,ambient,hazard=>{
        // Núcleo de lava y mina de plasma (sector 2); sin su hoja, un meteorito.
        const vulkar=hazard.type==="lavaCore"||hazard.type==="plasmaMine";
        const threat=vulkar&&spriteReady(SPRITES.lavaCoreMine)?createVulkarHazard(hazard.type,level()):
          createThreat(vulkar?"meteor":hazard.type,level());
        threat.x=threat.baseX=hazard.x;threat.y=-95-hazard.delayY;threat.s=hazard.speed*(threat.speedScale||1);threat.amp=0;
        threat.damage=Math.round(threat.damage*(hazard.damageScale??1));threat.hazardDamageScale=hazard.damageScale??1;
        // Durante la lluvia el pasillo marcado es seguro de verdad: nada nuevo
        // cae dentro (revisión L1). Los peligros caen recto (amp=0).
        if(cometShowerActive()){const c=classicCometCorridor.corridor;if(threat.x+threat.r>c.left&&threat.x-threat.r<c.right)return;}
        items.push(threat);
      });
    }
    if(rules.comets==="aimed"&&classicAimedRain) {
      const firstWarning=classicAimedRain.announced===0;
      NeonCampaign.advanceAimedMeteorRain(classicAimedRain,dt,player,event=>{
        if(event.type==="warning"){
          if(firstWarning)showStoryTransmission("N-7","Meteoritos hacia nosotros · esquiva",2);
          classicMeteorWarnings.push({id:event.id,x:event.x,until:elapsed+NeonCampaign.AIMED_METEOR_RULES.warning});
        }
        if(event.type==="meteor") {
          classicMeteorWarnings=classicMeteorWarnings.filter(warning=>warning.id!==event.id);
          items.push({type:"meteor",flightComet:true,aimedMeteor:true,id:event.id,x:event.x,baseX:event.x,y:event.y,
            vx:event.vx,vy:event.vy,r:NeonCampaign.AIMED_METEOR_RULES.radius,s:Math.hypot(event.vx,event.vy),damage:event.damage,
            hp:2,maxHp:2,special:"comet",spriteKey:"comet",rot:Math.atan2(event.vy,event.vx),rs:0,p:0,phase:0,amp:0,alpha:1,life:6});
        }
      });
    }
    classicMeteorWarnings=classicMeteorWarnings.filter(warning=>warning.until>elapsed);
    // Mientras dura la lluvia dirigida solo ataca un enemigo a la vez.
    if(sectorAttackTokens)sectorAttackTokens.max=classicAimedRain&&!classicAimedRain.done?1:sectorAttackTokens.baseMax;
    if(rules.comets&&rules.comets!=="aimed") {
      if(!classicCometShower||classicCometShower.stageId!==view.stageId)resetClassicCometShower();
      NeonCampaign.advanceCometShower(classicCometShower,dt,player,event=>{
        if(event.type==="warning"){showStoryTransmission("N-7",event.text,2);
          classicCometCorridor={corridor:event.corridor,until:view.stageElapsed+2.5};}
        if(event.type==="spawn")items.push(event.item);
      });
    }
    if(rules.repairAt!==null && view.stageElapsed>=rules.repairAt && classicCometWarning!==n) {
      classicCometWarning=n;const x=W*.45;
      items.push({type:"repair",x,baseX:x,y:-45,r:22,s:150,rot:0,rs:.15,p:0,phase:0,amp:18,special:"",alpha:1});
    }
  }

  // Subguardián del tramo 5 del sector 1 (dec-subguardian-plan, 31/10/2026;
  // sustituye al CH-03 del plan F3c): mientras vive, la ruta y las patrullas
  // se paran. subBossBeaten: vencido en este intento.
  let subBoss=null,subBossBeaten=false,subBossBurn=null;
  const SUB_BOSS_HIT_RADIUS=95;
  function subBossHolds(){return Boolean(subBoss)&&!subBoss.resolved;}
  function subBossAnchor(){return subBoss&&subBoss.state!=="defeated"?{x:subBoss.x,y:subBoss.y,r:110}:null;}
  function showBossHud(name,phase,health,status) {
    if(!ui.atlasEncounter)return;
    ui.atlasEncounter.classList.remove("hidden");
    const title=ui.atlasEncounter.querySelector(".atlas-identity b");
    if(title&&title.textContent!==name)title.textContent=name;
    if(ui.atlasPhase.textContent!==phase)ui.atlasPhase.textContent=phase;
    if(ui.atlasHealth.value!==health)ui.atlasHealth.value=health;
    if(ui.atlasStatus.textContent!==status)ui.atlasStatus.textContent=status;
  }
  function maybeStartSubBoss() {
    const view=classicFlightView;
    if(subBoss||subBossBeaten||!isSectorRun()||state!=="playing"||!view)return;
    if(NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.boss?.id!=="subguardian")return;
    // Su arte se carga y se descodifica al empezar el tramo, no al aparecer
    // (los tirones del CH-03 en el iPhone, rendimiento-movil).
    for(const image of [SPRITES.subguardian,SPRITES.subguardianLaser,SPRITES.subguardianImpact,SPRITES.atlasEscorts,SPRITES.hostileProjectiles2])
      if(!ensureSprite(image)._warm){image._warm=true;image.decode?.().catch(()=>{});}
    if(view.stageElapsed<6)return;
    subBoss=NeonCampaign.createSubguardian({width:W,height:H,seed:view.stageNumber*97});
    spawnAtlasEscorts(4,subBossAnchor());
    uiSound("boss-alert");
    showStoryTransmission("RED ATLAS","Subguardián en línea. El anillo de Gaia queda cerrado.",3.4);
  }
  function updateSubBossEncounter(dt) {
    maybeStartSubBoss();
    if(!subBoss)return;
    NeonCampaign.advanceSubguardian(subBoss,dt,event=>{
      if(event.type==="projectile")items.push(gaiaShot({...event,sprite:"orb"}));
      if(event.type==="warning")combatSound("atlas-charge",subBoss.x);
      if(event.type==="fire")combatSound(event.attack==="laser"?"atlas-collapse":"enemy-heavy",subBoss.x);
      if(event.type==="fire"&&event.attack==="laser"){shake=Math.max(shake,5);cameraKickY=Math.max(cameraKickY,4);}
      if(event.type==="defeated") {
        subBossBeaten=true;addExplosion(subBoss.x,subBoss.y,1.6,1);
        // Las escoltas caen con él.
        for(const escort of items.filter(item=>item.gaia?.kind==="atlasEscort"))addExplosion(escort.x,escort.y,.6,.4);
        items=items.filter(item=>item.gaia?.kind!=="atlasEscort");
        // Misma recompensa que el CH-03 (la economía no cambia): su entrada "ch03".
        spawnClassicScrap({x:subBoss.x,y:subBoss.y,bossSalvage:true,salvageRole:"ch03",salvageDropId:"ch03"});
        showStoryTransmission("N-7","Subguardián abatido. El anillo se abre: C9 nos espera.",3.4);
      }
    },{x:player.x,y:player.y});
    // Un golpe por barrido. Durante la gracia no cuenta, así el láser aún
    // puede alcanzar la nave cuando acabe.
    const damage=NeonCampaign.subguardianHitsShip(subBoss,{x:player.x,y:player.y,r:30});
    const hitKey=damage?`${subBoss.attacks}:laser`:null;
    if(damage&&hitKey!==subBoss.lastHitKey&&hullGrace<=0) {
      subBoss.lastHitKey=hitKey;damageShip(damage,player.x,player.y);subBossBurn={x:player.x,y:player.y,age:0};
    }
    if(subBossBurn&&(subBossBurn.age+=dt)>.5)subBossBurn=null;
    if(subBoss.resolved){subBoss=null;ui.atlasEncounter?.classList.add("hidden");return;}
    const status=subBoss.state==="warning"?(subBoss.attack==="laser"?"LÁSER · sal de la franja roja":"CARGANDO · prepárate para esquivar")
      :subBoss.state==="defeated"?"SUBGUARDIÁN ABATIDO":"Dispárale y esquiva su láser.";
    showBossHud("SUBGUARDIÁN","SUBJEFE",subBoss.hp/subBoss.maxHp,status);
  }

  // Enemigos de la Guardia de Gaia (plan F3b): Rastreador, Sembrador, Égida y
  // Alfa con su IA de perfiles, minas, bombas en cruz, escudo y marca.
  const GAIA_KINDS=new Set(["tracker","sower","aegis","alpha"]);
  let playerMarkedUntil=-Infinity,gaiaFallbackTokens=null;
  // Hordas (plan F3b): null = la primera oleada del tramo aún no está programada.
  let classicHordeTimer=null,classicHordeSequence=0;
  function spawnHordeWave(size) {
    const wave=classicHordeSequence++,stage=classicFlightView?.stageNumber||0;
    NeonCampaign.createHordeWave({size,width:W,seed:wave+stage}).forEach((unit,index)=>{
      const item=createThreat("scout",level());
      Object.assign(item,{id:`horde:${currentLevel}:${stage}:${wave}:${index}`,x:unit.x,baseX:unit.x,y:unit.y,vx:unit.vx,vy:unit.vy,
        s:0,rot:0,rs:0,amp:0,classicScout:null,hordeUnit:true,r:30,hp:1,maxHp:1,damage:12,salvageRole:"raider",
        salvageDropId:`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`,
        hordeAnimator:NeonCampaign.createCh01Animator({hp:1,maxHp:1})});
      items.push(item);
    });
    ensureSprite(SPRITES.ch01);
  }
  function spawnGaiaEnemy(kind) {
    const ordinal=classicPatrolSequence++,stage=classicFlightView?.stageNumber||0,rules=NeonCampaign.GAIA_ENEMY_RULES[kind];
    // El Rastreador entra por abajo, el Sembrador por un lado del carril bajo y los demás por arriba.
    const x=kind==="sower"?(ordinal%2===0?-30:W+30):W*(ordinal%2===0?.3:.7);
    const y=kind==="tracker"?H+30:kind==="sower"?H*.78:-70;
    const item=createThreat("scout",level());
    // Sin el piloto del explorador antiguo: lo mueve su propia IA.
    Object.assign(item,{id:`gaia:${currentLevel}:${stage}:${ordinal}`,x,baseX:x,y,s:0,rot:0,rs:0,amp:0,classicScout:null,
      flightPatrol:true,gaiaEnemy:true,damage:16,r:kind==="alpha"?58:34,hp:rules.hp,maxHp:rules.hp,salvageRole:rules.salvageRole,
      salvageDropId:`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`,
      gaia:NeonCampaign.createGaiaEnemy({kind,x,y,now:elapsed})});
    ensureSprite(SPRITES[{tracker:"gaiaTracker",sower:"gaiaSower",aegis:"gaiaAegis",alpha:"gaiaAlpha",atlasEscort:"atlasEscorts"}[kind]]);
    ensureSprite(SPRITES.hostileProjectiles2);
    items.push(item);
    return item;
  }
  function gaiaHazard(fields) {
    return {type:"meteor",s:0,rot:0,rs:0,p:0,phase:Math.random()*4,amp:0,alpha:1,special:"",hp:1,maxHp:1,...fields};
  }
  function spawnGaiaMine(x,y) {
    const item=gaiaHazard({id:`gaia-mine:${++classicThreatSequence}`,gaiaMine:true,x,baseX:x,y,r:16,
      damage:NeonCampaign.GAIA_ENEMY_RULES.sower.mine.damage,mine:{x,y,age:0,armed:false}});
    items.push(item);return item;
  }
  function gaiaShot(shot) {
    return gaiaHazard({classicScoutProjectile:true,tacticsVersion:NeonCampaign.CLASSIC_PURSUIT_VERSION,gaiaSprite:shot.sprite||"orb",
      x:shot.x,baseX:shot.x,y:shot.y,vx:shot.vx,vy:shot.vy,s:Math.hypot(shot.vx,shot.vy),r:9,life:5,damage:shot.damage});
  }
  function handleGaiaEvent(item,event) {
    if(event.type==="shot"){items.push(gaiaShot(event));combatSound("enemy-phaser",event.x);}
    if(event.type==="mark"){playerMarkedUntil=elapsed+event.seconds;}
    if(event.type==="mine")spawnGaiaMine(event.x,event.y);
    if(event.type==="cross-bomb")items.push(gaiaHazard({id:`gaia-bomb:${++classicThreatSequence}`,gaiaBomb:true,
      x:event.x,baseX:event.x,y:event.y,r:14,damage:NeonCampaign.GAIA_ENEMY_RULES.sower.bomb.damage,bomb:{x:event.x,y:event.y,vx:event.vx}}));
    if(event.type==="shield"){
      const target=items.find(other=>other.id===event.targetId);
      if(target){target.shieldHits=event.hits;target.shieldBy=item.id;}
    }
  }
  /** Avanza un enemigo, mina o bomba de Gaia; false si desaparece. */
  function advanceGaiaItem(item,dt) {
    if(item.gaiaMine) {
      const result=NeonCampaign.advanceMine(item.mine,dt,player);
      if(result==="explode"){addExplosion(item.x,item.y,.6,.4);damageShip(item.damage,item.x,item.y);}
      return result===null;
    }
    if(item.gaiaBomb) {
      const rays=NeonCampaign.advanceCrossBomb(item.bomb,dt,{w:W,h:H});
      item.x=item.bomb.x;
      if(!rays)return true;
      for(const ray of rays)items.push(gaiaShot({...ray,sprite:"orb"}));
      return false;
    }
    const allies=items.filter(other=>other.gaiaEnemy||other.classicScout).map(other=>({id:other.id,x:other.x,y:other.y,hp:other.hp??1,maxHp:other.maxHp??1}));
    const tokens=sectorAttackTokens||(gaiaFallbackTokens??=NeonCampaign.createAttackTokens({max:2}));
    NeonCampaign.advanceGaiaEnemy(item,dt,{now:elapsed,player:{x:player.x,y:player.y,hull,reloading:Boolean(classicWeapons)&&classicWeapons.charges<1},
      bounds:{w:W,h:H},allies,tokens,anchor:atlasAnchor()||subBossAnchor()},event=>handleGaiaEvent(item,event));
    return true;
  }
  function spawnClassicFlightPatrol(role="scout") {
    if(GAIA_KINDS.has(role))return spawnGaiaEnemy(role);
    const ordinal=classicPatrolSequence++;
    const stage=classicFlightView?.stageNumber||0;
    const interceptor=role==="interceptor"&&spriteReady(SPRITES.ch02);
    if(role==="interceptor"&&!interceptor)role="scout";
    ensureSprite(SPRITES.ch01);
    const item=createThreat("scout",level());
    item.id=`${NeonCampaign.CLASSIC_PURSUIT_VERSION}:${currentLevel}:${stage}:${ordinal}`;
    item.x=item.baseX=W*(ordinal%2===0?.25:.75);item.y=-65;item.rot=0;item.rs=0;
    item.flightPatrol=true;item.damage=16;item.s=role==="raider"?150:138;
    item.salvageRole=role;item.salvageDropId=`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`;
    item.r=interceptor?35:32;item.hp=item.maxHp=interceptor?3:2;
    item.classicScout=NeonCampaign.createClassicPursuer({x:item.x,width:W,height:H,role,
      seed:stage*17+ordinal,minAttackY:(classicFlightBounds?.presentationTop||95)+45,baseSpeed:item.s});
    if(interceptor)item.classicScout.animator=NeonCampaign.createCh02Animator({hp:3,maxHp:3});
    items.push(item);
    if(!classicPursuitAnnounced.has(role)) {
      classicPursuitAnnounced.add(role);
      showStoryTransmission(role==="raider"?"N-7":"RED ATLAS",role==="raider"
        ?"Los atacantes nos siguen. Saca el CRONIUM de este campo de restos."
        :role==="interceptor"?"CH-02 en intercepción. Sus motores le permiten cerrar el flanco."
        :"La red Atlas no reconoce nuestra identificación. Mantén el rumbo hacia Gaia.",4.2);
    }
    return item;
  }

  function fireClassicWeapon() {
    if(!classicWeapons || !spriteReady(SPRITES.atlasVfx))return false;
    if(classicChapterControlsLocked())return false;
    const result=NeonCampaign.triggerClassicWeapon(classicWeapons,{x:player.x,y:player.y-125*SHIP_VISUAL.classicScale});
    if(!result.accepted)return false;
    ammo=classicWeapons.charges;manualShotCooldown=classicWeapons.cooldown;
    if(typeof classicTutorial!=='undefined')classicTutorial?.observe({type:'fire'});
    combatSound("phaser");
    cameraKickY=Math.max(cameraKickY,2.5);vibrate(12);updateAmmoHud();return true;
  }

  function fireClassicMissile() {
    if(state!=="playing"||warpTimer>0||classicChapterControlsLocked()||
      atlasBoss?.disabled||!classicWeapons||!classicSalvageLedger||!NeonCampaign.canTriggerClassicMissile(classicWeapons))return false;
    const inventory=classicSalvageLedger.load();
    if(!inventory.ok){syncClassicMissileHud();return false;}
    classicSalvageState=inventory.state;
    // Commit the inventory receipt before emitting a physical projectile. A
    // failed or repeated write cannot create a free or duplicated missile.
    const spent=classicSalvageLedger.spendMissile({shotId:classicSalvageLedger.nextMissileShotId()});
    if(spent.state)classicSalvageState=spent.state;
    if(!spent.ok||spent.duplicate){syncClassicMissileHud();return false;}
    const fired=NeonCampaign.triggerClassicMissile(classicWeapons,{x:player.x,
      y:player.y-72*SHIP_VISUAL.classicScale,shotId:`missile:${classicSalvageState.missileShotsSpent}`});
    syncClassicMissileHud();
    if(!fired.accepted)return false;
    if(typeof classicTutorial!=='undefined')classicTutorial?.observe({type:'missile'});
    cameraKickY=Math.max(cameraKickY,3);combatSound("missile-launch",player.x,`missile:${classicSalvageState.missileShotsSpent}`);vibrate(16);
    return true;
  }

  function advanceClassicWeaponField(dt) {
    if(!classicWeapons)return;
    for(const shot of classicWeapons.projectiles){shot.previousX=shot.x;shot.previousY=shot.y;}
    const events=NeonCampaign.advanceClassicWeapons(classicWeapons,dt);
    ammo=classicWeapons.charges;
    if(atlasBoss && !atlasBoss.disabled) {
      for(const shot of [...classicWeapons.projectiles]) {
        const radius=atlasBoss.vulnerability?atlasBoss.coreRadius:atlasBoss.r;
        if(squaredDistanceToSegment(atlasBoss.x,atlasBoss.y,shot.previousX??shot.x,shot.previousY??shot.y,shot.x,shot.y) > (radius+shot.radius)**2)continue;
        const contact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,"guardian-atlas");
        if(!contact.accepted)continue;
        // Shield contact consumes a shot too; vulnerability is checked on arrival.
        const dx=shot.x-(shot.previousX??shot.x),dy=shot.y-(shot.previousY??shot.y);
        const length=dx*dx+dy*dy;
        const t=length?clamp(((atlasBoss.x-(shot.previousX??shot.x))*dx+(atlasBoss.y-(shot.previousY??shot.y))*dy)/length,0,1):0;
        resolveAtlasPulse({atlasTarget:atlasBoss,x2:atlasBoss.x,damage:contact.damage,weapon:shot.weapon,
          impactX:(shot.previousX??shot.x)+dx*t,impactY:(shot.previousY??shot.y)+dy*t});
      }
    }
    if(subBoss&&subBoss.state!=="defeated") {
      for(const shot of [...classicWeapons.projectiles]) {
        if(squaredDistanceToSegment(subBoss.x,subBoss.y,shot.previousX??shot.x,shot.previousY??shot.y,shot.x,shot.y)>(SUB_BOSS_HIT_RADIUS+shot.radius)**2)continue;
        const contact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,"subguardian");
        if(!contact.accepted)continue;
        if(NeonCampaign.hitSubguardian(subBoss,contact.damage).accepted){addImpactEffect(shot.x,shot.y,.8);combatSound("impact-metal",subBoss.x);}
      }
    }
    if(events.some(event=>event.type==="recharged")){uiSound("ammo-ready");updateAmmoHud();}
  }

  function interceptClassicProjectile(item) {
    if(!classicWeapons || atlasBoss || !isThreat(item))return false;
    if(!item.id)item.id=`classic-target:${++classicThreatSequence}`;
    for(const shot of [...classicWeapons.projectiles]) {
      const ax=shot.previousX??shot.x,ay=shot.previousY??shot.y,dx=shot.x-ax,dy=shot.y-ay;
      const cosine=Math.cos(item.rot||0),sine=Math.sin(item.rot||0);
      const intersects=collisionCircles(item).some(circle=>{
        const x=item.x+circle.x*cosine-circle.y*sine,y=item.y+circle.x*sine+circle.y*cosine;
        return squaredDistanceToSegment(x,y,ax,ay,shot.x,shot.y)<=(circle.r+shot.radius)**2;
      });
      if(!intersects)continue;
      const impact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,item.id);
      if(!impact.accepted)continue;
      // El escudo de la Égida recibe el disparo antes que el casco (plan F3b).
      if(item.shieldHits>0){item.shieldHits--;addImpactEffect(item.x,item.y,.6);combatSound("impact-metal",item.x);continue;}
      item.hp=Math.max(0,(item.hp??1)-impact.damage);
      const destroyed=item.hp<=1e-8;
      animateScoutHit(item,destroyed);
      if(shot.weapon==="missile")addMissileImpact(item.x,item.y);else addImpactEffect(item.x,item.y,.8);
      score+=item.classicScoutProjectile?0:(destroyed?10:3);combatSound(destroyed?"enemy-break":"impact-metal",item.x);
      hudScoreTarget=score;
      if(destroyed){
        if(!item.classicScout?.tacticsVersion)addExplosion(item.x,item.y,.7,.5);
        return true;
      }
    }
    return false;
  }

  // Atlas solo se combate en S1-V5 (decisión del propietario, 21/10/2026).
  // S1-V1 termina en la baliza: Atlas avisa de lejos, sin combate.
  function isAtlasMission() {
    return currentLevel === 0 && classicSideVoyage?.ficha.boss === "atlas";
  }

  // Viajes secundarios (fichas distintas de S1-V1, p. ej. S1-V2): guardado en
  // su propia clave, sin historia del capítulo, tutorial, inicio ni Atlas.
  function loadSideVoyageRecord(ficha) {
    const route=NeonCampaign.createVoyageRoute(ficha),raw=storage.getJSON(ficha.saveKey,null);
    const checkpoint=raw?.version===1&&raw.voyage===ficha.id?route.normalizeCheckpoint(raw.checkpoint,{goal:ficha.baseGoal}):null;
    const stars=Math.trunc(Math.min(3,Math.max(0,Number(raw?.stars)||0)));
    // Entrada del tramo (como S1-V1, más el CRONIUM perdido). Los registros
    // antiguos no la tienen y un valor dañado se ignora: se empieza como antes.
    const e=raw?.entry,entry=checkpoint&&Number.isFinite(e?.hull)&&e.hull>0&&e.hull<=100&&
      Number.isInteger(e.score)&&e.score>=0&&Number.isFinite(e.maxCombo)&&e.maxCombo>=1&&e.maxCombo<=12&&
      e.collected===checkpoint.collected&&(e.reserve===undefined||(Number.isFinite(e.reserve)&&e.reserve>=0&&e.reserve<=65))&&
      (e.missed===undefined||(Number.isInteger(e.missed)&&e.missed>=0))?e:null;
    return checkpoint?{version:1,voyage:ficha.id,checkpoint,completed:raw.completed===true,inProgress:raw.inProgress===true,stars,entry}:null;
  }
  function saveSideVoyage(checkpoint,completed=false,stars=0) {
    if(!classicSideVoyage||!checkpoint)return false;
    // Rejugar un viaje hecho no borra su marca ni sus mejores estrellas. La
    // entrada guarda casco y CRONIUM perdido; lo que aún cae no cuenta.
    // inProgress distingue una partida a medias de un viaje solo completado
    // (auditoría L01): así reintentar una rejugada vuelve a su tramo.
    const {ficha}=classicSideVoyage,previous=loadSideVoyageRecord(ficha),record={version:1,voyage:ficha.id,checkpoint,
      completed:completed||previous?.completed===true,inProgress:!completed,stars:Math.max(stars,previous?.stars||0),
      entry:{hull:Math.max(1,Math.min(100,hull)),reserve:classicHullReserve,score:Math.max(0,Math.floor(score)),maxCombo,
        collected:checkpoint.collected,missed:Math.max(0,energySpawned-collected-items.filter(item=>item.type==="energy").length)}};
    const saved=storage.setJSON(ficha.saveKey,record);
    if(!saved)toast("No se pudo guardar este tramo. El guardado anterior sigue conservado.");
    return saved;
  }
  // Sector continuo (plan F3a): su progreso vive solo en el guardado de
  // sectores. Un guardado ilegible o inválido cuenta como partida nueva.
  // Revivir con anuncio en el sector: lo prepara finishGame y lo gasta resumeReward.
  let sectorRevive=null,sectorDeathRecorded=false;
  // Turnos de ataque del tramo (plan F3b): solo en el sector; los viajes
  // antiguos conservan su escalada.
  let sectorAttackTokens=null;
  function resetSectorAttackTokens() {
    const rules=isSectorRun()&&classicFlightView?NeonCampaign.getVoyageStageRules(classicFlightView.routeId,classicFlightView.stageNumber):null;
    sectorAttackTokens=rules?NeonCampaign.createAttackTokens({max:rules.attackers??2}):null;
    if(sectorAttackTokens)sectorAttackTokens.baseMax=sectorAttackTokens.max;
  }
  // La regla de morir se guarda al estallar la nave (tramo 1, o 6 con baliza),
  // no al abrir la derrota: cerrar la app durante la explosión no la salta.
  function recordSectorDeath() {
    if(!isSectorRun()||sectorDeathRecorded)return;
    const save=loadSectorSave();
    sectorRevive=NeonCampaign.useRevive(save);
    saveSector(NeonCampaign.dieInSector(save));
    sectorDeathRecorded=true;
  }
  function skipChapterIntro() {
    if(!classicChapterStory?.skipIntro())return;
    // Omitir lleva el mundo al estado posterior a la ruptura (revisión B1):
    // la cinemática se dibuja con el reloj de la ruta, así que se adelanta
    // hasta que Cronos Prime se ha ido, en vez de seguir bajo el HUD.
    const gone=NeonCampaign.CHRONOS_INTRO_TIMELINE?.gone||0;
    for(let i=0;i<2000&&classicFlight&&classicFlightView.elapsed<gone;i++)
      classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);
    classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
    // Fuera la línea de LIRA de antes de la ruptura (revisión R8).
    flightTransmission=null;
    showStoryTransmission("N-7","Los atacantes nos siguen. Saca el CRONIUM de este campo de restos.",4);
    classicPursuitAnnounced.add("raider"); // ya dicho: el primer perseguidor no lo repite (C1)
  }
  function isSectorRun() {
    const ficha=classicSideVoyage?.ficha;
    return Boolean(ficha)&&NeonCampaign.getSectorFicha(ficha.id)===ficha;
  }
  function loadSectorSave() {
    return NeonCampaign.normalizeSectorSave(storage.getJSON(NeonCampaign.SECTOR_SAVE_KEY,null))||NeonCampaign.createSectorSave();
  }
  function loadMenuUnlocks() {
    return NeonCampaign.normalizeMenuUnlocks(storage.getJSON(NeonCampaign.MENU_UNLOCKS_KEY,null));
  }
  function rememberMenuUnlocks(unlocks) {
    const stored=loadMenuUnlocks();
    if(unlocks.hangar!==stored.hangar||unlocks.seen.hangar!==stored.seen.hangar)storage.setJSON(NeonCampaign.MENU_UNLOCKS_KEY,unlocks);
  }
  function rememberIntroSeen() {
    const unlocks=loadMenuUnlocks();
    if(!unlocks.seen.intro)storage.setJSON(NeonCampaign.MENU_UNLOCKS_KEY,NeonCampaign.markMenuSeen(unlocks,"intro"));
  }
  // Al abrir el hangar por primera vez desaparece el aviso NUEVO.
  function markHangarSeen() {
    rememberMenuUnlocks(NeonCampaign.markMenuSeen(loadMenuUnlocks(),"hangar"));
    $("openHangar")?.classList.remove("is-new");
  }
  function saveSector(save) {
    const saved=storage.setJSON(NeonCampaign.SECTOR_SAVE_KEY,save);
    if(!saved)toast("No se pudo guardar este tramo. El guardado anterior sigue conservado.");
    return saved;
  }
  // El inicio de Chronos (historia y tutorial) es de S1-V1 y de las fichas con
  // `intro`, como el sector 1 (propietario, 23/10/2026).
  function fichaHasIntro() {
    return !classicSideVoyage||classicSideVoyage.ficha.intro===true;
  }
  function startSector(id) {
    const ficha=NeonCampaign.getSectorFicha(id);
    if(!ficha)return false;
    classicVoyageRequestedStage=null;classicSideVoyagePending=ficha;startLevel(0);return true;
  }
  function startSideVoyage(voyageId) {
    const ficha=NeonCampaign.getVoyageFicha(NeonCampaign.VOYAGES.find(item=>item.id===voyageId)?.routeId);
    if(!ficha)return false;
    // Un tramo elegido en la ficha de S1-V1 no se arrastra a otro viaje.
    classicVoyageRequestedStage=null;classicSideVoyagePending=ficha;startLevel(0);return true;
  }
  // S1-V5: vencer a Atlas autoriza el segundo cañón (Gemelo). Un registro de
  // equipo corrupto solo se sustituye si sus bytes exactos ya tienen copia de
  // seguridad; si no, no se escribe nada. Repetir la victoria no duplica nada.
  function awardAtlasWeapon() {
    if(!classicEquipmentWritable)return null;
    const raw=storage.getRaw(CLASSIC_EQUIPMENT_KEY);
    let valid=raw===null;
    try {valid=raw===null||NeonCampaign.normalizeClassicEquipment(JSON.parse(raw))!==null;} catch {}
    if(!valid) {
      const backups=storage.getJSON(CLASSIC_EQUIPMENT_KEY+":invalid-backups",[]);
      if(!Array.isArray(backups)||!backups.includes(raw))return null;
    }
    const award=NeonCampaign.awardClassicBossWeapon(classicEquipment,"guardian-atlas");
    return persistClassicEquipment(award.equipment)?award:null;
  }

  // Pantalla de completado de un viaje del mapa: misma pantalla que S1-V1,
  // con su puntuación y «Siguiente viaje». La ficha se conserva mientras se
  // ve, para que «Repetir» vuelva a lanzar este mismo viaje.
  function completeSideVoyage() {
    const {ficha}=classicSideVoyage,sector=isSectorRun();
    const firstTime=sector?loadSectorSave().sectors[ficha.sector]?.completed!==true:loadSideVoyageRecord(ficha)?.completed!==true;
    const earned=runStars();
    // Sin el arma guardada, el viaje del jefe no se marca como completado.
    const atlasVictory=ficha.boss==="atlas"&&Boolean(atlasBoss?.resolved);
    const award=atlasVictory?awardAtlasWeapon():null;
    const saved=(!atlasVictory||award)&&(sector
      ?saveSector(NeonCampaign.completeSector(loadSectorSave(),ficha.sector,earned))
      :saveSideVoyage(classicFlight.exportCheckpoint(),true,earned));
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;cancelSupplyFailureTimer();
    setState("complete");setClassicFlightHudVisible(false);
    if(classicWeapons){classicWeapons.projectiles.length=0;NeonCampaign.setClassicUnlimitedFire(classicWeapons,false);}
    atlasBoss=null;resetAtlasFury();ui.atlasEncounter?.classList.add("hidden");document.body.classList.remove("atlas-combat");
    hideWarning();hideStoryTransmission();
    ui.hud.classList.add("hidden");ui.powerHud.classList.add("hidden");ui.fire.classList.add("hidden");ui.banner.classList.remove("show");
    // Decisión del propietario (tablero, rev32-ads): un viaje del mapa cuenta
    // como partida para los intersticiales solo la primera vez que se completa.
    if(firstTime&&saved&&!continued)registerRun();
    const next=nextCampaignVoyage();
    ui.completeLabel.textContent=`VIAJE COMPLETADO · SECTOR ${ficha.sector}`;
    ui.completeTitle.textContent=`${ficha.id} · ${ficha.title}`;
    if(ui.completeVisual)ui.completeVisual.dataset.scene=ficha.sector===2?"belt":"rift";
    ui.starsAwarded.innerHTML=[1,2,3].map(value=>`<span class="${value<=earned?"":"off"}">★</span>`).join("");
    ui.levelScore.textContent=Math.max(0,Math.floor(score));
    ui.levelHull.textContent=`${Math.ceil(hull)}%`;
    ui.maxCombo.textContent=`x${maxCombo}`;
    ui.unlockMessage.textContent=!saved?"No se pudo guardar el viaje en este dispositivo."
      :next?`Siguiente: ${next.voyage} · ${next.title}.`:"Has completado todos los viajes disponibles.";
    // El sector 2 aún no existe: tras el sector 1 se vuelve al menú.
    if(sector) {
      ui.completeLabel.textContent=`SECTOR ${ficha.sector} COMPLETADO`;
      if(saved)ui.unlockMessage.textContent="El sector 2 llega pronto.";
    }
    if(atlasVictory) {
      ui.completeTitle.textContent="Atlas ha abierto el paso";
      ui.unlockMessage.textContent=!award
        ?"No se pudo guardar el segundo cañón en este dispositivo. El viaje no se ha marcado como completado: repítelo para intentarlo de nuevo."
        :`IRIA · GAIA: Usaron tu señal para atacar Chronos. El convoy vino de Vulkar. Tienes paso libre.${award.granted?" Segundo cañón autorizado: Gemelo ×2 disponible en el taller.":""} ${ui.unlockMessage.textContent}`;
    }
    ui.nextLevel.classList.remove("hidden");
    ui.nextLevel.textContent=sector?"VOLVER AL MENÚ":next?`SIGUIENTE VIAJE: ${next.voyage} →`:"VER EL MAPA →";
    overlay(ui.complete);
    uiSound("stage-complete");vibrate([30,40,70]);
    updateMenu();
  }

  function setupAtlasEncounter() {
    const mount = document.createElement("section");
    mount.id = "atlasEncounter"; mount.className = "atlas-encounter cockpit-boss-signal hidden";
    mount.setAttribute("aria-label", "Encuentro Guardian Atlas");
    mount.innerHTML = `<div class="atlas-identity"><b>GUARDIAN ATLAS</b><span id="atlasPhase">CONTENCIÓN ORBITAL</span><progress id="atlasHealth" max="1" value="1" aria-label="Integridad de Guardian Atlas"></progress></div><p id="atlasStatus" role="status">Recupera el CRONIUM antes de cruzar el perímetro.</p>`;
    canvas.parentElement.append(mount);
    for (const id of ["atlasEncounter", "atlasHealth", "atlasPhase", "atlasStatus"]) ui[id] = $(id);
    syncAtlasHud();
  }

  function positionAtlasArena() {
    if (!atlasBoss) return;
    const rect = canvas.getBoundingClientRect();
    const horizontal = rect.height < 500;
    const anchorY = classicFlightAnchorY || player.y;
    atlasBoss.width = W; atlasBoss.height = H; atlasBoss.playerY = anchorY;
    const hudBottom = Math.max($('hud').getBoundingClientRect().bottom,
      ui.atlasEncounter?.getBoundingClientRect().bottom || 0,
      ui.flightObjective?.getBoundingClientRect().bottom || 0);
    const headerClearance = (Math.max(0, hudBottom - rect.top) + 8) * H / Math.max(1, rect.height);
    const shipTop = anchorY - 145*SHIP_VISUAL.classicScale;
    // Poses have distinct reactor pivots. Reserve the complete authored cell,
    // including the highest ring and lowest wreckage, rather than half a tile.
    atlasBoss.visualSize = Math.min(horizontal ? 300 : 350,
      Math.max(80, (shipTop - headerClearance - 12) / 1.07));
    atlasBoss.targetY = clamp(H * .30,
      headerClearance + atlasBoss.visualSize * .55,
      shipTop - atlasBoss.visualSize * .52);
    // Reflow the presentation envelope, never reset a moving boss to its anchor
    // whenever a status line changes. The model moves the real core/collider.
    atlasBoss.presentationHalfWidth=atlasBoss.visualSize*.58;
  }

  function beginAtlasEncounter() {
    // La ruta ya exige la cuota de su último tramo (canFinish); la del nivel
    // antiguo (36) no vale aquí: con 33 en el sector, Atlas no llegaba nunca.
    if (!isAtlasMission() || atlasBoss || !classicFlightView?.canFinish || state !== "playing") return false;
    if (typeof resetGameInput === "function") resetGameInput();
    cancelSupplyFailureTimer();
    atlasBoss = NeonCampaign.createGuardianAtlas({width: W, height: H, playerY: player.y});resetAtlasFury();
    // Vida de Atlas según el modo de dificultad (Normal = la de siempre).
    const bossHealth=NeonCampaign.DIFFICULTY_MODES?.[settings.difficulty]?.bossHealth??1;
    if(bossHealth!==1)atlasBoss.hp=atlasBoss.maxHp=Math.round(atlasBoss.maxHp*bossHealth);
    NeonCampaign.setClassicUnlimitedFire(classicWeapons,true);
    document.body.classList.add("atlas-combat");ui.atlasEncounter.classList.remove("hidden");
    positionAtlasArena();
    atlasFireTimer = 0; atlasReentryGrace = 0; atlasLastStatus = "";
    items = []; gates = []; shots = []; tractorTarget = null;
    if(classicWeapons)classicWeapons.projectiles.length=0;
    setClassicFlightHudVisible(true);
    ensureSprite(SPRITES.guardianAtlas); ensureSprite(SPRITES.atlasVfx); ensureSprite(SPRITES.atlasExplosion);
    hideWarning(); ui.banner.classList.remove("show");
    document.body.classList.add("atlas-combat");
    ui.atlasEncounter.classList.remove("hidden");
    ui.goal.previousElementSibling.textContent = "CRONIUM";
    ui.goal.textContent = `${collected}/${level().goal}`;
    syncAtlasHud(); refreshClassicFlightBounds(); updateAmmoHud();
    uiSound("boss-alert");
    return true;
  }

  function syncAtlasHud() {
    if (!ui.atlasEncounter) return;
    if (!atlasBoss) return;
    // El mismo panel muestra al CH-03 (plan F3c): el título vuelve a ser el de Atlas.
    const title = ui.atlasEncounter.querySelector(".atlas-identity b");
    if (title && title.textContent !== "GUARDIAN ATLAS") title.textContent = "GUARDIAN ATLAS";
    const health = atlasBoss.hp / atlasBoss.maxHp;
    const phaseLabel = atlasBoss.disabled ? "ENLACE RESTAURADO" : `FASE ${atlasBoss.phase}`;
    if (ui.atlasHealth.value !== health) ui.atlasHealth.value = health;
    let layoutChanged = false;
    if (ui.atlasPhase.textContent !== phaseLabel) { ui.atlasPhase.textContent = phaseLabel; layoutChanged = true; }
    let status;
    if (!spriteReady(SPRITES.guardianAtlas) || !spriteReady(SPRITES.atlasVfx)) status = "Atlas no se ha cargado. Pausa y vuelve al menú para reintentar.";
    else if (atlasReentryGrace > 0) status = "Enlace recuperado. Retoma el control.";
    else if (atlasBoss.state === "entry") status = "Tu carga activa la contención. Desactiva el núcleo para abrir el paso.";
    else if (atlasBoss.state === "disabled") status = "Atlas: «Identidad confirmada. Gaia autoriza el acceso».";
    else if (atlasBoss.state === "phaseBreak") status = "N-7: «Es un bucle de contención. Rompe el enlace, salva al guardián».";
    else if (atlasBoss.state === "charge") status = "CONTENCIÓN ORBITAL ACTIVA";
    else status = atlasBoss.vulnerability ? "NÚCLEO EXPUESTO · alinea la nave y abre fuego." : "BLINDAJE CERRADO · Atlas cambia de flanco.";
    if (status !== atlasLastStatus) { ui.atlasStatus.textContent = status; atlasLastStatus = status; layoutChanged = true; }
    if (layoutChanged) positionAtlasArena();
  }

  // Furia de Atlas (plan F3c): escenario roto, rayo Fulminante (su aviso
  // marca la mitad que va a barrer) y escoltas, nunca más de 4 a la vez.
  let atlasFuryScene=false,atlasBeam=null,atlasBeamWarning=null;
  function resetAtlasFury() { atlasFuryScene=false;atlasBeam=null;atlasBeamWarning=null; }
  // Escoltas de Atlas en su furia y del subguardián desde que aparece.
  function spawnAtlasEscorts(count,anchor=atlasAnchor()) {
    if(!anchor)return;
    const alive=items.filter(item=>item.gaia?.kind==="atlasEscort").length;
    for(let k=alive;k<count;k++) {
      const angle=k*Math.PI/2,radius=anchor.r*NeonCampaign.GAIA_ENEMY_RULES.atlasEscort.orbit.radius;
      const item=spawnGaiaEnemy("atlasEscort");
      item.gaia.angle=angle;item.x=item.baseX=anchor.x+Math.cos(angle)*radius;item.y=anchor.y+Math.sin(angle)*radius;
    }
  }
  function spawnAtlasDrones(event) {
    for(let k=0;k<event.count;k++) {
      const item=spawnClassicFlightPatrol("scout");
      item.atlasDrone=true;item.x=item.baseX=event.x+(k%2?60:-60);item.y=event.y+30;
    }
  }
  // Las escoltas giran a 1,6·r del radio visible de Atlas, no del de colisión:
  // así quedan por fuera de su silueta.
  function atlasAnchor() {
    return atlasBoss&&!atlasBoss.disabled?{x:atlasBoss.x,y:atlasBoss.y,r:(atlasBoss.visualSize||350)*.45}:null;
  }
  function updateAtlasBeam(dt) {
    if(!atlasBeam)return;
    atlasBeam.remaining-=dt;
    if(atlasBeam.remaining<=0){atlasBeam=null;return;}
    // Durante la gracia no cuenta: el rayo aún puede alcanzar la nave cuando acabe.
    if(!atlasBeam.hit&&hullGrace<=0&&player.x+SHIP_COLLISION_HALF_WIDTH>=atlasBeam.x0&&player.x-SHIP_COLLISION_HALF_WIDTH<=atlasBeam.x1) {
      atlasBeam.hit=true;damageShip(atlasBeam.damage,player.x,player.y);
    }
  }

  function consumeAtlasEvent(event) {
    if (event.type === "projectile") items.push(event.projectile);
    if (event.clearProjectiles || event.type === "shutdown") {
      items = items.filter(item => !item.guardianProjectile);
    }
    if (event.type === "volley") combatSound(event.attackTier==="basic"?"enemy-phaser":"enemy-heavy",event.x??atlasBoss.x);
    // Fulminante: alarma durante la carga, que dice qué mitad va a barrer.
    if (event.type === "fulminant") {
      atlasBeamWarning={x0:event.x0,x1:event.x1};
      combatSound("atlas-charge",atlasBoss.x);flash=Math.max(flash,.22);
      showStoryTransmission("COMANDANTE IRIA · GAIA","¡Fulminante! Atlas va a barrer tu mitad: cambia de lado.",1.6);
    }
    if (event.type === "beam") { atlasBeamWarning=null;atlasBeam={x0:event.x0,x1:event.x1,remaining:event.seconds,damage:event.damage,hit:false}; }
    if (event.type === "drones") spawnAtlasDrones(event);
    if (event.type === "fury") { atlasFuryScene=true;ensureSprite(SPRITES.atlasFury);ensureSprite(SPRITES.atlasEscorts);spawnAtlasEscorts(event.escorts); }
    if (event.type === "volley" && event.fulminant) { shake=Math.max(shake,6);cameraKickY=Math.max(cameraKickY,4); }
    if (event.type === "phase") { cameraKickY = Math.max(cameraKickY, 3); uiSound("boss-alert"); }
    if (event.type === "shutdown") {
      atlasBeam=atlasBeamWarning=null;
      // Las escoltas caen con Atlas.
      for(const escort of items.filter(item=>item.gaia?.kind==="atlasEscort"))addExplosion(escort.x,escort.y,.6,.4);
      items=items.filter(item=>item.gaia?.kind!=="atlasEscort");
      score += 250;combatSound("atlas-collapse",atlasBoss.x);
      // Explosión del baúl durante el apagado (1,55 s): el completado llega
      // como siempre, ~0,75 s después de que se apague. Sin imagen, como antes.
      if(spriteReady(SPRITES.atlasExplosion))addAtlasExplosion(atlasBoss);
      spawnClassicScrap({x:atlasBoss.x,y:atlasBoss.y,bossSalvage:true,salvageDropId:"guardian-atlas"});
    }
    if (event.type === "disabled") completeLevel();
  }

  function updateAtlasEncounter(dt) {
    if (!atlasBoss || dt <= 0) return;
    if (!spriteReady(SPRITES.guardianAtlas) || !spriteReady(SPRITES.atlasVfx)) { syncAtlasHud(); return; }
    if (atlasReentryGrace > 0) { atlasReentryGrace = Math.max(0, atlasReentryGrace - dt); syncAtlasHud(); return; }
    // Slow affects both the guardian's warning/recovery clock and its bullets.
    // A different clock could announce a new corridor over an older curtain.
    const previousState=atlasBoss.state;
    NeonCampaign.advanceGuardianAtlas(atlasBoss, dt * (powers.slow > 0 ? .5 : 1), player, consumeAtlasEvent);
    // En un viaje del mapa la victoria completa el viaje dentro del evento y
    // retira a Atlas; no queda nada que actualizar en este fotograma.
    if(!atlasBoss)return;
    updateAtlasBeam(dt * (powers.slow > 0 ? .5 : 1));
    if(atlasBoss.state==="charge"&&previousState!=="charge")combatSound("atlas-charge",atlasBoss.x);
    if (state !== "playing") return;
    atlasFireTimer = Math.max(0, atlasFireTimer - dt);
    if (settings.autoFire && atlasFireTimer === 0 && atlasBoss.vulnerability && Math.abs(atlasBoss.x - player.x) < 115) {
      if (fireManualShot()) atlasFireTimer = .42;
    }
    syncAtlasHud();
  }

  function fireAtlasPulse(kind) {
    if (!atlasBoss || atlasBoss.disabled || !spriteReady(SPRITES.guardianAtlas)) return false;
    // Exactly the same straight, physical battery projectiles as in the field.
    // A misplaced tap can miss; no ray is bent toward the boss or deleted.
    if (kind !== "phaser") return fireClassicWeapon();
    // A collected temporary phaser is a separate timed power, never AUTO input.
    if (kind === "phaser") {
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({x1:player.x,y1:player.y-125,x2:player.x,y2:atlasBoss.y,
        life:.24,duration:.24,kind:"phaser",atlasPulse:true,atlasTarget:atlasBoss,damage:1});
      return true;
    }
    return false;
  }

  function resolveAtlasPulse(shot) {
    if (state !== "playing" || shot.atlasTarget !== atlasBoss || atlasBoss.disabled) return;
    if (Math.abs(shot.x2 - atlasBoss.x) > atlasBoss.r) return;
    const result = NeonCampaign.hitGuardianAtlas(atlasBoss, shot.damage || 1);
    for (const event of result.events) consumeAtlasEvent(event);
    if (result.accepted) {
      score += 3;
      if (shot.weapon==="missile")addMissileImpact(shot.impactX??atlasBoss.x,shot.impactY??atlasBoss.y);
      else if (settings.effects) {
        if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
        impactEffects.push({x: atlasBoss.x, y: atlasBoss.y, angle: 0, scale: 1,
          life: .24, duration: .24, atlasImpact: true});
      }
      combatSound("impact-metal",atlasBoss.x);
    } else {if(shot.weapon==="missile")addMissileImpact(shot.impactX??atlasBoss.x,shot.impactY??atlasBoss.y);combatSound("impact-plasma",atlasBoss.x);}
    syncAtlasHud();
  }

  // Hangar (paso del hangar, 30/10/2026): elegir entre las 10 naves de
  // SHIP_ROSTER con el arte de GPT (maqueta art-ui-hangar-v2). Se puede mirar
  // cualquiera; solo se pilota una conseguida. Comprar con chatarra o pagar
  // llega después (revisión de la economía y tienda).
  function setupShipHangar() {
    if ($("shipHangar")) return;
    const menuActions = ui.menu.querySelector(".menu-actions");
    if (!menuActions) return;
    const roster = NeonCampaign.SHIP_ROSTER;

    const openButton = document.createElement("button");
    openButton.id = "openHangar";
    openButton.type = "button";
    openButton.className = "secondary menu-hangar-button hidden";
    openButton.innerHTML = '<span class="menu-button-text"><span>ENTRAR AL HANGAR</span><small>ELIGE TU NAVE</small></span><b class="menu-new" aria-label="Nuevo">NUEVO</b>';
    menuActions.classList.add("has-hangar");
    menuActions.append(openButton);

    const hangar = document.createElement("div");
    hangar.id = "shipHangar";
    hangar.className = "overlay ship-hangar hidden";
    hangar.setAttribute("role", "dialog");
    hangar.setAttribute("aria-modal", "true");
    hangar.setAttribute("aria-labelledby", "shipHangarTitle");
    // Celdas de los atlas del hangar (scripts/build-hangar-assets.py): naves en
    // 5×2 y los 20 iconos de habilidad en 5×4, en el orden de SHIP_ROSTER.
    const shipPosition = index => `${(index % 5) * 25}% ${Math.floor(index / 5) * 100}%`;
    const iconPosition = slot => `${(slot % 5) * 25}% ${Math.floor(slot / 5) * (100 / 3)}%`;
    const slots = roster.map((ship, index) => `<button type="button" class="hangar-slot" data-ship="${ship.id}" aria-pressed="false" aria-label="${ship.name}"><span class="hangar-thumb" style="background-position:${shipPosition(index)}"></span><small>${ship.number}</small><em></em></button>`).join("");
    hangar.innerHTML = `<section class="panel ship-hangar-panel hangar-v2" tabindex="-1">
      <header class="hangar-head"><small>ELIGE TU NAVE</small><h2 id="shipHangarTitle">HANGAR</h2></header>
      <figure class="hangar-stage"><span id="hangarShipArt" class="hangar-ship-art" role="img"></span>
        <figcaption><b id="shipHangarName"></b><span id="hangarShipRole"></span></figcaption></figure>
      <div class="hangar-grid" role="group" aria-label="Las 10 naves">${slots}</div>
      <div class="hangar-plate">
        <div class="hangar-ability"><i class="hangar-icon" id="hangarIconExclusive"></i><p><small id="hangarExclusiveLabel"></small><b id="hangarExclusiveName"></b></p></div>
        <div class="hangar-ability"><i class="hangar-icon" id="hangarIconUltimate"></i><p><small>ÚLTIMA</small><b id="hangarUltimateName"></b></p></div>
      </div>
      <ul class="hangar-ability-text"><li id="hangarExclusiveText"></li><li id="hangarUltimateText"></li></ul>
      <p id="shipHangarStatus" class="hangar-status" role="status"></p>
      <footer class="ship-hangar-actions"><button id="shipHangarBack" class="secondary" type="button">VOLVER</button><button id="shipApply" class="primary" type="button"></button></footer>
    </section>`;
    canvas.closest(".game").append(hangar);
    ui.shipHangar = hangar;
    const panel = hangar.querySelector(".ship-hangar-panel");
    const slotButtons = [...hangar.querySelectorAll("[data-ship]")];

    function shipState() {
      const sector = loadSectorSave();
      const save = NeonCampaign.normalizeShipSave(storage.getJSON(NeonCampaign.SHIP_ROSTER_KEY, null), sector);
      return {sector, save, owned: NeonCampaign.ownedShips(sector, save)};
    }
    function accessText(ship) {
      const {access} = ship;
      if (access.type === "free") return access.sector === 0 ? "Gratis desde el principio." : `Gratis: se consigue al vencer al jefe del sector ${access.sector}.`;
      if (access.type === "scrap") return `Se compra con ${access.price.toLocaleString("es-ES")} de chatarra. La compra llegará pronto.`;
      return "Nave de pago. La tienda llegará pronto.";
    }
    function refreshHangar() {
      const {save, owned} = shipState();
      const index = roster.findIndex(ship => ship.id === shipHangarDraft);
      const ship = roster[index];
      for (const button of slotButtons) {
        const entry = roster.find(item => item.id === button.dataset.ship), mine = owned.includes(entry.id);
        button.setAttribute("aria-pressed", String(entry.id === shipHangarDraft));
        button.classList.toggle("is-chosen", entry.id === save.selected);
        button.classList.toggle("is-locked", !mine && entry.access.type !== "paid");
        button.classList.toggle("is-paid", !mine && entry.access.type === "paid");
        button.querySelector("em").textContent = mine ? "" : entry.access.type === "scrap"
          ? `${entry.access.price / 1000}K` : entry.access.type === "paid" ? "PAGO" : "";
      }
      $("hangarShipArt").style.backgroundPosition = shipPosition(index);
      $("hangarShipArt").setAttribute("aria-label", `Nave ${ship.name}`);
      $("shipHangarName").textContent = ship.name.toUpperCase();
      $("hangarShipRole").textContent = ship.role.toUpperCase();
      $("hangarIconExclusive").style.backgroundPosition = iconPosition(index * 2);
      $("hangarIconUltimate").style.backgroundPosition = iconPosition(index * 2 + 1);
      $("hangarExclusiveLabel").textContent = `EXCLUSIVA · ${ship.exclusive.cooldown} S`;
      $("hangarExclusiveName").textContent = ship.exclusive.name;
      $("hangarUltimateName").textContent = ship.ultimate.name;
      $("hangarExclusiveText").textContent = ship.exclusive.text;
      $("hangarUltimateText").textContent = ship.ultimate.text;
      const mine = owned.includes(ship.id);
      $("shipHangarStatus").textContent = !mine ? accessText(ship) : ship.id === save.selected ? "Es la nave que pilotas." : "La tienes: pulsa PILOTAR para usarla.";
      $("shipApply").textContent = mine ? `PILOTAR ${ship.name.toUpperCase()}` : "NO LA TIENES";
      $("shipApply").disabled = !mine || ship.id === save.selected;
    }

    function fly(id) {
      flownShip = id;
      if (id !== "aster") ensureSprite(SPRITES.flightPoses);
      shipPresentationSignature = "";
    }
    function closeHangar() {
      hangar.classList.remove("show");
      hangar.classList.add("hidden");
      shipHangarDraft = null;
      overlay(ui.menu);
      openButton.focus({ preventScroll: true });
    }

    openButton.onclick = () => {
      if (state !== "menu" || !(ui.menu.classList.contains("show") || ui.briefing.classList.contains("show"))) return;
      shipHangarDraft = shipState().save.selected;
      refreshHangar();
      hangar.classList.remove("hidden");
      overlay(hangar);
      panel.focus({ preventScroll: true });
    };
    for (const button of slotButtons) button.onclick = () => {
      if (!shipHangarDraft) return;
      shipHangarDraft = button.dataset.ship;
      refreshHangar();
    };
    $("shipApply").onclick = () => {
      if (!shipHangarDraft) return;
      const {sector, save} = shipState();
      const chosen = NeonCampaign.chooseShip(save, shipHangarDraft, sector);
      if (!chosen) return;
      if (!storage.setJSON(NeonCampaign.SHIP_ROSTER_KEY, chosen)) {
        $("shipHangarStatus").textContent = "No se pudo guardar. Tu nave anterior sigue elegida.";
        return;
      }
      fly(chosen.selected);
      toast(`Nave elegida: ${roster.find(ship => ship.id === chosen.selected).name}`);
      closeHangar();
    };
    $("shipHangarBack").onclick = closeHangar;
    hangar.addEventListener("keydown", event => {
      // Las teclas del hangar no llegan a los controles de la partida.
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        closeHangar();
      } else if (event.key === "Tab") {
        const controls = [...hangar.querySelectorAll("button")].filter(element => !element.disabled);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
    fly(shipState().save.selected);
  }

  function updateMenu() {

    ui.best.textContent = bestScore();
    // El menú sigue el sector continuo (decisión del propietario, 23/10/2026:
    // JUGAR abre el sector 1; los viajes antiguos solo en el panel de desarrollo).
    const save=loadSectorSave(),run=save.run,done=save.sectors[1]?.completed===true;
    const stars=Object.values(save.sectors).reduce((sum,record)=>sum+record.stars,0);
    const stage=run?run.stageNumber:done?11:1,percent=Math.round((stage-1)*10);
    ui.unlockedText.textContent=`${save.unlocked}/10`;
    ui.totalStars.textContent=`${stars}/30`;
    ui.campaignPercent.textContent=`${percent}%`;
    ui.campaignFill.style.width=`${percent}%`;
    // Los botones se abren con la historia (propietario, 24/10/2026); en
    // pruebas (?dev=1) el hangar está siempre a mano.
    const view=NeonCampaign.menuView(save,loadMenuUnlocks());
    rememberMenuUnlocks(view.unlocks);
    ui.playLabel.textContent=view.play.label;
    ui.playSector.textContent=view.play.detail;
    const hangarButton=$("openHangar");
    if(hangarButton){
      hangarButton.classList.toggle("hidden",!view.hangar.visible&&!DEV);
      hangarButton.classList.toggle("is-new",view.hangar.isNew);
    }
    ui.campaignNodes.innerHTML=Array.from({length:10},(_,index)=>
      `<span class="${index+1<stage?"done ":""}${index+1===stage?"current":""}"></span>`).join("");
    buildLevelGrid();
  }

  // Mientras el tramo espera CRONIUM, el contador muestra su cuota (R6).
  function croniumGoalLabel() {
    return classicFlightView?.waitingFor==="cronium"?`${collected}/${classicFlightView.stageGoal}`:`${collected}/${level().goal}`;
  }

  function hud() {
    hudScoreTarget = score;
    if (state !== "playing") displayedScore = score;
    ui.score.textContent = Math.round(displayedScore);
    ui.goal.textContent = croniumGoalLabel();
    ui.hull.textContent = `${Math.max(0, Math.ceil(hull))}%`;
    ui.hull.title=`Casco ${Math.ceil(hull)} de 100. Refuerzo ${Math.ceil(classicHullReserve)} de ${classicHullReserveCapacity}, sin temporizador.`;
    let reserve=$("hullReserve");
    if(!reserve){reserve=document.createElement("span");reserve.id="hullReserve";ui.hull.after(reserve);}
    reserve.textContent=classicHullReserve>0?`+${Math.ceil(classicHullReserve)}`:"";
    // Los 10 viajes corren en currentLevel 0: la casilla muestra el viaje
    // (ficha del mapa o la de S1-V1), no un «NIVEL 1» que nunca cambia.
    // En el sector la casilla dice SECTOR y su número (auditoría 25/10, A6).
    const sectorRun = isSectorRun();
    ui.hudLevel.textContent = sectorRun ? String(classicSideVoyage.ficha.sector)
      : classicSideVoyage ? classicSideVoyage.ficha.id
      : NeonCampaign.PLAYABLE_VOYAGES.find(ficha => ficha.id === "S1-V1").id;
    ui.hudLevel.previousElementSibling.textContent = sectorRun ? "SECTOR" : "VIAJE";
    // En espera de CRONIUM la cifra es la cuota del tramo, también en pausa (A2).
    ui.goal.previousElementSibling.textContent=classicFlightView?.waitingFor==="cronium"?"TRAMO":"CRONIUM";
    ui.hullBar.style.width = `${clamp(hull, 0, 100)}%`;
    ui.hullBar.style.background = hull > 66
      ? "linear-gradient(90deg,#63ffc4,#64e9ff)"
      : hull > 33
        ? "linear-gradient(90deg,#ffe166,#ff9f55)"
        : "linear-gradient(90deg,#ff5b7c,#ff2e55)";

    if (collected > lastHudCollected) animateHud(ui.goal, "hud-pop");
    if (hull < lastHudHull) {
      animateHud(ui.hull, "hud-damage");
      animateHud(ui.hullBar?.parentElement, "hud-damage");
    }
    lastHudCollected = collected;
    lastHudHull = hull;
    updateAmmoHud();
    syncClassicFlightHud();
  }

  function updateAmmoHud() {
    if (!ui.fire || !ui.ammo) return;
    if(classicWeapons) {
      ammo=classicWeapons.charges;
      ui.ammo.textContent="";
      ui.fire.disabled=state!=="playing" || warpTimer>0;
      ui.fire.setAttribute("aria-disabled", String(ui.fire.disabled || (!classicWeapons.unlimitedFire&&ammo<=0) || manualShotCooldown>0));
      ui.fire.classList.toggle("empty",!classicWeapons.unlimitedFire&&ammo<=0);
      syncClassicMissileHud();
      const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
      const tuned=(classicEquipment.selected==='scatter'&&classicSalvageState?.upgrades.includes('scatter-focus'))||
        (classicEquipment.selected==='needle'&&classicSalvageState?.upgrades.includes('needle-resonance'));
      if(ui.fireWeapon)ui.fireWeapon.textContent=weapon.label.toUpperCase()+(tuned?' II':'');
      ui.fire.setAttribute("aria-label",ammo>0?`Mantener para disparar ${weapon.label}. La energía se recupera durante el vuelo.`:"El arma está recuperando energía. Mantén para disparar cuando esté disponible.");
      return;
    }
    if (atlasBoss) {
      ui.fire.classList.remove("empty");
      ui.ammo.textContent = manualShotCooldown > 0 ? "RECARGA" : "PULSO BÁSICO · ∞";
      ui.fire.disabled = state !== "playing" || warpTimer > 0;
      ui.fire.setAttribute("aria-disabled", String(ui.fire.disabled || manualShotCooldown > 0));
      ui.fire.setAttribute("aria-label", "Mantener para disparar pulso básico sin munición limitada");
      return;
    }
    ui.ammo.textContent = `${ammo}/${MAX_AMMO}`;
    const unavailable = state !== "playing" || ammo <= 0 || manualShotCooldown > 0 || warpTimer > 0;
    ui.fire.disabled = state !== "playing" || warpTimer > 0;
    ui.fire.setAttribute("aria-disabled", String(unavailable));
    ui.fire.classList.toggle("empty", ammo <= 0);
    ui.fire.setAttribute("aria-label", ammo > 0
      ? `Mantener para disparar. Munición ${ammo} de ${MAX_AMMO}`
      : "Mantener para disparar cuando recuperes munición");
  }

  function animateHud(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function updateHudVisual(dt) {
    const difference = hudScoreTarget - displayedScore;
    if (Math.abs(difference) < 0.5) displayedScore = hudScoreTarget;
    else displayedScore += difference * Math.min(1, dt * 11);
    ui.score.textContent = Math.round(displayedScore);
  }

  function updatePowerHud() {
    let layoutChanged = false;
    const map = [
      ["shield", ui.powerShield],
      ["tractor", ui.powerTractor],
      ["slow", ui.powerSlow],
      ["double", ui.powerDouble],
      ["phaser", ui.powerPhaser]
    ];
    for (const [name, element] of map) {
      const active = powers[name] > 0;
      if (element.classList.contains("active") !== active) layoutChanged = true;
      element.dataset.power = name;
      element.classList.toggle("active", active);
      element.querySelector("em").textContent = active ? Math.ceil(powers[name]) : "0";
    }
    // Only additions/removals can resize the row. Countdown frames must not
    // measure layout; a newly collected power must not cover the ship's tail.
    if (layoutChanged && state === "playing") refreshClassicFlightBounds();
  }

  function updateEncounterHud() {
    ui.encounterProgress.classList.toggle("active", false);
  }

  // Mapa de sector (docs/design/MAPA_SECTOR.md): rutas del sector 1 y bases
  // con conversación. Sin guardado propio: S1-V1 está hecho si Gaia se abrió.
  let sectorMapShown = 1;
  // Progreso de la campaña de viajes: qué viajes están hechos y estado de
  // cada sector. Lo usan el mapa, «Jugar» y la pantalla de completado.
  // Estrellas de una ronda (misma regla para S1-V1 y los viajes del mapa):
  // 3 con casco ≥90 % y casi todo el CRONIUM, 2 con casco ≥55 %, si no 1.
  function runStars() {
    const missed = energySpawned - collected;
    return hull >= 90 && missed <= Math.ceil(energyBudget * 0.1) ? 3 : hull >= 55 ? 2 : 1;
  }
  /** Mejores estrellas guardadas de un viaje (0 si no se ha completado). */
  // Un viaje hecho vale al menos 1: los guardados anteriores a las estrellas
  // por viaje (o con un valor dañado) no salen como «HECHO ☆☆☆».
  function voyageStars(voyageId) {
    if (voyageId === "S1-V1") return getUnlocked() >= 2 ? Math.max(1, getStars()[1] || 0) : 0;
    const ficha = NeonCampaign.PLAYABLE_VOYAGES.find(item => item.id === voyageId);
    const record = ficha ? loadSideVoyageRecord(ficha) : null;
    return record?.completed ? Math.max(1, record.stars) : 0;
  }
  function campaignSectors() {
    if (typeof NeonCampaign.sectorMapState !== "function") return [];
    const firstDone = getUnlocked() >= 2;
    const sideDone = NeonCampaign.PLAYABLE_VOYAGES.filter(ficha => ficha.id !== "S1-V1" && loadSideVoyageRecord(ficha)?.completed)
      .map(ficha => ficha.id);
    const progress = {playable: NeonCampaign.PLAYABLE_VOYAGES.map(ficha => ficha.id),
      completed: [...(firstDone ? ["S1-V1"] : []), ...sideDone]};
    return Object.keys(NeonCampaign.SECTOR_MAPS).map(Number).map(id => NeonCampaign.sectorMapState(id, progress));
  }
  /** Siguiente viaje de la campaña (la primera ruta abierta), o null. */
  function nextCampaignVoyage() {
    for (const sector of campaignSectors()) {
      const route = sector.routes.find(item => item.status === "open");
      if (route) return route;
    }
    return null;
  }
  function buildSectorMap() {
    if (!ui.sectorMap || typeof NeonCampaign.sectorMapState !== "function") return;
    const sectors = campaignSectors();
    const sideDone = sectors.flatMap(sector => sector.routes).filter(route => route.status === "done").map(route => route.voyage);
    if (!sectors.find(item => item.id === sectorMapShown)?.open) sectorMapShown = 1;
    const map = sectors.find(item => item.id === sectorMapShown);
    const place = id => map.places.find(item => item.id === id);
    const pct = value => `${(value * 100).toFixed(1)}%`;
    ui.sectorMap.replaceChildren();
    ui.sectorMap.setAttribute("aria-label", map.title);
    // Pestañas de sector: un sector se abre al terminar el anterior.
    const tabs = document.createElement("div"); tabs.className = "sector-tabs"; tabs.setAttribute("role", "tablist");
    for (const sector of sectors) {
      const tab = document.createElement("button");
      tab.type = "button"; tab.className = "sector-tab"; tab.setAttribute("role", "tab");
      tab.dataset.sector = String(sector.id); tab.textContent = sector.open ? `SECTOR ${sector.id}` : `SECTOR ${sector.id} 🔒`;
      tab.disabled = !sector.open; tab.setAttribute("aria-selected", String(sector.id === map.id));
      tab.onclick = () => { sectorMapShown = sector.id; closeBaseTalk(); buildSectorMap();
        ui.sectorMap.querySelector(`[data-sector="${sector.id}"]`)?.focus(); };
      tabs.append(tab);
    }
    ui.sectorMap.append(tabs);
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lines.setAttribute("viewBox", "0 0 100 100"); lines.setAttribute("preserveAspectRatio", "none");
    lines.setAttribute("aria-hidden", "true"); lines.classList.add("sector-map-lines");
    for (const route of map.routes) {
      const from = place(route.from), to = place(route.to);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
      path.setAttribute("x1", from.x * 100); path.setAttribute("y1", from.y * 100);
      path.setAttribute("x2", to.x * 100); path.setAttribute("y2", to.y * 100);
      path.dataset.status = route.status; lines.append(path);
    }
    ui.sectorMap.append(lines);
    for (const item of map.places) {
      const node = document.createElement(item.kind === "base" ? "button" : "div");
      node.className = "sector-place"; node.dataset.kind = item.kind; node.dataset.place = item.id;
      node.style.left = pct(item.x); node.style.top = pct(item.y);
      node.innerHTML = `<i aria-hidden="true"></i><b>${item.label}</b>${item.note ? `<small>${item.note}</small>` : ""}`;
      if (item.kind === "base") { node.type = "button"; node.onclick = () => openBaseTalk(item.id === "gaia" ? "gaia" : "c9", sideDone.includes("S1-V5"), node); }
      ui.sectorMap.append(node);
    }
    for (const route of map.routes) {
      const from = place(route.from), to = place(route.to);
      const node = document.createElement("button");
      node.type = "button"; node.className = "sector-route"; node.dataset.status = route.status;
      node.dataset.voyage = route.voyage;
      node.style.left = pct((from.x + to.x) / 2); node.style.top = pct((from.y + to.y) / 2);
      const stars = route.status === "done" ? ` ${"★".repeat(voyageStars(route.voyage))}${"☆".repeat(3 - voyageStars(route.voyage))}` : "";
      node.innerHTML = `<small>${route.voyage}${route.status === "done" ? " · HECHO" + stars : route.status === "locked" ? " · EN PREPARACIÓN" : ""}</small><b>${route.title}</b>`;
      node.disabled = route.status === "locked";
      if (route.status !== "locked") node.onclick = () => route.voyage === "S1-V1" ? prepareLevel(0, "levels") : startSideVoyage(route.voyage);
      ui.sectorMap.append(node);
    }
  }

  let baseTalkState = null;
  function openBaseTalk(baseId, atlasConvinced, opener = null) {
    const talk = NeonCampaign.baseConversation(baseId, {atlasConvinced});
    if (!talk || !ui.baseTalk) return;
    baseTalkState = {talk, index: 0, opener: opener?.dataset.place || null};
    $("baseTalkFace").dataset.actor = talk.actor.id;
    $("baseTalkName").textContent = `${talk.actor.name.toUpperCase()} · ${talk.actor.role}`;
    showBaseTalkLine();
    ui.baseTalk.hidden = false;
    $("baseTalkNext").focus();
  }
  function showBaseTalkLine() {
    const {talk, index} = baseTalkState;
    $("baseTalkLine").textContent = talk.lines[index].text;
    const last = index >= talk.lines.length - 1;
    if (last && document.activeElement === $("baseTalkNext")) $("baseTalkClose").focus();
    $("baseTalkNext").hidden = last;
  }
  function closeBaseTalk() {
    const opener = baseTalkState?.opener;
    baseTalkState = null;
    if (ui.baseTalk) ui.baseTalk.hidden = true;
    // El foco vuelve a la base que abrió la conversación.
    if (opener) ui.sectorMap?.querySelector(`[data-place="${opener}"]`)?.focus();
  }

  // RUTA muestra solo el mapa de la campaña de viajes: los niveles clásicos
  // ya no forman parte del juego (orden del propietario, 21/10/2026).
  function buildLevelGrid() {
    buildSectorMap(); closeBaseTalk();
  }

  function prepareLevel(index, returnTo = "menu") {
    classicVoyageRequestedStage=null;
    pendingLevel = clamp(index, 0, getUnlocked() - 1);
    briefingReturn = returnTo;
    const lv = LEVELS[pendingLevel];
    ui.briefingSector.textContent = "VIAJE S1-V1";
    ui.briefingName.textContent = lv.name;
    ui.briefingZone.textContent = `${lv.world} · ${lv.zone}`;
    ui.briefingGoal.textContent = `${lv.goal} CRONIUM`;
    ui.briefingThreat.textContent = lv.threatLabel;
    ui.briefingSupply.textContent = `${lv.goal + Math.ceil(lv.goal * 0.25)} disponibles`;
    ui.briefingMission.textContent = lv.mission;
    ui.briefingVisual.dataset.scene = lv.scene;
    ui.briefingPanel.style.setProperty("--brief-accent", lv.accent);
    buildChronosStageGrid();
    // El inicio de Chronos empieza a cargar al abrir la ficha, no al despegar.
    if(pendingLevel===0)[SPRITES.chronosIntroStation,SPRITES.chronosIntroFragments,SPRITES.cronosPrimeVideo,
      SPRITES.chronosStationBurst,SPRITES.cronosPrimeFx,SPRITES.cronosPrimeBeam].forEach(ensureSprite);
    overlay(ui.briefing);
  }

  function closeBriefing() {
    classicVoyageRequestedStage=null;
    if (briefingReturn === "levels") overlay(ui.levelSelect);
    else if (briefingReturn === "complete") overlay(ui.complete);
    else overlay(ui.menu);
  }

  function showBanner() {
    ui.bannerSector.textContent = `SECTOR ${currentLevel + 1}`;
    ui.bannerName.textContent = level().name.toUpperCase();
    ui.bannerGoal.textContent = `Recupera ${level().goal} núcleos · ${level().desc}`;
    ui.banner.classList.add("show");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => ui.banner.classList.remove("show"), 2500);
  }

  function resetPowers() {
    for (const key in powers) powers[key] = 0;
    classicShieldAge=0;classicShieldImpact=0;
    tractorTarget = null;
    updatePowerHud();
  }

  function hideWarning() {
    ui.hazardWarning.classList.remove("show");
  }

  const LEVEL_ONE_STORY = [
    { at: 2.8, speaker: "IA N-7", text: "Centro Cronos, responda. Repito: Centro Cronos, responda." },
    { at: 18, speaker: "IA N-7", text: "Sin respuesta. Detecto fragmentos temporales dentro del corredor." },
    { at: 42, speaker: "IA N-7", text: "La radiación no coincide con ningún accidente registrado." }
  ];

  function hideStoryTransmission() {
    ui.storyTransmission?.classList.remove("show");
    flightTransmission=null;
  }

  function showStoryTransmission(speaker, text, duration = 4.6) {
    if(/LIRA|N-7/.test(speaker))duckMusic(.6);
    if(ui.flightRoute) {
      flightTransmission={speaker,speakerId:/MIRA/.test(speaker)?"mira":/IRIA/.test(speaker)?"iria":/LIRA/.test(speaker)?"lira":null,text,remaining:duration};syncClassicFlightHud();return;
    }
    if (!ui.storyTransmission) return;
    ui.storySpeaker.textContent = speaker;
    ui.storyText.textContent = text;
    ui.storyTransmission.classList.add("show");
    storyTimer = duration;
    uiSound("transmission");
  }

  function updateLevelStory(dt) {
    if(flightTransmission) {
      flightTransmission.remaining=Math.max(0,flightTransmission.remaining-dt);
      if(flightTransmission.remaining===0){flightTransmission=null;syncClassicFlightHud();}
    }
    if (storyTimer > 0) {
      storyTimer = Math.max(0, storyTimer - dt);
      if (storyTimer === 0) hideStoryTransmission();
    }
    if(classicChapterStory&&classicFlightView) {
      classicChapterStory.advance({elapsed:classicFlightView.elapsed,playing:state==="playing"},classicChapterEvent);
      classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
      advanceClassicTutorial();
    }
    if (classicFlight || currentLevel !== 0 || state !== "playing" || warpTimer > 0) return;
    const next = LEVEL_ONE_STORY[storyStep];
    if (next && elapsed >= next.at) {
      showStoryTransmission(next.speaker, next.text);
      storyStep++;
    }
    if (elapsed >= 31 && !levelOneShockwaveTriggered) {
      levelOneShockwaveTriggered = true;
      levelOneShockwave = 0.62;
      stormPulse = Math.max(stormPulse, 0.42);
      shake = Math.max(shake, 12);
      cameraKickY = 8;
      pulseRing(player.x, player.y + SHIP_VISUAL.centerYOffset, "#a5faff", 245, 0.56, "pulse");
      burst(player.x, player.y + SHIP_VISUAL.centerYOffset, 38, "cyan");
      uiSound("rupture");
      showStoryTransmission("IA N-7", "Onda expansiva. Mantén el rumbo.", 3.2);
    }
  }

  function startLevel(index = currentLevel) {
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    hullGrace = 0;
    playerMarkedUntil = -Infinity;
    classicGuideSeen = null;classicCroniumWaitNotice = null;classicCroniumWaitAt = -Infinity;classicCroniumWaitShown = null;lastResumeGraceAt = -Infinity;
    cancelSupplyFailureTimer();
    startMusic();
    currentLevel = clamp(index, 0, getUnlocked() - 1);
    let voyageEntry=null,voyageCheckpoint=null;
    // Reintentar o reiniciar (desde pausa o derrota) conserva el viaje secundario.
    const sideFicha=classicSideVoyagePending||(["paused","gameover","complete"].includes(state)?classicSideVoyage?.ficha:null);
    // Reintentar o reiniciar (no abrir desde el mapa) reanuda una rejugada a medias (B02).
    // «Repetir» tras completar empieza siempre en el 1 (revisión P02).
    const sideRetry=!classicSideVoyagePending&&state!=="complete";
    // Solo «Repetir» el mismo viaje; «Siguiente viaje» sí reanuda el suyo (A1).
    const sideReplay=!classicSideVoyagePending&&state==="complete";
    classicSideVoyage=currentLevel===0&&sideFicha?{ficha:sideFicha,route:NeonCampaign.createVoyageRoute(sideFicha)}:null;
    classicSideVoyagePending=null;
    if(isSectorRun()){
      // «Continuar» vuelve al inicio del tramo guardado con su casco; sin
      // partida en curso (o tras completar el sector) se empieza en el tramo 1.
      const {ficha,route}=classicSideVoyage,requested=classicVoyageRequestedStage;
      let save=loadSectorSave();
      const point=NeonCampaign.continuePoint(save);
      if(requested>=1&&requested<=route.stageCount){
        voyageCheckpoint=route.createCheckpoint(requested,{goal:LEVELS[0].goal});
        saveSector(NeonCampaign.enterStage(NeonCampaign.startSectorRun(save,ficha.sector),requested,100));
      } else if(point&&point.sector===ficha.sector){
        voyageCheckpoint=route.createCheckpoint(point.stageNumber,{goal:LEVELS[0].goal});
        voyageEntry={hull:point.hull,score:0,maxCombo:1};
      } else saveSector(NeonCampaign.startSectorRun(save,ficha.sector));
    } else if(classicSideVoyage){
      const record=loadSideVoyageRecord(classicSideVoyage.ficha);
      // Un tramo pedido (panel de desarrollo) manda sobre el punto guardado.
      const requested=classicVoyageRequestedStage;
      if(requested>=1&&requested<=classicSideVoyage.route.stageCount)voyageCheckpoint=classicSideVoyage.route.createCheckpoint(requested,{goal:LEVELS[0].goal});
      // «Repetir» tras completar nunca reanuda un punto viejo, ni en la primera pasada (A5).
      else if(record&&!sideReplay&&(!record.completed||(record.inProgress&&sideRetry))){voyageCheckpoint=record.checkpoint;voyageEntry=record.entry;}
    } else if(currentLevel===0){
      const requested=classicVoyageRequestedStage;
      const resume=classicVoyageRecord&&!classicVoyageRecord.completed&&(!requested||requested===classicVoyageRecord.checkpoint.stageNumber);
      if(resume){voyageCheckpoint=classicVoyageRecord.checkpoint;voyageEntry=classicVoyageRecord.entry;}
      else if(requested){voyageCheckpoint=NeonCampaign.createChronosVoyageCheckpoint(requested,{goal:LEVELS[0].goal});}
    }
    classicVoyageRequestedStage=null;
    classicFlight=classicSideVoyage ? classicSideVoyage.route.create({goal:LEVELS[0].goal,checkpoint:voyageCheckpoint})
      : currentLevel===0 ? NeonCampaign.createChronosVoyage({goal:LEVELS[0].goal,checkpoint:voyageCheckpoint}) : null;
    classicFlightView=classicFlight?.snapshot() || null;
    resetSectorAttackTokens();
    // Un intento que empieza pasado el tramo 5 ya dejó atrás al subguardián.
    subBoss=null;subBossBurn=null;subBossBeaten=Boolean(classicFlightView)&&classicFlightView.stageNumber>5;sectorBeaconOffered=false;
    // La historia del capítulo dura 360 s: en los tramos posteriores del sector no hay.
    classicChapterStory=classicFlight&&fichaHasIntro()&&classicFlightView.elapsed<NeonCampaign.CHRONOS_CHAPTER_ROUTE_SECONDS?NeonCampaign.createChronosChapterStory({checkpoint:voyageEntry&&!classicSideVoyage?classicVoyageRecord?.chapter:null,routeElapsed:classicFlightView.elapsed,presentation:"in-world"}):null;
    classicChapterView=classicChapterStory?.snapshot()||null;
    classicTutorial=classicFlight&&fichaHasIntro()?NeonCampaign.createFlightTutorial({routeElapsed:classicFlightView.elapsed,checkpoint:settings.flightTutorial}):null;classicWorkshopOpened=false;
    classicTutorialAnchor=null;classicTutorialSignature='';
    classicWeapons=NeonCampaign.createClassicWeapons({type:classicEquipment.selected,unlocked:classicEquipment.unlocked,width:W,height:H});
    // En el sector, empezar en el tramo 1 es un intento nuevo: sus enemigos
    // vuelven a soltar chatarra (lo ya cobrado se conserva en la bodega).
    beginClassicSalvageRun(isSectorRun()?classicFlightView.stageNumber>1:Boolean(voyageEntry||(classicSideVoyage&&voyageCheckpoint)));
    sectorDeathRecorded=false;
    resetClassicCometShower();
    // A restored entry has already emitted its checkpoint event. Initialize
    // the same encounter grace here instead of waiting for that event to replay.
    classicPatrolTimer=classicFlightView?(classicFlightView.stageNumber===1?4:7):0;
    classicPatrolSequence=0;classicPursuitAnnounced=new Set();classicThreatSequence=0;classicHordeTimer=null;classicHordeSequence=0;classicCometSequence=0;classicCometWarning=-1;flightHudSignature="";
    // Un reintento empieza con un campo nuevo (y su respiro), no con el gastado.
    classicVoyageHazards=null;
    classicVoyageSpawnTimer=1;classicVoyageHazardTimer=10;classicVoyageStageId=classicFlightView?.stageId||"";
    NeonCampaign.endFlightInput(classicFlightInput);
    ensureSprite(SPRITES.chapterMissile);ensureSprite(SPRITES.chapterPortraits);ensureSprite(SPRITES.croniumEnergy);
    ensureSprite(SPRITES.atlasVfx);ensureSprite(SPRITES.gaiaPulse);ensureSprite(SPRITES.hostileOrdnance);ensureSprite(SPRITES.flightWeapons);ensureSprite(SPRITES.forceShieldAtlas);
    if(classicEquipment.selected==="lance")SPRITE_GROUPS.phaser.forEach(ensureSprite);
    if(classicFlight){
      ensureSprite(SPRITES.flightKit);ensureSprite(SPRITES.flightSpace);
      ensureSprite(SPRITES.ch01);
      ensureSprite(SPRITES.chronosDestruction);ensureSprite(SPRITES.chronosShockwave);
      ensureSprite(SPRITES.chronosIntroStation);ensureSprite(SPRITES.chronosIntroFragments);ensureSprite(SPRITES.cronosPrimeVideo);ensureSprite(SPRITES.chronosStationBurst);ensureSprite(SPRITES.cronosPrimeFx);ensureSprite(SPRITES.cronosPrimeBeam);ensureSprite(SPRITES.chronosShockwave);
      ensureSprite(SPRITES.guardianAtlas);
    }

    atlasBoss = null;resetAtlasFury();
    atlasFireTimer = atlasReentryGrace = 0;
    atlasLastStatus = "";
    ui.goal.previousElementSibling.textContent = "NÚCLEOS";
    document.body.classList.remove("atlas-combat");
    ui.atlasEncounter?.classList.add("hidden");
    if (isAtlasMission()) {
      ensureSprite(SPRITES.guardianAtlas);ensureSprite(SPRITES.atlasVfx);
      ensureSprite(SPRITES.ch01);ensureSprite(SPRITES.ch02);
      ensureSprite(SPRITES.flightKit);ensureSprite(SPRITES.flightSpace);ensureSprite(SPRITES.satellite);
    }
    setState("playing");
    score = 0;
    displayedScore = 0;
    hudScoreTarget = 0;
    hull = 100;
    classicHullReserve=classicHullReserveCapacity;
    combo = 1;
    maxCombo = 1;
    comboTimer = 0;
    collected = 0;
    if(classicFlight){
      collected=classicFlightView.collected;
      if(voyageEntry){hull=isSectorRun()?voyageEntry.hull:Math.max(voyageEntry.hull,CLASSIC_RESUME_HULL_FLOOR);classicHullReserve=Math.min(classicHullReserveCapacity,voyageEntry.reserve??classicHullReserveCapacity);score=voyageEntry.score;maxCombo=voyageEntry.maxCombo;}
    }
    ammo = classicWeapons?classicWeapons.charges:INITIAL_AMMO;
    manualShotCooldown = 0;
    elapsed = 0;
    continued = false;
    spawnTimer = 0.35;
    classicScoutTimer = currentLevel === 1 ? 3.8 : 0;
    classicScoutAnnounced = false;
    warpTimer = classicFlight ? 0 : 1.25;
    supplyFailed = false;
    shake = 0;
    flash = 0;
    stormPulse = 0;
    destructionTimer = 0;
    destructionStage = 0;
    playerVisible = true;
    damageSmokeSide = 1;
    damageSmokeLocked = false;
    impactReactionTimer = 0;
    impactReactionSide = 1;
    storyStep = 0;
    storyTimer = 0;
    levelOneShockwave = 0;
    levelOneShockwaveTriggered = false;
    cameraKickX = 0;
    cameraKickY = 0;
    lastHudCollected = 0;
    lastHudHull = 100;
    hideStoryTransmission();
    items = [];
    gates = [];
    clearTransientEffects();
    player.x = player.target = W / 2;
    player.drift = 0;
    resetPowers();
    applyClassicSalvageShield();

    energySpawned = 0;
    // Los fragmentos perdidos antes del punto de control siguen contando.
    if(classicFlight)energySpawned=collected+(voyageEntry?.missed||0);
    energyBudget = level().goal + Math.ceil(level().goal * 0.25);
    powerSpawned = 0;
    powerBudget = 2 + Math.floor(currentLevel / 3);
    repairAllowance = currentLevel >= 3 && Math.random() < 0.45 ? 1 : 0;
    repairSpawned = 0;
    phaserCooldown = 0;
    gateCountdown = level().gate ? 8.5 + Math.random() * 3 : Infinity;

    ui.reward.classList.remove("hidden");
    ui.reward.disabled = false;
    ui.newBest.classList.add("hidden");
    ui.supplyStatus.textContent = "";
    hideWarning();
    overlay();
    ui.hud.classList.remove("hidden");
    ui.powerHud.classList.remove("hidden");
    ui.fire.classList.remove("hidden");
    setClassicFlightHudVisible(true);refreshClassicFlightBounds(true);
    hud();
    updateEncounterHud();
    uiSound("stage-start");
    if(classicFlightView?.waitingFor==="service")beginClassicVoyageService();
    // A1: quien ya vio la intro de Chronos empieza cada intento tras ella.
    if(isSectorRun()&&classicChapterView?.opening.canSkip&&loadMenuUnlocks().seen.intro)skipChapterIntro();
    window.AnalyticsManager?.track("game_start", { level: currentLevel + 1 });
    window.AnalyticsManager?.track("level_start", { level: currentLevel + 1, continued: false });
  }

  function pauseGame() {
    if (state !== "playing") return;
    if (typeof resetGameInput === "function") resetGameInput();
    NeonCampaign.endFlightInput(classicFlightInput);
    setState("paused");
    pauseStartedAt = performance.now();
    hideWarning();
    overlay(ui.paused);
  }

  function resumeGame() {
    if (state !== "paused") return;
    if(ui.flightDock?.classList.contains("show")&&flightDockReturn==="hud"){closeClassicDock();return;}
    setState("playing");
    overlay();
    last = performance.now();
    grantResumeGrace();
    resumeAudio();
  }

  // Gracia de 0,8 s al volver a jugar tras una pausa real (≥ 0,5 s) y como
  // mucho una vez cada 3 s de juego: pausar sin parar no encadena
  // invulnerabilidad (revisiones L2 y R1).
  function grantResumeGrace() {
    if (performance.now() - pauseStartedAt < 500 || elapsed - lastResumeGraceAt < 3) return;
    lastResumeGraceAt = elapsed;
    hullGrace = Math.max(hullGrace, 0.8);
  }

  function goHome() {
    if (typeof resetGameInput === "function") resetGameInput();
    classicSideVoyage=null;subBoss=null;subBossBurn=null;
    classicTutorial=null;classicFlight=null;classicFlightView=null;classicChapterStory=null;classicChapterView=null;
    syncClassicChapterPresentation();
    if(classicWeapons)classicWeapons.projectiles.length=0;
    NeonCampaign.endFlightInput(classicFlightInput);
    setClassicFlightHudVisible(false);
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("menu");
    atlasBoss = null;resetAtlasFury();
    ui.atlasEncounter?.classList.add("hidden");
    document.body.classList.remove("atlas-combat");
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");
    syncClassicChapterPresentation();
    hideWarning();
    hideStoryTransmission();
    overlay(ui.menu);
    updateMenu();
  }

  function registerRun() {
    const games = Math.trunc(Math.max(0, storage.getNumber(KEYS.games, 0))) + 1;
    storage.set(KEYS.games, games);
    const interval = Math.trunc(Math.max(0, Number(window.MONETIZATION_CONFIG?.native?.interstitialEveryRuns) || 0));
    if (interval > 0 && games % interval === 0) window.AdBridge?.showInterstitial?.().catch(() => {});
  }

  function saveScore() {
    // Game-over saves run outside the completion journal. Read both records
    // explicitly before writing: a denied read must never become a zero/default.
    const bestRead=storage.readRaw(KEYS.best),levelsRead=storage.readRaw(KEYS.levelBest);
    if(!bestRead.ok||!levelsRead.ok||!Number.isFinite(score)||score<0)return false;
    const previousBest=bestRead.value===null||bestRead.value===""?0:Number(bestRead.value);
    if(!Number.isFinite(previousBest)||previousBest<0)return false;
    let bests;
    try {bests=levelsRead.value===null?{}:JSON.parse(levelsRead.value);} catch {return false;}
    if(!bests||typeof bests!=="object"||Array.isArray(bests)||
      Object.values(bests).some(value=>!Number.isFinite(Number(value))||Number(value)<0))return false;
    const previousLevel=Object.hasOwn(bests,currentLevel+1)?Number(bests[currentLevel+1]):0;
    if(score>previousBest&&!storage.set(KEYS.best,score))return false;
    if(score>previousLevel)return storage.setJSON(KEYS.levelBest,{...bests,[currentLevel+1]:score});
    return true;
  }

  function completeLevel() {
    if (state !== "playing") return;
    if(classicFlight && !classicFlight.snapshot().canFinish)return;
    if (isAtlasMission()) {
      if (!atlasBoss) { beginAtlasEncounter(); return; }
      if (!atlasBoss.resolved) return;
    }
    if(classicSideVoyage){completeSideVoyage();return;}
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("complete");
    setClassicFlightHudVisible(false);
    if(classicWeapons)classicWeapons.projectiles.length=0;
    ui.atlasEncounter?.classList.add("hidden");
    document.body.classList.remove("atlas-combat");
    hideWarning();
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");

    const earned = runStars();
    // Anuncios (decisiones del tablero rev37-ads-s1v1 y rev37-ads-doble): S1-V1
    // cuenta como partida solo la primera vez, y no si se continuó con anuncio.
    // (Rejugar S1-V1 reescribe su registro como no completado: la señal
    // duradera es el desbloqueo, la misma que usan el mapa y las estrellas.)
    const firstTime=getUnlocked()<2;
    const completedVoyage=classicFlightView?.canFinish
      ? classicVoyageCheckpointRecord(classicFlight.exportCheckpoint(),true) : null;
    // The bounded intent is written before any progress key. S1-V1 no longer
    // carries a boss reward: Atlas and its Gemelo authorization live in S1-V5.
    // (Old pending journals with equipment are still replayed on boot.)
    const completion = !classicVoyageWritable ? {ok:false,status:"blocked"}
      : completionJournal.complete({completionId:`${KEYS.unlocked}:${currentLevel+1}:${runToken}:${Date.now()}`,
        level:currentLevel+1,stars:earned,score:Math.max(0,Math.floor(score)),checkpoint:completedVoyage});
    const progressSaved=completion.ok,newlyUnlocked=Boolean(completion.newlyUnlocked);
    completionPersistenceBlocked=!completion.ok;
    if(completedVoyage&&completion.ok)classicVoyageRecord=completedVoyage;
    if(firstTime&&progressSaved&&!continued)registerRun();
    ui.completeLabel.textContent = currentLevel === LEVELS.length - 1 ? "CAMPAÑA ACTUAL COMPLETADA" : "NIVEL SUPERADO";
    if(ui.completeVisual)ui.completeVisual.dataset.scene=level().scene;
    ui.completeTitle.textContent = currentLevel === LEVELS.length - 1
      ? "Has estabilizado el Colapso Neon"
      : `${level().name} completado`;
    ui.starsAwarded.innerHTML = [1, 2, 3]
      .map((value) => `<span class="${value <= earned ? "" : "off"}">★</span>`)
      .join("");
    ui.levelScore.textContent = score;
    ui.levelHull.textContent = `${Math.ceil(hull)}%`;
    ui.maxCombo.textContent = `x${maxCombo}`;
    ui.unlockMessage.textContent = currentLevel === LEVELS.length - 1
      ? "Puedes volver a cada nivel para mejorar tu resultado"
      : newlyUnlocked
        ? `Nivel ${currentLevel + 2} desbloqueado`
        : "Puedes repetirlo para mejorar el resultado";
    ui.nextLevel.classList.toggle("hidden", currentLevel === LEVELS.length - 1);
    ui.nextLevel.textContent=currentLevel===0
      ?"CRUZAR HACIA GAIA NOVA →":"SIGUIENTE NIVEL →";
    if(currentLevel===0) {
      if(ui.completeVisual)ui.completeVisual.dataset.scene="rift";
      ui.completeLabel.textContent="VIAJE COMPLETADO · S1-V1";
      ui.completeTitle.textContent="Has escapado de Chronos";
      ui.unlockMessage.textContent="N-7 · NAVEGACIÓN: Baliza exterior de Gaia alcanzada con el registro. Gaia aún cree que atacamos Chronos: tendremos que llevar la prueba hasta Atlas.";
      const nextVoyage=nextCampaignVoyage();
      ui.nextLevel.textContent=nextVoyage&&nextVoyage.voyage!=="S1-V1"?`SIGUIENTE VIAJE: ${nextVoyage.voyage} →`:"VER EL MAPA →";
    }
    overlay(ui.complete);
    uiSound("stage-complete");
    vibrate([30, 40, 70]);
    updateMenu();
    if (!progressSaved) toast("No se pudo guardar el progreso en este dispositivo");
    window.AnalyticsManager?.track("level_complete", {
      level: currentLevel + 1, score, hull: Math.ceil(hull), stars: earned, maxCombo
    });
    window.AnalyticsManager?.track("progression", { unlocked: getUnlocked(), totalStars: totalStars() });
  }

  function finishGame(reason = "hull") {
    if (state === "gameover" || state === "complete") return;
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("gameover");
    ui.atlasEncounter?.classList.add("hidden");
    setClassicFlightHudVisible(false);
    supplyFailed = reason === "supply";
    hideWarning();
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");
    const oldBest = bestScore();
    const scoreSaved = saveScore();
    ui.result.textContent = supplyFailed ? "No quedan núcleos suficientes" : "El casco ha cedido";
    ui.supplyStatus.textContent = supplyFailed
      ? `Recuperaste ${collected} de ${level().goal}. El suministro del sector era limitado.`
      : "";
    if (score > oldBest) ui.newBest.classList.remove("hidden");
    ui.final.textContent = score;
    ui.reward.classList.toggle("hidden", continued || supplyFailed);
    // En el viaje se reintenta desde la entrada del tramo guardado, no el sector entero.
    $("retry").textContent = classicFlightView?.stageId ? `REINTENTAR TRAMO ${classicFlightView.stageId}` : "REINTENTAR SECTOR";
    // Sector: el anuncio, si queda en este intento, vuelve a escribir el punto
    // donde estabas.
    if(isSectorRun()) {
      recordSectorDeath();
      if(!sectorRevive)ui.reward.classList.add("hidden");
      const after=loadSectorSave();
      $("retry").textContent=`REINTENTAR SECTOR · TRAMO ${NeonCampaign.continuePoint(after)?.stageNumber||1}`;
      if(after.sectors[classicSideVoyage.ficha.sector]?.beacon)ui.supplyStatus.textContent="Con baliza: vuelves al tramo 6.";
      if(HARDCORE) {
        ui.reward.classList.add("hidden");
        $("retry").textContent="EMPEZAR DE CERO";
        ui.supplyStatus.textContent="HARDCORE: la partida se ha borrado entera. Tu partida normal sigue intacta.";
      }
    }
    overlay(ui.over);
    // Tras continuar con un anuncio con recompensa, otra muerte no cuenta de nuevo.
    if(!continued)registerRun();
    uiSound("defeat");
    updateMenu();
    // Lo último: nada vuelve a escribir la partida HARDCORE tras borrarla.
    if(HARDCORE&&isSectorRun())wipeHardcoreRun();
    if (!scoreSaved) toast("No se pudo guardar el récord en este dispositivo");
    window.AnalyticsManager?.track("death", { level: currentLevel + 1, score, elapsed: Math.round(elapsed) });
    window.AnalyticsManager?.track("death_reason", { level: currentLevel + 1, reason });
  }

  // Borra todo lo de la partida HARDCORE (los ajustes son comunes y quedan).
  // Lo que hay en memoria también: reintentar o salir recarga el juego.
  let hardcoreWiped=false;
  function wipeHardcoreRun() {
    try {
      for(const key of Object.keys(window.localStorage))if(key.startsWith(HARDCORE.prefix))window.localStorage.removeItem(key);
    } catch { /* almacenamiento bloqueado: no queda nada que borrar */ }
    hardcoreWiped=true;
  }
  function reloadGame() { window.location.reload(); }

  function resumeReward() {
    if (HARDCORE || continued || state !== "gameover" || supplyFailed || (isSectorRun() && !sectorRevive)) return false;
    runToken += 1;
    cancelSupplyFailureTimer();
    // Restaura por completo el estado visual y lógico tras la destrucción.
    // La pantalla de derrota se abre después de la animación final, por lo que
    // hay que cancelar cualquier resto de ese estado antes de volver a jugar.
    // En el sector se vuelve con el 25 % (diseño 6.2), una vez por intento.
    if (isSectorRun()) { hull = sectorRevive.hull; saveSector(sectorRevive.save); sectorRevive = null; sectorDeathRecorded = false; }
    else hull = Math.max(hull, 35);
    hullGrace = 0; // la continuación no da invulnerabilidad temporizada
    continued = true;
    setState("playing");
    if (atlasBoss) {
      atlasReentryGrace = 1.25;
      ui.atlasEncounter?.classList.remove("hidden");
    }
    last = performance.now();
    playerVisible = true;
    destructionTimer = 0;
    destructionStage = 0;
    shake = 0;
    flash = 0;
    stormPulse = 0;

    // La nave reaparece centrada y estable; conserva daño medio al 35 %,
    // pero no reutiliza inclinaciones ni efectos de la explosión anterior.
    player.x = clamp(player.x, 78, W - 78);
    player.target = player.x;
    player.drift = 0;
    damageSmokeSide = 1;
    damageSmokeLocked = true;
    impactReactionTimer = 0;
    impactReactionSide = 1;
    storyTimer = 0;
    levelOneShockwave = 0;
    hideStoryTransmission();

    // Avisos de meteoritos pendientes: se cancelan al volver (plan F3b).
    classicMeteorWarnings=[];if(classicAimedRain)classicAimedRain.pending.length=0;
    // Elimina amenazas próximas y todos los residuos visuales de destrucción.
    items = items.filter((item) => !isThreat(item) || item.y < H * 0.38);
    gates = [];
    clearTransientEffects();
    tractorTarget = null;
    gateCountdown = level().gate ? 7 : Infinity;

    // Breve protección para evitar morir de nuevo en el mismo instante.
    powers.shield=0;classicHullReserve=Math.max(classicHullReserve,15);
    if(classicWeapons) {classicWeapons.charges=Math.max(classicWeapons.charges,1);classicWeapons.cooldown=0;classicWeapons.projectiles.length=0;}
    ammo = Math.max(ammo, 1);
    manualShotCooldown = 0;

    overlay();
    ui.hud.classList.remove("hidden");
    ui.powerHud.classList.remove("hidden");
    ui.fire.classList.remove("hidden");
    setClassicFlightHudVisible(true);
    hud();
    updatePowerHud();
    refreshClassicFlightBounds();
    showBanner();
    window.AnalyticsManager?.track("continue_used", { level: currentLevel + 1, elapsed: Math.round(elapsed) });
    return true;
  }
