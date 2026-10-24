const CACHE = "neon-cronium-pre-release-7-2-0-orbital-hud-2";
const CORE = [
  "assets/menu_hangar_bg_v1.webp",
  "assets/menu_frame_v1.webp",
  "assets/menu_frame_pressed_v1.webp",
  "assets/menu_hangar_button_v1.webp",
  "assets/menu_arrow_v1.webp",
  "assets/menu_gear_v1.webp",
  "assets/ui_window_v1.webp",
  "assets/ui_button_main_v1.webp",
  "assets/ui_button_main_pressed_v1.webp",
  "assets/ui_button_secondary_v1.webp",
  "assets/ui_button_secondary_pressed_v1.webp",
  "assets/ui_button_danger_v1.webp",
  "assets/ui_button_ad_v1.webp",
  "assets/ui_stat_card_v1.webp",
  "assets/ui_howto_icons_v1.webp",
  "assets/ui_star_full_v1.webp",
  "assets/ui_star_empty_v1.webp",
  "assets/ui_sector_frame_v1.webp",
  "assets/ui_beacon_big_v1.webp",
  "assets/ui_defeat_cracks_v1.webp",
  "assets/ui_slider_track_v1.webp",
  "assets/ui_slider_fill_v1.webp",
  "assets/ui_slider_thumb_v1.webp",
  "assets/ui_toggle_off_v1.webp",
  "assets/ui_toggle_on_v1.webp",
  "assets/ui_select_v1.webp",
  "assets/ui_separator_v1.webp",
  "assets/orbitron_wght_v1.ttf",
  "assets/exo2_latin_wght_v1.woff2",
  "assets/combat_sfx_atlas_v2.m4a",
  "assets/combat_sfx_atlas_v2.json",
  "assets/cronium_energy_atlas_v2.webp",
  "assets/chapter1_opening_score_v1.m4a",
  "assets/chapter1_voyage_score_v1.m4a",
  "assets/chapter1_portraits_v1.webp",
  "assets/chapter1_missile_atlas_v1.webp",
  "assets/c9_upgrade_icons_v1.webp",
  "assets/forja_modules_atlas_v1.webp",
  "assets/player_ship_identity_v1.webp",
  "assets/comet_flight_atlas_v3.webp",
  "assets/sector_map_icons_v1.webp",
  "assets/character_portraits_v1.webp",
  "assets/mission_sector1_v1.webp",
  "assets/mission_sector2_v1.webp",
  "assets/hull_impact_sparks_v1.webp",
  "assets/cronos_prime_trail_v1.webp",
  "assets/atlas_explosion_v1.webp",
  "assets/lava_core_mine_atlas_v1.webp",
  "assets/gaia_tracker_atlas_v1.webp",
  "assets/gaia_sower_atlas_v1.webp",
  "assets/gaia_aegis_atlas_v1.webp",
  "assets/gaia_alpha_atlas_v1.webp",
  "assets/hostile_projectiles_v2.webp",
  "assets/ch03_satellite_atlas_v1.webp",
  "assets/atlas_fury_atlas_v1.webp",
  "assets/atlas_escorts_atlas_v1.webp",
  "assets/sector_beacon_atlas_v1.webp",
  "assets/workshop_mira_bg_v1.webp",
  "assets/skill_tree_icons_v1.webp",
  "assets/cronos_prime_beam_v1.webp",
  "./",
  "index.html",
  "styles.css?v=7.2.0",
  "native-admob.js?v=7.2.0",
  "ads-config.js?v=7.2.0",
  "ad-bridge.js?v=7.2.0",
  "analytics-manager.js?v=7.2.0",
  "core-runtime.js?v=7.2.0",
  "content-runtime.js?v=7.2.0",
  "game.js?v=7.2.0",
  "manifest.webmanifest",
  "privacy.html",
  "terms.html",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/ship_modular_atlas_v1.webp",
  "assets/chronos_flight_atlas_v1.webp",
  "assets/chronos_destruction_atlas_v1.webp",
  "assets/chronos_flight_weapons_v1.webp",
  "assets/chronos_flight_space_v1.webp",
  "assets/vulkar_orbit_planet_v1.webp",
  "assets/planet_volcanico_atlas_v1.webp",
  "assets/planet_glacial_atlas_v1.webp",
  "assets/planet_violeta_atlas_v1.webp",
  "assets/planet_tormentoso_atlas_v1.webp",
  "assets/force_shield_atlas_v1.webp",
  "assets/core_frame_00.webp",
  "assets/core_frame_01.webp",
  "assets/core_frame_02.webp",
  "assets/core_frame_03.webp",
  "assets/core_frame_04.webp",
  "assets/core_frame_05.webp",
  "assets/cronium_fragment_v1.webp",
  "assets/phaser_frame_00.webp",
  "assets/phaser_frame_01.webp",
  "assets/phaser_frame_02.webp",
  "assets/phaser_frame_03.webp",
  "assets/phaser_frame_04.webp",
  "assets/phaser_frame_05.webp",
  "assets/tractor_frame_00.webp",
  "assets/tractor_frame_01.webp",
  "assets/tractor_frame_02.webp",
  "assets/tractor_frame_03.webp",
  "assets/tractor_frame_04.webp",
  "assets/tractor_frame_05.webp",
  "assets/impact_frame_00.webp",
  "assets/impact_frame_01.webp",
  "assets/impact_frame_02.webp",
  "assets/impact_frame_03.webp",
  "assets/smoke_frame_00.webp",
  "assets/smoke_frame_01.webp",
  "assets/smoke_frame_02.webp",
  "assets/explosion_frame_00.webp",
  "assets/explosion_frame_01.webp",
  "assets/explosion_frame_02.webp",
  "assets/explosion_frame_03.webp",
  "assets/explosion_frame_04.webp",
  "assets/explosion_frame_05.webp",
  "assets/explosion_frame_06.webp",
  "assets/explosion_frame_07.webp",
  "assets/meteor_small.webp",
  "assets/meteor_small_alt.webp",
  "assets/meteor_medium.webp",
  "assets/meteor_medium_alt.webp",
  "assets/meteor_large.webp",
  "assets/ch01_atlas_v1.webp",
  "assets/ch02_interceptor_atlas_v1.webp",
  "assets/guardian_atlas_states_v2.webp",
  "assets/atlas_combat_vfx_v1.webp",
  "assets/arcade_pulse_atlas_v2.webp",
  "assets/hostile_ordnance_atlas_v1.webp",
  "assets/gaia_pulse_atlas_v3.webp",
  "assets/debris_metal.webp",
  "assets/debris_panel.webp",
  "assets/debris_hot_00.webp",
  "assets/debris_hot_01.webp",
  "assets/satellite_old.webp",
  "assets/repair_drone.webp",
  "assets/shield_effect.webp",
  "assets/shield_idle.webp",
  "assets/explosion_small.webp",
  "assets/chronos_shockwave_atlas_v1.webp",
  "assets/chronos_detached_module_v1.webp"
];

// addAll es "todo o nada": si un solo archivo falla, la instalación entera
// falla y el juego se queda sin modo sin conexión. En ese caso se guarda
// archivo a archivo y solo se omiten los que fallen; se descargarán al usarse.
async function precache() {
  const cache = await caches.open(CACHE);
  try {
    await cache.addAll(CORE);
  } catch {
    await Promise.all(CORE.map(async (path) => {
      try {
        const response = await fetch(path);
        if (response?.ok) await cache.put(path, response);
      } catch {
        // Archivo omitido; networkFirst/cacheFirst lo recuperarán más tarde.
      }
    }));
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  // Retain this generation's handle before waiting for the network. If a newer
  // worker deletes its name, this response must not reopen that retired cache.
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response?.status === 200) {
      const copy = response.clone();
      await cache.put(request, copy);
    }
    return response;
  } catch {
    return (await cache.match(request)) || (request.mode === "navigate" ? cache.match("index.html") : undefined);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response?.status === 200) {
    const copy = response.clone();
    await cache.put(request, copy);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isCode = event.request.mode === "navigate" || /\.(?:html|js|css)$/.test(url.pathname);
  event.respondWith(isCode ? networkFirst(event.request) : cacheFirst(event.request));
});
