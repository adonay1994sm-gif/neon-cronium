  function availablePowers() {
    const available = ["repair"];
    if (currentLevel >= 1) available.push("tractor");
    if (currentLevel >= 2) available.push("slow");
    if (currentLevel >= 3) available.push("double");
    if (currentLevel >= 4) available.push("phaser");
    return available;
  }

  function choosePower() {
    if (repairAllowance > repairSpawned && hull <= 66 && Math.random() < 0.18) {
      repairSpawned++;
      return "repair";
    }
    const available = availablePowers();
    return available[(Math.random() * available.length) | 0];
  }

  function meteorShape() {
    const count = 8 + ((Math.random() * 3) | 0);
    return Array.from({ length: count }, () => 0.72 + Math.random() * 0.34);
  }

  function makeCraters(radius) {
    return Array.from({ length: 2 + ((Math.random() * 3) | 0) }, () => ({
      x: (Math.random() - 0.5) * radius * 0.85,
      y: (Math.random() - 0.5) * radius * 0.7,
      r: radius * (0.10 + Math.random() * 0.14)
    }));
  }

  function chooseThreatType(lv) {
    return lv.threatPool[(Math.random() * lv.threatPool.length) | 0];
  }

  function chooseThreatSprite(type, radius, special) {
    if (type === "scout") return "ch01";
    if (special === "comet") return "comet";
    if (type === "meteor") {
      if (radius < 36) return Math.random() < 0.55 ? "meteorSmall" : "meteorSmallAlt";
      if (radius < 40) return Math.random() < 0.58 ? "meteorMedium" : "meteorMediumAlt";
      return "meteorLarge";
    }
    if (type === "satellite") return "satellite";
    const basic = ["debrisMetal", "debrisPanel"];
    const hot = ["debrisHot0", "debrisHot1"];
    const pool = currentLevel >= 4 ? basic.concat(hot) : basic;
    return pool[(Math.random() * pool.length) | 0];
  }

  function threatHitPoints(type, spriteKey, special) {
    if (type === "scout") return 2;
    if (special === "comet") return 2;
    if (type === "satellite") return 3;
    if (type === "scout") {
      radius = 32;
      speed = 172 * lv.speed;
      damage = 26;
    } else if (type === "debris") {
      if (spriteKey === "debrisPanel") return 1;
      if (spriteKey && spriteKey.includes("Hot")) return 3;
      return 2;
    }
    if (spriteKey === "meteorLarge") return 3;
    if (spriteKey && spriteKey.includes("Medium")) return 2;
    return 1;
  }

  // Wreckage is salvageable machinery, unlike CRONIUM, rock or an incoming
  // projectile. Stamp its receipt when it enters the world, not when a shot
  // happens to hit it: damage order and repeated death animation callbacks
  // must never turn one physical fragment into several paid rewards.
  function stampClassicWreckageSalvage(item) {
    if (!["debris", "satellite"].includes(item.type) ||
        !classicSalvageRunId || !classicSalvageState || item.salvageDropId) return item;
    const stage = classicFlightView?.stageId || `${currentLevel + 1}.0`;
    const ordinal = classicSalvageEnemySequence++;
    item.salvageRole = item.type;
    item.salvageRunId = classicSalvageRunId;
    item.salvageDropId = `${stage}:wreck:${item.type}:${ordinal}`;
    item.id = `wreck:${classicSalvageRunId}:${item.salvageDropId}`;
    return item;
  }

  function createThreat(type, lv) {
    const x = 55 + Math.random() * (W - 110);
    let radius = 36;
    let speed = (245 + Math.random() * 110) * lv.speed;
    let damage = 34;
    let special = "";

    if (type === "debris") {
      radius = 27 + Math.random() * 8;
      speed *= 1.08;
      damage = 24;
    } else if (type === "satellite") {
      radius = 39 + Math.random() * 7;
      speed *= 0.92;
      damage = 31;
    } else {
      radius = 33 + Math.random() * 9;
    }

    if (lv.hazard === "dart" && type === "meteor" && Math.random() < 0.34) {
      speed *= 1.72;
      special = "comet";
      damage = 42;
    }
    if (lv.hazard === "overdrive") speed *= 1.10;
    if (lv.hazard === "final" && type === "meteor" && Math.random() < 0.35) {
      speed *= 1.45;
      special = "comet";
      damage = 42;
    }

    const spriteKey = chooseThreatSprite(type, radius, special);
    const hitPoints = threatHitPoints(type, spriteKey, special);

    return stampClassicWreckageSalvage({
      type,
      x,
      baseX: x,
      y: -85,
      r: radius,
      s: speed,
      damage,
      rot: special === "comet" ? 0 : Math.random() * Math.PI * 2,
      rs: special === "comet" ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * (type === "debris" ? 6 : 3.6),
      p: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      amp: 35 + Math.random() * 55,
      special,
      alpha: 1,
      spriteKey,
      hp: hitPoints,
      maxHp: hitPoints,
      shape: type === "meteor" ? meteorShape() : null,
      craters: type === "meteor" ? makeCraters(radius) : null,
      variant: type === "debris" ? (Math.random() < 0.5 ? "panel" : "strut") : "",
      classicScout: type === "scout" ? NeonCampaign.createClassicScout({x, phase: Math.random() * Math.PI * 2, width: W}) : null
    });
  }

  // Peligros de Vulkar (sector 2, encargo enc-nucleo). Para el resto del juego
  // son meteoritos (choque, disparos, daño); solo cambian aspecto y aguante.
  // Núcleo de lava: avanza despacio y aguanta 4 impactos. Mina de plasma:
  // cae como un meteorito, se rompe de 1 impacto y estalla al romperse; el
  // estallido es solo visual (sin daño en área), así no necesita aviso previo.
  // Radios del dibujo: el círculo de choque (r·1,04) cubre la roca o el cuerpo
  // de la mina; las puntas de la mina quedan fuera, a favor del jugador.
  function createVulkarHazard(kind, lv) {
    const threat = createThreat("meteor", lv), core = kind === "lavaCore", hp = core ? 4 : 1;
    return Object.assign(threat, { vulkarHazard: kind, spriteKey: kind, special: "", damage: 34,
      r: core ? 40 : 30, hp, maxHp: hp, rs: core ? (Math.random() - 0.5) * 0.8 : 0,
      speedScale: core ? 0.65 : 1, shape: null, craters: null });
  }

  function addItem() {
    const lv = level();
    const roll = Math.random();
    const canEnergy = energySpawned < energyBudget;
    const canPower = powerSpawned < powerBudget;
    let type;

    if (roll < lv.meteor) {
      type = chooseThreatType(lv);
    } else if (canPower && roll < lv.meteor + lv.power) {
      type = choosePower();
      powerSpawned++;
    } else if (canEnergy) {
      type = "energy";
      energySpawned++;
    } else {
      type = chooseThreatType(lv);
    }

    if (["meteor", "debris", "satellite", "scout"].includes(type)) {
      const threat = createThreat(type, lv);
      // Una formación activa reserva su abertura desde la parte superior de la
      // pantalla hasta la nave. Las amenazas que nacen dentro no llegan a
      // insertarse y, por tanto, nunca pueden taponar la única ruta válida.
      if (!threatOverlapsProtectedCorridor(threat)) items.push(threat);
      return;
    }

    const isPower = type !== "energy";
    // Los núcleos se reducen un 15 % para que la nave conserve protagonismo visual.
    const radius = isPower ? 30 : 22;
    const x = 55 + Math.random() * (W - 110);
    items.push({
      type,
      x,
      baseX: x,
      y: -70,
      r: radius,
      s: (245 + Math.random() * 110) * lv.speed,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 3.6,
      p: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      amp: 35 + Math.random() * 55,
      special: "",
      alpha: 1
    });
  }

  function pointInsidePolygon(x, y, polygon) {
    let inside = false;
    for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
      const [xCurrent, yCurrent] = polygon[current];
      const [xPrevious, yPrevious] = polygon[previous];
      const crosses = (yCurrent > y) !== (yPrevious > y) &&
        x < (xPrevious - xCurrent) * (y - yCurrent) / ((yPrevious - yCurrent) || 0.000001) + xCurrent;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function squaredDistanceToSegment(px, py, ax, ay, bx, by) {
    const segmentX = bx - ax;
    const segmentY = by - ay;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) {
      const dx = px - ax;
      const dy = py - ay;
      return dx * dx + dy * dy;
    }
    const projection = clamp(((px - ax) * segmentX + (py - ay) * segmentY) / lengthSquared, 0, 1);
    const closestX = ax + projection * segmentX;
    const closestY = ay + projection * segmentY;
    const dx = px - closestX;
    const dy = py - closestY;
    return dx * dx + dy * dy;
  }

  // Círculos de colisión reutilizables por forma. collisionCircles se llama
  // por objeto y fotograma; rellenar estos arrays en sitio evita crear
  // basura. Quien llama debe usar el resultado al momento y no guardarlo
  // (copiarlo si necesita conservarlo).
  const SINGLE_COLLISION_CIRCLE = [{ x: 0, y: 0, r: 0 }];
  const SATELLITE_COLLISION_CIRCLES = [{ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }];
  const PANEL_COLLISION_CIRCLES = [{ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }];

  function singleCollisionCircle(radius) {
    const circle = SINGLE_COLLISION_CIRCLE[0];
    circle.x = 0;
    circle.y = 0;
    circle.r = radius;
    return SINGLE_COLLISION_CIRCLE;
  }

  function tripleCollisionCircles(circles, item, offset, sideRadius, centerRadius) {
    circles[0].x = -item.r * offset; circles[0].y = 0; circles[0].r = item.r * sideRadius;
    circles[1].x = 0; circles[1].y = 0; circles[1].r = item.r * centerRadius;
    circles[2].x = item.r * offset; circles[2].y = 0; circles[2].r = item.r * sideRadius;
    return circles;
  }

  function collisionCircles(item) {
    if (item.type === "energy") return singleCollisionCircle(item.r * 1.10);
    if (!isThreat(item)) {
      const factor = item.type === "repair" ? 1.05 : (item.type === "tractor" || item.type === "phaser") ? 0.92 : 1.0;
      return singleCollisionCircle(item.r * factor);
    }
    if (item.classicScout || item.classicScoutProjectile) return singleCollisionCircle(item.r * 0.94);
    if (item.special === "comet") return singleCollisionCircle(item.r * 0.94);
    if (item.type === "satellite") return tripleCollisionCircles(SATELLITE_COLLISION_CIRCLES, item, 0.92, 0.58, 0.70);
    if (item.type === "debris" && item.spriteKey === "debrisPanel") {
      return tripleCollisionCircles(PANEL_COLLISION_CIRCLES, item, 0.68, 0.62, 0.66);
    }
    if (item.type === "debris") return singleCollisionCircle(item.r * 1.08);
    if (item.spriteKey === "meteorLarge") return singleCollisionCircle(item.r * 1.22);
    if (item.spriteKey && item.spriteKey.includes("Medium")) return singleCollisionCircle(item.r * 1.12);
    return singleCollisionCircle(item.r * 1.04);
  }

  // Rectángulo envolvente de la silueta de colisión para descartar rápido los
  // objetos lejanos. Se calcula una sola vez, en el primer uso, cuando la
  // silueta ya está escalada. Solo es un filtro previo: la prueba exacta
  // sigue siendo el polígono.
  let shipCollisionBounds = null;
  function getShipCollisionBounds() {
    if (!shipCollisionBounds) {
      shipCollisionBounds = SHIP_COLLISION_OUTLINE.reduce((bounds, [x, y]) => {
        bounds.left = Math.min(bounds.left, x);
        bounds.right = Math.max(bounds.right, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.bottom = Math.max(bounds.bottom, y);
        return bounds;
      }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
    }
    return shipCollisionBounds;
  }

  function circleHitsShip(localX, localY, radius) {
    const bounds = getShipCollisionBounds();
    if (localX + radius < bounds.left || localX - radius > bounds.right ||
        localY + radius < bounds.top || localY - radius > bounds.bottom) return false;
    if (pointInsidePolygon(localX, localY, SHIP_COLLISION_OUTLINE)) return true;
    const radiusSquared = radius * radius;
    for (let index = 0; index < SHIP_COLLISION_OUTLINE.length; index++) {
      const [ax, ay] = SHIP_COLLISION_OUTLINE[index];
      const [bx, by] = SHIP_COLLISION_OUTLINE[(index + 1) % SHIP_COLLISION_OUTLINE.length];
      if (squaredDistanceToSegment(localX, localY, ax, ay, bx, by) <= radiusSquared) return true;
    }
    return false;
  }

  function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
    const cross = (px, py, qx, qy, rx, ry) => (qx-px)*(ry-py)-(qy-py)*(rx-px);
    const a=cross(ax,ay,bx,by,cx,cy),b=cross(ax,ay,bx,by,dx,dy);
    const c=cross(cx,cy,dx,dy,ax,ay),d=cross(cx,cy,dx,dy,bx,by);
    if(a*b>0 || c*d>0)return false;
    return Math.max(Math.min(ax,bx),Math.min(cx,dx))<=Math.min(Math.max(ax,bx),Math.max(cx,dx))+1e-8 &&
      Math.max(Math.min(ay,by),Math.min(cy,dy))<=Math.min(Math.max(ay,by),Math.max(cy,dy))+1e-8;
  }

  function sweptCircleHitsShip(startX, startY, endX, endY, radius) {
    // Sweep the authored collision polygon itself. Fast nuclei and enemy
    // projectiles must not jump across it, and cosmetic tails never damage it.
    const bounds=getShipCollisionBounds();
    if(Math.max(startX,endX)+radius<bounds.left || Math.min(startX,endX)-radius>bounds.right ||
      Math.max(startY,endY)+radius<bounds.top || Math.min(startY,endY)-radius>bounds.bottom)return false;
    if(circleHitsShip(startX,startY,radius)||circleHitsShip(endX,endY,radius))return true;
    const radiusSquared=radius*radius;
    for(let index=0;index<SHIP_COLLISION_OUTLINE.length;index++) {
      const [ax,ay]=SHIP_COLLISION_OUTLINE[index];
      const [bx,by]=SHIP_COLLISION_OUTLINE[(index+1)%SHIP_COLLISION_OUTLINE.length];
      if(segmentsCross(startX,startY,endX,endY,ax,ay,bx,by) ||
        squaredDistanceToSegment(ax,ay,startX,startY,endX,endY)<=radiusSquared ||
        squaredDistanceToSegment(bx,by,startX,startY,endX,endY)<=radiusSquared)return true;
    }
    return false;
  }

  function releaseClassicShowerComet(item) {
    if(item?.showerComet && typeof classicCometShower!=="undefined" && classicCometShower)
      NeonCampaign.releaseCometShowerItem(classicCometShower,item);
  }

  function hit(item) {
    const cos = Math.cos(item.rot || 0);
    const sin = Math.sin(item.rot || 0);
    for (const circle of collisionCircles(item)) {
      const offsetX = circle.x * cos - circle.y * sin;
      const offsetY = circle.x * sin + circle.y * cos;
      const localX = item.x + offsetX - player.x;
      const localY = item.y + offsetY - player.y;
      if((item.showerComet || item.guardianProjectile || item.classicScoutProjectile || item.salvagePickup) &&
        Number.isFinite(item.previousX) && Number.isFinite(item.previousY)) {
        const previousPlayerX=Number.isFinite(player.previousCollisionX)?player.previousCollisionX:player.x;
        const previousPlayerY=Number.isFinite(player.previousCollisionY)?player.previousCollisionY:player.y;
        if(sweptCircleHitsShip(item.previousX+offsetX-previousPlayerX,
          item.previousY+offsetY-previousPlayerY,localX,localY,circle.r))return true;
      }
      if (circleHitsShip(localX, localY, circle.r)) return true;
    }
    return false;
  }

  function addParticle(seed) {
    if (parts.length >= EFFECT_LIMITS.particles) return false;
    parts.push(particlePool.acquire(seed));
    return true;
  }

  function clearTransientEffects() {
    for (const part of parts) particlePool.release(part);
    parts.length = 0;
    shots.length = 0;
    rings.length = 0;
    explosions.length = 0;
    impactEffects.length = 0;
  }

  function cancelSupplyFailureTimer() {
    if (supplyFailureTimer) clearTimeout(supplyFailureTimer);
    supplyFailureTimer = 0;
    supplyFailureScheduled = false;
  }

  function burst(x, y, count, kind) {
    const factor = settings.effectsQuality === "high" ? 1 : settings.effectsQuality === "normal" ? 0.72 : 0.42;
    const amount = Math.ceil(count * factor);
    for (let index = 0; index < amount; index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 65 + Math.random() * 245;
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.55,
        size: 3 + Math.random() * 8,
        kind
      });
    }
  }

  function directionalBurst(x, y, targetX, targetY, count, kind = "cyan") {
    const factor = settings.effectsQuality === "high" ? 1 : settings.effectsQuality === "normal" ? 0.76 : 0.46;
    const amount = Math.ceil(count * factor);
    const baseAngle = Math.atan2(targetY - y, targetX - x);
    for (let index = 0; index < amount; index++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.62;
      const speed = 150 + Math.random() * 280;
      addParticle({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.34 + Math.random() * 0.34,
        size: 2 + Math.random() * 5,
        kind
      });
    }
  }

  function engineTrail() {
    if (!settings.effects || state !== "playing" || Math.random() > 0.48) return;
    const hardTurn = Math.abs(player.target + player.drift - player.x) > 65;
    const trailScale=SHIP_VISUAL.scale;
    const x = player.x + (hardTurn ? (player.target > player.x ? -1 : 1) * 28 : (Math.random() - 0.5) * 30) * trailScale;
    const y = player.y + 61 * trailScale;
    addParticle({
      x, y, vx: (Math.random() - 0.5) * 28, vy: 125 + Math.random() * 120,
      life: 0.22 + Math.random() * 0.24, size: 2 + Math.random() * 4, kind: "cyan"
    });
  }

  function pulseRing(x, y, color, max = 85, duration = 0.48, style = "single") {
    if (rings.length >= EFFECT_LIMITS.rings) rings.shift();
    rings.push({ x, y, color, max, duration, life: duration, style });
  }

  function addExplosion(x, y, scale = 1, duration = 0.52) {
    if (explosions.length >= EFFECT_LIMITS.explosions) explosions.shift();
    explosions.push({ x, y, scale, life: duration, duration, rotation: Math.random() * Math.PI * 2 });
  }

  function addImpactEffect(x, y, scale = 1, angle = 0) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale, angle, life: 0.24, duration: 0.24, variant: (Math.random() * SPRITE_GROUPS.impact.length) | 0 });
  }

  function addHullSparks(x, y, angle) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale: 1, angle, life: 0.5, duration: 0.5, hullSparks: true });
  }

  // Estallido de la mina de plasma (último fotograma de su hoja): crece y se
  // apaga en 0,45 s. Solo presentación.
  function addPlasmaBlast(x, y) {
    if (!spriteReady(SPRITES.lavaCoreMine)) return;
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale: 1, angle: Math.random() * Math.PI * 2, life: 0.45, duration: 0.45, plasmaBlast: true });
  }

  // Explosión de Atlas vencido (baúl, encargo a04): 8 fotogramas en 0,8 s
  // centrados en su núcleo, con una sacudida corta. Solo presentación.
  function addAtlasExplosion(boss) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x: boss.x, y: boss.y, scale: 1, angle: 0, life: 0.8, duration: 0.8,
      atlasExplosion: true, size: (boss.visualSize || 350) * 1.5 });
    shake = Math.max(shake, 14);
  }

  function addMissileImpact(x,y) {
    if(!settings.effects)return;
    if(impactEffects.length>=EFFECT_LIMITS.impacts)impactEffects.shift();
    impactEffects.push({x,y,scale:1,angle:0,life:.65,duration:.65,missileImpact:true});
  }

  function activatePower(type, item) {
    const durations = { shield: 7, tractor: 8, slow: 6, double: 7, phaser: 7 };
    if (type === "repair") {
      const restored = Math.min(34, 100 - hull);
      hull += restored;
      burst(item.x, item.y, 24, "green");
      pulseRing(item.x, item.y, "#78ff9c", 105, 0.62);
      toast(`Drone de reparación: +${Math.round(restored)}%`);
      uiSound("repair",item.x);
      vibrate(30);
      hud();
      window.AnalyticsManager?.track("ability_used", { level: currentLevel + 1, ability: "repair" });
      return;
    }

    if(type==="shield") {
      powers.shield=0;classicHullReserve=classicHullReserveCapacity;
      classicShieldAge=0;classicShieldImpact=0;ensureSprite(SPRITES.forceShieldAtlas);
      hud();
    } else powers[type] = Math.max(powers[type], durations[type]);
    const effectKind = type === "double" ? "gold" : type === "phaser" ? "green" : type === "shield" ? "cyan" : "violet";
    const effectColor = type === "double" ? "#ffe66c" : type === "phaser" ? "#78ff9c" : type === "shield" ? "#62efff" : "#c58aff";
    burst(item.x, item.y, 20, effectKind);
    pulseRing(item.x, item.y, effectColor, 105, 0.58);
    const names = {
      shield: "Reserva de casco restaurada",
      tractor: "Rayo tractor conectado",
      slow: "Estabilizador activo",
      double: "Sobrecarga de núcleos",
      phaser: "Phaser automático activo"
    };
    toast(names[type]);
    uiSound("power-up");
    vibrate(22);
    updatePowerHud();
    window.AnalyticsManager?.track("ability_used", { level: currentLevel + 1, ability: type });
  }

  function damageShip(amount, x = player.x, y = player.y, context = {}) {
    if (state === "destroying" || state === "gameover") return;
    // Auditoría J06/J07: sin daño durante la gracia (tras un golpe o al reanudar).
    if (typeof hullGrace !== "undefined" && hullGrace > 0) return;
    // Daño recibido según el modo de dificultad (Normal = 1).
    const difficultyDamage = typeof NeonCampaign !== "undefined" && typeof settings !== "undefined"
      ? NeonCampaign.DIFFICULTY_MODES?.[settings.difficulty]?.damage ?? 1 : 1;
    amount *= difficultyDamage;
    const impactAngle = Math.atan2(y - player.y, x - player.x);
    const damageResult = NeonCampaign.resolveHullReinforcement({hull,amount,
      reserve:classicHullReserve,capacity:classicHullReserveCapacity,
      kind:context.kind||"collision",largeAsteroid:context.largeAsteroid===true,
      largeAsteroidScale:context.largeAsteroidScale||1});
    classicHullReserve=damageResult.reserve;
    if (typeof hullGrace !== "undefined") hullGrace = 0.3;
    if (damageResult.absorbed) {
      classicShieldImpact=.18;
      // Revisión G2: el golpe absorbido no se parece a recoger CRONIUM (cian):
      // chispas y aro ámbar, sacudida corta y, la primera vez, N-7 lo explica.
      burst(x, y, 18, "gold");
      pulseRing(x, y, "#edc68a", 90, 0.42);
      if (!settings.reduceEffects) shake = Math.max(shake, 6);
      addImpactEffect(x, y, 0.85, impactAngle);
      combatSound("hull-hit",x);
      // Sin pisar una línea que ya esté en pantalla; si el canal está ocupado, se dice más tarde (R7).
      if (typeof showStoryTransmission === "function" && typeof reserveHitExplained !== "undefined" && !reserveHitExplained &&
          (typeof flightTransmission === "undefined" || !flightTransmission)) {
        reserveHitExplained = true;
        showStoryTransmission("N-7", "Tu refuerzo de casco absorbió el impacto.", 3);
      }
      hud();
      return;
    }

    hull = damageResult.hull;
    if (typeof DEV !== "undefined" && DEV?.invulnerable) hull = 100;
    impactReactionTimer = 0.32;
    impactReactionSide = x >= player.x ? 1 : -1;
    if (!damageSmokeLocked && hull < 67) {
      damageSmokeSide = x >= player.x ? 1 : -1;
      damageSmokeLocked = true;
    }
    combo = 1;
    comboTimer = 0;
    shake = 16;
    flash = 0.26;
    // Golpe al casco: chispas pintadas (baúl, encargo a05) hacia el lado del
    // impacto. El aro rosa con puntos antiguo queda solo si la hoja no cargó.
    // Sin efectos (ajustes) se queda el golpe antiguo, que ya respeta la calidad.
    if (typeof spriteReady === "function" && settings.effects !== false && spriteReady(SPRITES.hullSparks)) addHullSparks(x, y, impactAngle);
    else { burst(x, y, 28, "red"); pulseRing(x, y, "#ff496f", 110, 0.48); }
    addImpactEffect(x, y, 1.05, impactAngle);
    combatSound("hull-hit",x);
    vibrate([45, 35, 60]);
    hud();

    if (damageResult.destroyed) {
      // Estado intermedio: detiene la partida, centra visualmente la nave y deja
      // terminar la destrucción antes de abrir la pantalla de derrota.
      setState("destroying");
      recordSectorDeath();
      destructionTimer = 1.18;
      destructionStage = 0;
      playerVisible = true;
      player.target = player.x;
      player.drift = 0;
      tractorTarget = null;
      for (const key in powers) powers[key] = 0;
      ui.powerHud.classList.add("hidden");
      hideWarning();
      for(const item of items)releaseClassicShowerComet(item);
      items = [];
      gates = [];
      shots.length = 0;
      addExplosion(player.x, player.y + SHIP_VISUAL.centerYOffset, 1.65, 0.92);
      addImpactEffect(player.x - 34 * SHIP_VISUAL.scale, player.y - 8 * SHIP_VISUAL.scale, 1.15, -0.5);
      addImpactEffect(player.x + 36 * SHIP_VISUAL.scale, player.y + 4 * SHIP_VISUAL.scale, 1.15, 0.5);
      burst(player.x, player.y - 20 * SHIP_VISUAL.scale, 42, "red");
      uiSound("ship-destroyed",player.x);
      vibrate([70, 35, 90, 40, 120]);
    }
  }

  function collectItem(item) {
    if(item.type==="salvage")return collectClassicScrap(item);
    if(item.type==="flightModule") {
      if(!classicEquipment.recoveredTwin) {
        if(!persistClassicEquipment({...classicEquipment,recoveredTwin:true}))return false;
        toast("Emisor gemelo recuperado · C9 disponible en el panel");uiSound("unlock");
        pulseRing(item.x,item.y,"#ffc874",90,.45);
        if(classicChapterStory)signalClassicChapter("module-recovered");
        else showStoryTransmission("MIRA · C9","Pieza asegurada. La montamos antes de entrar en la red Atlas.",4.5);
      }
    } else if (item.type === "energy") {
      const multiplier = powers.double > 0 ? 2 : 1;
      score += 10 * combo * multiplier;
      collected++;
      combo = Math.min(12, combo + 1);
      maxCombo = Math.max(maxCombo, combo);
      comboTimer = 2.35;
      directionalBurst(item.x, item.y, player.x, player.y - 18, 20, "cyan");
      burst(item.x, item.y, 9, "cyan");
      pulseRing(item.x, item.y, "#55f6ff", 76, 0.38, "capture");
      stormPulse = Math.max(stormPulse, 0.08);
      uiSound("pickup-cronium",item.x);
      if (collected >= level().goal) completeLevel();
    } else if (isThreat(item)) {
      // Guardian weapons have authored tier damage (13/15/22). Only patrol
      // Phasers use the normal/heavy10/15 table; never flatten a boss superattack.
      const enemyPhaser=item.classicScoutProjectile&&!item.guardianProjectile;
      if(item.vulkarHazard==="plasmaMine")addPlasmaBlast(item.x,item.y);
      damageShip(item.damage,item.x,item.y,{kind:enemyPhaser?(item.damage>=15?"heavyPhaser":"phaser"):"collision",
        largeAsteroid:item.type==="meteor"&&item.special!=="comet"&&item.spriteKey==="meteorLarge",
        largeAsteroidScale:item.hazardDamageScale||1});
    } else {
      activatePower(item.type, item);
    }
    hud();
  }

  function updateEffects(dt) {
    for (let index = parts.length - 1; index >= 0; index--) {
      const part = parts[index];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vx *= Math.pow(0.04, dt);
      part.vy = part.vy * Math.pow(0.12, dt) + 160 * dt;
      if (part.life <= 0) {
        parts.splice(index, 1);
        particlePool.release(part);
      }
    }
    for (let index = shots.length - 1; index >= 0; index--) {
      const shot = shots[index];
      // Illustrated Atlas pulses arrive before applying damage. Pause freezes
      // both their flight and the boss, rather than damaging an inert target.
      if (shot.atlasPulse) {
        if (state !== "playing") continue;
        shot.life -= dt;
        if (shot.life <= 0) { resolveAtlasPulse(shot); shots.splice(index, 1); }
        continue;
      }
      shot.life -= dt;
      if (shot.life <= 0) {
        if (shot.hit) {
          burst(shot.impactX, shot.impactY, shot.destroyed ? 18 : 8, "green");
          pulseRing(shot.impactX, shot.impactY, "#78ff9c", shot.destroyed ? 70 : 42, 0.28);
          if (shot.destroyed) addExplosion(shot.impactX, shot.impactY, shot.impactScale || 1);
          addImpactEffect(shot.impactX, shot.impactY, shot.destroyed ? 0.8 : 0.55);
        }
        shots.splice(index, 1);
      }
    }
    for (let index = rings.length - 1; index >= 0; index--) {
      rings[index].life -= dt;
      if (rings[index].life <= 0) rings.splice(index, 1);
    }
    for (let index = explosions.length - 1; index >= 0; index--) {
      explosions[index].ch01Animator?.update(dt);
      explosions[index].life -= dt;
      if (explosions[index].life <= 0) explosions.splice(index, 1);
    }
    for (let index = impactEffects.length - 1; index >= 0; index--) {
      // La explosión de Atlas va al mismo reloj que Atlas (mitad con Estabilizador),
      // para que el completado siga llegando justo después de ella.
      impactEffects[index].life -= impactEffects[index].atlasExplosion && powers.slow > 0 ? dt * .5 : dt;
      if (impactEffects[index].life <= 0) impactEffects.splice(index, 1);
    }
  }

  function selectTractorTarget() {
    const candidates = items
      .filter((item) => !isThreat(item) && item.y < player.y && Math.hypot(item.x - player.x, item.y - player.y) < 360)
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
    tractorTarget = candidates[0] || null;
  }

  function animateScoutHit(target, destroyed) {
    if(destroyed&&target.vulkarHazard==="plasmaMine")addPlasmaBlast(target.x,target.y);
    if(destroyed) {
      spawnClassicScrap(target);
      releaseClassicShowerComet(target);
    }
    const animator = target.classicScout?.animator;
    if (!animator) return;
    animator.request(destroyed ? "destroy" : "hurt");
    if (destroyed) {
      if (explosions.length >= EFFECT_LIMITS.explosions) explosions.shift();
      const duration=animator.getFrame().image==="assets/ch02_interceptor_atlas_v1.webp"?.56:.49;
      explosions.push({x: target.x, y: target.y, ch01Animator: animator,
        life: duration, duration, scale: 1, rotation: 0});
    }
  }

  function firePhaser() {
    phaserCooldown = 0.34;
    cameraKickY = Math.max(cameraKickY, 3.5);
    shake = Math.max(shake, 2.2);
    if (fireAtlasPulse("phaser")) return;
    const candidates = items
      .filter(isThreat)
      .filter((item) => item.y < player.y && Math.abs(item.x - player.x) < 95)
      .sort((a, b) => b.y - a.y);
    const target = candidates[0];

    if (target) {
      target.hp = Math.max(0, (target.hp || 1) - 1);
      const destroyed = target.hp <= 0;
      animateScoutHit(target, destroyed);
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({
        x1: player.x, y1: player.y - SHIP_VISUAL.phaserMuzzleOffset, x2: target.x, y2: target.y,
        life: 0.20, duration: 0.20, hit: true, destroyed, impactX: target.x, impactY: target.y,
        impactScale: target.type === "satellite" ? 1.25 : target.r > 39 ? 1.15 : 0.85,
        kind: "phaser"
      });
      score += destroyed ? (target.type === "satellite" ? 12 : 8) : 2;
      if (destroyed) {
        const targetIndex = items.indexOf(target);
        if (targetIndex >= 0) items.splice(targetIndex, 1);
      }
      combatSound(destroyed ? "enemy-break" : "impact-metal", target.x);
    } else {
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({ x1: player.x, y1: player.y - SHIP_VISUAL.phaserMuzzleOffset, x2: player.x, y2: 90, life: 0.18, duration: 0.18, hit: false, kind: "phaser" });
    }
  }

  function fireManualShot() {
    if(state!=="playing" || manualShotCooldown>0 || warpTimer>0)return false;
    if(atlasBoss){const fired=fireAtlasPulse("pulse");updateAmmoHud();return fired;}
    return fireClassicWeapon();
  }

  function checkSupplyFailure() {
    // The staged voyage reissues missed signals locally; the old finite supply
    // failure remains unchanged in the other nine territories and N-7.
    if(classicFlightView?.stageNumber)return;
    if (supplyFailureScheduled || energySpawned < energyBudget || collected >= level().goal) return;
    const energyRemaining = items.some((item) => item.type === "energy");
    if (!energyRemaining) {
      supplyFailureScheduled = true;
      const scheduledRun = runToken;
      supplyFailureTimer = setTimeout(() => {
        supplyFailureTimer = 0;
        supplyFailureScheduled = false;
        if (scheduledRun === runToken && state === "playing" && collected < level().goal && !items.some((item) => item.type === "energy")) {
          finishGame("supply");
        }
      }, 420);
    }
  }
