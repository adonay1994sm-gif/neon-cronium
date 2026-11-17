"""Sintetiza los tres «boom» de NEON CRONIUM (enemigo derribado, jefe destruido y golpe al
casco; propietario, 17/11/2026) con numpy: sin muestras de terceros. Las salidas se copian a
art-source/audio/combat-sfx-v3/neon_boom_*.wav y las monta scripts/build-combat-sfx-v3.py.
Semilla fija: mismas salidas. Uso: python3 scripts/make-neon-boom-sfx.py (escribe en el directorio actual).
"""
import numpy as np, subprocess, wave, os
SR=48000; rng=np.random.default_rng(7)
def t(d): return np.arange(int(SR*d))/SR
def env(x,a,r,k=4): # ataque lineal, caída exponencial
    n=len(x); e=np.exp(-k*np.linspace(0,1,n)*(1/r)) ; ai=int(a*SR); 
    if ai>0: e[:ai]*=np.linspace(0,1,ai)
    return e
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    for i,v in enumerate(x): s=(1-a)*v+a*s; y[i]=s
    return y
def hp(x,fc): return x-lp(x,fc)
def sweep(d,f0,f1,k=6):
    tt=t(d); f=f1+(f0-f1)*np.exp(-k*tt/d); return np.sin(2*np.pi*np.cumsum(f)/SR)
def noise(d): return rng.standard_normal(int(SR*d))
def norm(x,peak=.71):
    x=x/ (np.max(np.abs(x))+1e-9)*peak; n=int(.004*SR); x[-n:]*=np.linspace(1,0,n); return x
def mix(*parts):
    n=max(len(p) for p in parts); o=np.zeros(n)
    for p in parts: o[:len(p)]+=p
    return o
def at(x,off,n): o=np.zeros(max(n,len(x)+int(off*SR))); o[int(off*SR):int(off*SR)+len(x)]=x; return o
def saturate(x,g=2.2): return np.tanh(x*g)/np.tanh(g)

# ---------- ENEMIGO DERRIBADO ----------
def enemy_a(): # boom seco y corto
    d=.7; body=sweep(d,150,38)*env(t(d),.002,.5,5)
    crack=hp(noise(d),1800)*env(t(d),.0005,.09,6)*.7
    return saturate(mix(body*1.0,crack),1.6)
def enemy_b(): # boom con escombros
    d=1.2; body=sweep(d,140,34)*env(t(d),.002,.6,4.5)
    burst=lp(noise(d),2600)*env(t(d),.001,.22,5)*.8
    debris=sum(at(hp(noise(.05),3000)*np.hanning(int(.05*SR))*rng.uniform(.25,.6),rng.uniform(.08,.7),int(d*SR)) for _ in range(14))
    return saturate(mix(body,burst,debris*.7),1.8)
def enemy_c(): # cinematográfico: golpe + caída de graves + anillo metálico
    d=1.6; body=sweep(d,120,28,5)*env(t(d),.003,.75,4)
    sub=np.sin(2*np.pi*42*t(d))*env(t(d),.02,.9,3.2)*.6
    burst=lp(noise(d),1800)*env(t(d),.001,.28,4.5)*.9
    ring=(np.sin(2*np.pi*740*t(d))+.6*np.sin(2*np.pi*1180*t(d)))*env(t(d),.001,.5,7)*.12
    return saturate(mix(body,sub,burst,ring),2.0)

# ---------- JEFE DESTRUIDO ----------
def boss_a(): # tres explosiones seguidas y un final enorme
    d=3.2; o=np.zeros(int(d*SR))
    for off,sc in [(0,.55),(.35,.7),(.75,.85)]:
        e=enemy_b()[:int(1.0*SR)]*sc; o[int(off*SR):int(off*SR)+len(e)]+=e
    fin=at(enemy_c()*1.0,1.3,int(d*SR)); return saturate(mix(o,fin),1.6)
def boss_b(): # una gran explosión con retumbo largo y chispas
    d=3.6; body=sweep(d,110,24,4)*env(t(d),.004,.8,3)
    sub=np.sin(2*np.pi*36*t(d))*env(t(d),.05,1.0,2.6)*.8
    burst=lp(noise(d),1400)*env(t(d),.002,.5,4)*.9
    crackle=sum(at(hp(noise(.04),2500)*np.hanning(int(.04*SR))*rng.uniform(.2,.5),rng.uniform(.2,2.4),int(d*SR)) for _ in range(40))
    return saturate(mix(body,sub,burst,crackle*.6),2.2)

# ---------- GOLPE AL CASCO ----------
def hit_a():
    d=.45; return saturate(mix(sweep(d,180,60,8)*env(t(d),.001,.3,6),lp(noise(d),900)*env(t(d),.0005,.12,7)*.9),1.8)
def hit_b():
    d=.7; return saturate(mix(sweep(d,170,45,6)*env(t(d),.001,.4,5),lp(noise(d),1400)*env(t(d),.0005,.2,6)*.9,
        np.sin(2*np.pi*90*t(d))*env(t(d),.01,.5,5)*.5),2.0)

out={'enemigo-a':enemy_a(),'enemigo-b':enemy_b(),'enemigo-c':enemy_c(),'jefe-a':boss_a(),'jefe-b':boss_b(),'golpe-a':hit_a(),'golpe-b':hit_b()}
def wav(path,x):
    with wave.open(path,'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
os.makedirs('sonido-pagina/wav',exist_ok=True)
for k,x in out.items(): wav(f'sonido-pagina/wav/{k}.wav',norm(x))
# «hoy»: recortes del juego
for name,off,dur in [('enemigo-hoy',2.95,1.0),('golpe-hoy',2.23,.6),('jefe-hoy',None,None)]:
    if off is None: continue
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(off),'-t',str(dur),'-i','/home/user/Ne-n-catcher/assets/combat_sfx_atlas_v3.m4a','-ac','1','-ar',str(SR),f'sonido-pagina/wav/{name}.wav'],check=True)
for f in os.listdir('sonido-pagina/wav'):
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'sonido-pagina/wav/{f}','-b:a','96k',f'sonido-pagina/{f[:-4]}.mp3'],check=True)
print(sorted(os.listdir('sonido-pagina')))
