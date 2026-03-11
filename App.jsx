import { useState, useMemo } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap');`;

const MARKET_PRICES = {
  // Yamaha — prix marché réalistes 2025
  "YZ 125": { base: 2800, perYear: 160 }, "YZ 250": { base: 3800, perYear: 200 },
  "YZ 250F": { base: 4800, perYear: 220 }, "YZ 450F": { base: 5200, perYear: 250 },
  // KTM
  "KTM 125 SX": { base: 3000, perYear: 175 }, "KTM 250 SX": { base: 4400, perYear: 210 },
  "KTM 250 SX-F": { base: 5200, perYear: 230 }, "KTM 450 SX-F": { base: 5600, perYear: 270 },
  // Husqvarna
  "Husqvarna TC 125": { base: 3200, perYear: 175 }, "Husqvarna TC 250": { base: 4600, perYear: 210 },
  "Husqvarna FC 250": { base: 5400, perYear: 230 }, "Husqvarna FC 450": { base: 5800, perYear: 270 },
  // Kawasaki
  "KX 85": { base: 1800, perYear: 130 }, "KX 125": { base: 2600, perYear: 150 },
  "KX 250": { base: 4200, perYear: 200 }, "KX 250F": { base: 4800, perYear: 220 }, "KX 450F": { base: 5400, perYear: 250 },
  // Gas Gas
  "Gas Gas MC 125": { base: 3100, perYear: 170 }, "Gas Gas MC 250F": { base: 5000, perYear: 220 },
  "Gas Gas MC 350F": { base: 5400, perYear: 235 }, "Gas Gas MC 450F": { base: 5700, perYear: 260 },
  // Honda
  "Honda CRF 125F": { base: 2400, perYear: 140 }, "Honda CRF 250R": { base: 4600, perYear: 210 },
  "Honda CRF 250RX": { base: 5000, perYear: 220 }, "Honda CRF 450R": { base: 5500, perYear: 250 }, "Honda CRF 450RX": { base: 5900, perYear: 260 },
  // Suzuki
  "Suzuki RMZ 250": { base: 4200, perYear: 200 }, "Suzuki RMZ 450": { base: 5000, perYear: 230 },
  "Suzuki RM 125": { base: 2200, perYear: 130 }, "Suzuki RM 250": { base: 3200, perYear: 170 },
};

const ANNEES = Array.from({ length: 20 }, (_, i) => 2025 - i);
const MODELES = Object.keys(MARKET_PRICES);
const MARQUES = ["Yamaha", "KTM", "Husqvarna", "Kawasaki", "Gas Gas", "Honda", "Suzuki"];

const DEMO_ANNONCES = [
  { id: 1, titre: "YZ 250 2019 très bon état", modele: "YZ 250", annee: 2019, prix: 2900, ville: "Lyon", lien: "#", note: "Révision faite, kit déco neuf", favori: false },
  { id: 2, titre: "KTM 250 SX 2021 peu roulée", modele: "KTM 250 SX", annee: 2021, prix: 4800, ville: "Paris", lien: "#", note: "", favori: true },
  { id: 3, titre: "Husqvarna TC 125 2020", modele: "Husqvarna TC 125", annee: 2020, prix: 3600, ville: "Marseille", lien: "#", note: "Pot FMF, silencieux neuf", favori: false },
  { id: 4, titre: "YZ 450F 2018 compétition", modele: "YZ 450F", annee: 2018, prix: 3200, ville: "Toulouse", lien: "#", note: "", favori: false },
  { id: 5, titre: "KTM 450 SX-F 2022 état neuf", modele: "KTM 450 SX-F", annee: 2022, prix: 7200, ville: "Bordeaux", lien: "#", note: "Trop cher selon moi", favori: false },
];

const DEMO_FLOTTE = [
  // Achat 2800€ + 240€ frais = 3040€ coût · vendue 3400€ → marge 360€ (réaliste)
  { id: 1, modele: "YZ 250", annee: 2018, prixAchat: 2800, frais: [{ label: "Révision complète", montant: 180 }, { label: "Kit déco neuf", montant: 60 }], prixVente: 3400, statut: "vendue", dateAchat: "12/01/2025", dateVente: "03/02/2025", notes: "Vendue en 3 semaines, marge correcte" },
  // Achat 4200€ + 165€ frais = 4365€ coût · en stock, objectif 4800€ → marge visée 435€
  { id: 2, modele: "KTM 250 SX", annee: 2020, prixAchat: 4200, frais: [{ label: "Plaquettes de frein", montant: 45 }, { label: "Pneus av+ar", montant: 120 }], prixVente: null, statut: "en stock", dateAchat: "20/02/2025", dateVente: null, notes: "Objectif vente : 4800€ → marge ~435€" },
  // Achat 3100€ + 245€ frais = 3345€ coût · vendue 3700€ → marge 355€ (réaliste)
  { id: 3, modele: "Honda CRF 250R", annee: 2019, prixAchat: 3100, frais: [{ label: "Pot FMF", montant: 220 }, { label: "Filtre à air", montant: 25 }], prixVente: 3700, statut: "vendue", dateAchat: "05/03/2025", dateVente: "28/03/2025", notes: "Bonne rotation, marge honnête" },
];

function getPrixMarche(modele, annee) {
  const ref = MARKET_PRICES[modele];
  if (!ref) return null;
  return Math.max(800, ref.base - (2025 - annee) * ref.perYear);
}
function getScore(prix, modele, annee) {
  const marche = getPrixMarche(modele, annee);
  if (!marche) return null;
  return { diff: Math.round(((marche - prix) / marche) * 100), marche };
}
function getTotalFrais(moto) { return moto.frais.reduce((s, f) => s + Number(f.montant), 0); }
function getMarge(moto) {
  if (!moto.prixVente) return null;
  return moto.prixVente - moto.prixAchat - getTotalFrais(moto);
}

const S = {
  badge: (bg, color) => ({ background: bg + "33", color, border: `1px solid ${bg}66`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'Barlow'", whiteSpace: "nowrap", display: "inline-block" }),
  inp: (ex = {}) => ({ background: "#0e0e0e", border: "1px solid #252525", color: "#f0f0f0", borderRadius: 8, padding: "10px 13px", fontSize: 13, fontFamily: "'Barlow'", outline: "none", width: "100%", ...ex }),
  btn: (bg = "#f97316", ex = {}) => ({ background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow'", transition: "all 0.15s", ...ex }),
  card: (accent = "#1a1a1a") => ({ background: "#111", border: `1px solid ${accent}`, borderRadius: 14, padding: 18, transition: "all 0.2s" }),
  label: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, display: "block" },
  section: { background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20, marginBottom: 14 },
};

function ScoreBadge({ diff }) {
  if (diff === null || diff === undefined) return null;
  if (diff >= 20) return <span style={S.badge("#16a34a", "#4ade80")}>🔥 EXCELLENTE · {diff}% sous marché</span>;
  if (diff >= 10) return <span style={S.badge("#ca8a04", "#fde047")}>✅ BONNE · {diff}% sous marché</span>;
  if (diff >= 0)  return <span style={S.badge("#2563eb", "#93c5fd")}>📊 CORRECT · {diff}% sous marché</span>;
  return <span style={S.badge("#dc2626", "#fca5a5")}>⚠️ CHER · +{Math.abs(diff)}% au-dessus marché</span>;
}

function StatCard({ label, value, color = "#f0f0f0", sub }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 18px", flex: "1 1 130px", minWidth: 0 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── MODULE ANNONCES ──────────────────────────────────────────
function AnnonceModule() {
  const [annonces, setAnnonces] = useState(DEMO_ANNONCES);
  const [filtre, setFiltre] = useState("toutes");
  const [filtreMarque, setFiltreMarque] = useState("Toutes");
  const [tri, setTri] = useState("score");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ titre: "", modele: MODELES[0], annee: 2020, prix: "", ville: "", lien: "", note: "" });

  const withScore = useMemo(() => annonces.map(a => ({ ...a, ...getScore(a.prix, a.modele, a.annee) })), [annonces]);

  const filtered = useMemo(() => {
    let list = [...withScore];
    if (filtre === "favoris") list = list.filter(a => a.favori);
    if (filtre === "bonnes")  list = list.filter(a => a.diff >= 10);
    if (filtreMarque !== "Toutes") list = list.filter(a => {
      if (filtreMarque === "Yamaha")    return a.modele.startsWith("YZ");
      if (filtreMarque === "KTM")       return a.modele.startsWith("KTM");
      if (filtreMarque === "Husqvarna") return a.modele.startsWith("Husqvarna");
      if (filtreMarque === "Kawasaki")  return a.modele.startsWith("KX");
      if (filtreMarque === "Gas Gas")   return a.modele.startsWith("Gas Gas");
      if (filtreMarque === "Honda")     return a.modele.startsWith("Honda");
      if (filtreMarque === "Suzuki")    return a.modele.startsWith("Suzuki");
      return true;
    });
    if (tri === "score")     list.sort((a, b) => (b.diff ?? -999) - (a.diff ?? -999));
    if (tri === "prix_asc")  list.sort((a, b) => a.prix - b.prix);
    if (tri === "prix_desc") list.sort((a, b) => b.prix - a.prix);
    if (tri === "recent")    list.sort((a, b) => b.id - a.id);
    return list;
  }, [withScore, filtre, filtreMarque, tri]);

  const toggleFavori = id => setAnnonces(l => l.map(a => a.id === id ? { ...a, favori: !a.favori } : a));
  const supprimer    = id => { setAnnonces(l => l.filter(a => a.id !== id)); setSelected(null); };
  const ajouter = () => {
    if (!form.titre || !form.prix) return;
    setAnnonces(l => [...l, { ...form, id: Date.now(), prix: +form.prix, annee: +form.annee, favori: false }]);
    setForm({ titre: "", modele: MODELES[0], annee: 2020, prix: "", ville: "", lien: "", note: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, padding: "18px 20px 0", flexWrap: "wrap" }}>
        <StatCard label="Annonces"        value={annonces.length} />
        <StatCard label="🔥 Excellentes"  value={withScore.filter(a => a.diff >= 20).length} color="#4ade80" />
        <StatCard label="✅ Bonnes"       value={withScore.filter(a => a.diff >= 10).length} color="#fde047" />
        <StatCard label="⭐ Favoris"      value={withScore.filter(a => a.favori).length}     color="#f97316" />
      </div>

      <div style={{ padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[["toutes","Toutes"],["bonnes","✅ Bonnes"],["favoris","⭐ Favoris"]].map(([v,l]) => (
          <button key={v} onClick={() => setFiltre(v)} style={S.btn(filtre===v?"#f97316":"#161616", { border:`1px solid ${filtre===v?"#f97316":"#252525"}`, color:filtre===v?"#fff":"#777", padding:"8px 14px" })}>{l}</button>
        ))}
        <select value={filtreMarque} onChange={e => setFiltreMarque(e.target.value)} style={S.inp({ width:"auto" })}>
          {["Toutes",...MARQUES].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={tri} onChange={e => setTri(e.target.value)} style={S.inp({ width:"auto" })}>
          <option value="score">Meilleure affaire</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
          <option value="recent">Plus récentes</option>
        </select>
        <button onClick={() => setShowForm(true)} style={S.btn("#f97316", { marginLeft:"auto" })}>+ Ajouter</button>
      </div>

      <div style={{ padding:"0 20px 32px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12 }}>
        {filtered.map(a => (
          <div key={a.id} onClick={() => setSelected(a)}
            style={{ ...S.card(a.diff>=20?"#16a34a44":a.diff>=10?"#ca8a0444":"#1e1e1e"), cursor:"pointer", position:"relative" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#f97316"}
            onMouseLeave={e => e.currentTarget.style.borderColor=a.diff>=20?"#16a34a44":a.diff>=10?"#ca8a0444":"#1e1e1e"}>
            <button onClick={e => { e.stopPropagation(); toggleFavori(a.id); }} style={{ position:"absolute", top:12, right:12, background:"none", border:"none", fontSize:18, cursor:"pointer" }}>
              {a.favori ? "⭐" : "☆"}
            </button>
            <div style={{ fontWeight:700, fontSize:15, paddingRight:28, marginBottom:6 }}>{a.titre}</div>
            <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
              {[`🏍️ ${a.modele}`,`📅 ${a.annee}`,a.ville&&`📍 ${a.ville}`].filter(Boolean).map((t,i) => (
                <span key={i} style={{ fontSize:12, color:"#666" }}>{t}</span>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, color:"#f97316", lineHeight:1 }}>{a.prix.toLocaleString("fr-FR")} €</div>
                {a.marche && <div style={{ fontSize:11, color:"#444", marginTop:2 }}>Marché ~{a.marche.toLocaleString("fr-FR")} €</div>}
              </div>
              <ScoreBadge diff={a.diff} />
            </div>
            {a.note && <div style={{ marginTop:10, fontSize:12, color:"#555", borderTop:"1px solid #1a1a1a", paddingTop:8 }}>📝 {a.note}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#333", padding:"60px 0" }}>Aucune annonce · Clique sur + Ajouter</div>}
      </div>

      {/* Modal détail */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"#000000dd", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setSelected(null)}>
          <div style={{ background:"#111", border:"1px solid #222", borderRadius:18, padding:26, width:"100%", maxWidth:440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:24, marginBottom:4 }}>{selected.titre}</div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:34, color:"#f97316", marginBottom:14 }}>{selected.prix.toLocaleString("fr-FR")} €</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {[`🏍️ ${selected.modele}`,`📅 ${selected.annee}`,selected.ville&&`📍 ${selected.ville}`].filter(Boolean).map((t,i) => (
                <span key={i} style={{ background:"#1a1a1a", color:"#aaa", borderRadius:6, padding:"4px 10px", fontSize:12 }}>{t}</span>
              ))}
            </div>
            {selected.marche && (
              <div style={{ background:"#0a0a0a", borderRadius:10, padding:14, marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:"#666", fontSize:13 }}>Prix annonce</span>
                  <span style={{ fontWeight:700 }}>{selected.prix.toLocaleString("fr-FR")} €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ color:"#666", fontSize:13 }}>Prix marché estimé</span>
                  <span style={{ fontWeight:700 }}>{selected.marche.toLocaleString("fr-FR")} €</span>
                </div>
                <ScoreBadge diff={selected.diff} />
              </div>
            )}
            {selected.note && <div style={{ color:"#777", fontSize:13, marginBottom:16 }}>📝 {selected.note}</div>}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {selected.lien && selected.lien !== "#" && (
                <a href={selected.lien} target="_blank" rel="noreferrer" style={{ ...S.btn("#f97316"), flex:1, textAlign:"center", textDecoration:"none" }}>🔗 Voir l'annonce</a>
              )}
              <button onClick={() => toggleFavori(selected.id)} style={S.btn(selected.favori?"#ca8a04":"#1a1a1a", { flex:1, border:"1px solid #333" })}>
                {selected.favori ? "⭐ Retirer" : "☆ Favori"}
              </button>
              <button onClick={() => supprimer(selected.id)} style={S.btn("#dc2626", { padding:"10px 14px" })}>🗑</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#000000dd", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setShowForm(false)}>
          <div style={{ background:"#111", border:"1px solid #222", borderRadius:18, padding:24, width:"100%", maxWidth:440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, marginBottom:18 }}>➕ NOUVELLE ANNONCE</div>
            <div style={{ marginBottom:12 }}>
              <span style={S.label}>Titre *</span>
              <input placeholder="ex: YZ 250 2020 très bon état" value={form.titre} onChange={e => setForm({...form, titre:e.target.value})} style={S.inp()} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:12 }}>
              <div><span style={S.label}>Modèle</span><select value={form.modele} onChange={e => setForm({...form, modele:e.target.value})} style={S.inp()}>{MODELES.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><span style={S.label}>Année</span><select value={form.annee} onChange={e => setForm({...form, annee:e.target.value})} style={S.inp()}>{ANNEES.map(a=><option key={a}>{a}</option>)}</select></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div><span style={S.label}>Prix (€) *</span><input type="number" placeholder="ex: 3500" value={form.prix} onChange={e => setForm({...form, prix:e.target.value})} style={S.inp()} /></div>
              <div><span style={S.label}>Ville</span><input placeholder="ex: Lyon" value={form.ville} onChange={e => setForm({...form, ville:e.target.value})} style={S.inp()} /></div>
            </div>
            <div style={{ marginBottom:12 }}><span style={S.label}>Lien LeBonCoin</span><input placeholder="https://..." value={form.lien} onChange={e => setForm({...form, lien:e.target.value})} style={S.inp()} /></div>
            <div style={{ marginBottom:16 }}><span style={S.label}>Notes perso</span><input placeholder="ex: révision faite, pot neuf..." value={form.note} onChange={e => setForm({...form, note:e.target.value})} style={S.inp()} /></div>
            {form.prix && (
              <div style={{ background:"#0a0a0a", borderRadius:10, padding:12, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#555" }}>Analyse immédiate :</span>
                <ScoreBadge diff={getScore(+form.prix, form.modele, +form.annee)?.diff} />
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={ajouter} style={S.btn("#f97316", { flex:2, padding:13 })}>✅ ANALYSER & AJOUTER</button>
              <button onClick={() => setShowForm(false)} style={S.btn("#161616", { flex:1, border:"1px solid #333" })}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MODULE RENTABILITÉ ───────────────────────────────────────
function RentabiliteModule() {
  const [flotte, setFlotte] = useState(DEMO_FLOTTE);
  const [vue, setVue] = useState("liste");
  const [motoId, setMotoId] = useState(null);
  const [prixVenteInput, setPrixVenteInput] = useState("");
  const [showFraisForm, setShowFraisForm] = useState(false);
  const [nouveauFrais, setNouveauFrais] = useState({ label:"", montant:"" });
  const [form, setForm] = useState({ modele:MODELES[0], annee:2020, prixAchat:"", dateAchat:"", notes:"" });

  const vendues  = flotte.filter(m => m.statut === "vendue");
  const enStock  = flotte.filter(m => m.statut === "en stock");
  const margeTotal = vendues.reduce((s,m) => s + (getMarge(m)||0), 0);
  const capitalInvesti = enStock.reduce((s,m) => s + m.prixAchat + getTotalFrais(m), 0);
  const margeAvg = vendues.length > 0 ? Math.round(margeTotal / vendues.length) : 0;

  const moto = flotte.find(m => m.id === motoId);

  const ouvrirDetail = (m) => { setMotoId(m.id); setPrixVenteInput(m.prixVente||""); setShowFraisForm(false); setVue("detail"); };

  const ajouterMoto = () => {
    if (!form.prixAchat) return;
    setFlotte(f => [...f, { ...form, id:Date.now(), prixAchat:+form.prixAchat, annee:+form.annee, frais:[], prixVente:null, statut:"en stock", dateVente:null }]);
    setForm({ modele:MODELES[0], annee:2020, prixAchat:"", dateAchat:"", notes:"" });
    setVue("liste");
  };

  const marquerVendue = () => {
    if (!prixVenteInput) return;
    setFlotte(f => f.map(m => m.id===motoId ? { ...m, prixVente:+prixVenteInput, statut:"vendue", dateVente:new Date().toLocaleDateString("fr-FR") } : m));
    setVue("liste");
  };

  const ajouterFrais = () => {
    if (!nouveauFrais.label || !nouveauFrais.montant) return;
    setFlotte(f => f.map(m => m.id===motoId ? { ...m, frais:[...m.frais, { label:nouveauFrais.label, montant:+nouveauFrais.montant }] } : m));
    setNouveauFrais({ label:"", montant:"" });
    setShowFraisForm(false);
  };

  const supprimerFrais = (idx) => setFlotte(f => f.map(m => m.id===motoId ? { ...m, frais:m.frais.filter((_,i)=>i!==idx) } : m));
  const supprimerMoto  = () => { setFlotte(f => f.filter(m => m.id!==motoId)); setVue("liste"); };

  // Vue détail
  if (vue === "detail" && moto) {
    const totalFrais = getTotalFrais(moto);
    const coutTotal  = moto.prixAchat + totalFrais;
    const marge      = getMarge(moto);
    const margeSimulee = prixVenteInput ? +prixVenteInput - coutTotal : null;
    const prixMarche = getPrixMarche(moto.modele, moto.annee);

    return (
      <div style={{ padding:"0 20px 40px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <button onClick={() => setVue("liste")} style={S.btn("#161616", { border:"1px solid #333" })}>← Retour</button>
          <div style={{ background:moto.statut==="vendue"?"#16a34a22":"#f9731622", color:moto.statut==="vendue"?"#4ade80":"#f97316", borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:700 }}>
            {moto.statut==="vendue" ? "✅ VENDUE" : "🏍️ EN STOCK"}
          </div>
        </div>

        <div style={{ fontFamily:"'Bebas Neue'", fontSize:28, lineHeight:1 }}>{moto.modele} {moto.annee}</div>
        <div style={{ fontSize:12, color:"#555", marginBottom:20 }}>
          Achetée le {moto.dateAchat||"—"}{moto.dateVente?` · Vendue le ${moto.dateVente}`:""}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {/* Résumé financier */}
          <div style={S.section}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:15, color:"#666", marginBottom:14 }}>💰 RÉSUMÉ</div>
            {[
              { l:"Prix d'achat",  v:`${moto.prixAchat.toLocaleString("fr-FR")} €`, c:"#f0f0f0" },
              { l:"Total frais",   v:`+${totalFrais.toLocaleString("fr-FR")} €`,    c:"#f97316" },
              { l:"Coût total",    v:`${coutTotal.toLocaleString("fr-FR")} €`,       c:"#fbbf24", b:true },
              moto.prixVente ? { l:"Prix de vente", v:`${moto.prixVente.toLocaleString("fr-FR")} €`, c:"#4ade80" } : null,
              prixMarche ? { l:"Prix marché", v:`~${prixMarche.toLocaleString("fr-FR")} €`, c:"#93c5fd" } : null,
            ].filter(Boolean).map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                <span style={{ fontSize:12, color:"#666" }}>{r.l}</span>
                <span style={{ fontWeight:r.b?700:600, color:r.c, fontSize:13 }}>{r.v}</span>
              </div>
            ))}
            {marge !== null && (
              <div style={{ display:"flex", justifyContent:"space-between", background:marge>=0?"#16a34a22":"#dc262622", borderRadius:8, padding:"10px 12px", marginTop:10 }}>
                <span style={{ fontWeight:700, fontSize:13 }}>🎯 MARGE NETTE</span>
                <span style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:marge>=0?"#4ade80":"#f87171" }}>
                  {marge>=0?"+":""}{marge.toLocaleString("fr-FR")} €
                </span>
              </div>
            )}
          </div>

          {/* Frais */}
          <div style={S.section}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:15, color:"#666" }}>🔧 FRAIS</div>
              <button onClick={() => setShowFraisForm(!showFraisForm)} style={S.btn("#f97316", { padding:"5px 10px", fontSize:12 })}>+ Ajouter</button>
            </div>
            {showFraisForm && (
              <div style={{ background:"#0a0a0a", borderRadius:8, padding:10, marginBottom:10, display:"flex", flexDirection:"column", gap:8 }}>
                <input placeholder="Ex: Révision moteur" value={nouveauFrais.label} onChange={e => setNouveauFrais({...nouveauFrais, label:e.target.value})} style={S.inp()} />
                <div style={{ display:"flex", gap:8 }}>
                  <input type="number" placeholder="Montant €" value={nouveauFrais.montant} onChange={e => setNouveauFrais({...nouveauFrais, montant:e.target.value})} style={S.inp()} />
                  <button onClick={ajouterFrais} style={S.btn("#16a34a", { padding:"10px 14px" })}>✓</button>
                </div>
              </div>
            )}
            {moto.frais.length === 0 && <div style={{ color:"#333", fontSize:12, textAlign:"center", padding:"16px 0" }}>Aucun frais</div>}
            {moto.frais.map((f,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                <span style={{ fontSize:12, color:"#ccc" }}>🔩 {f.label}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ color:"#f97316", fontWeight:700, fontSize:13 }}>{f.montant} €</span>
                  <button onClick={() => supprimerFrais(i)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:14 }}>✕</button>
                </div>
              </div>
            ))}
            {moto.frais.length > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                <span style={{ fontSize:12, color:"#777" }}>Total</span>
                <span style={{ color:"#f97316", fontWeight:700 }}>{totalFrais} €</span>
              </div>
            )}
          </div>
        </div>

        {/* Simulateur vente */}
        {moto.statut === "en stock" && (
          <div style={S.section}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:15, color:"#666", marginBottom:14 }}>💸 SIMULER LA VENTE</div>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <input type="number" placeholder="Prix de vente visé (€)" value={prixVenteInput}
                onChange={e => setPrixVenteInput(e.target.value)} style={S.inp({ flex:1, minWidth:160 })} />
              {prixVenteInput && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:1 }}>Marge estimée</div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, color:margeSimulee>=0?"#4ade80":"#f87171" }}>
                    {margeSimulee>=0?"+":""}{margeSimulee?.toLocaleString("fr-FR")} €
                  </div>
                </div>
              )}
              <button onClick={marquerVendue} style={S.btn("#16a34a", { whiteSpace:"nowrap" })}>✅ Marquer vendue</button>
            </div>
            <div style={{ fontSize:11, color:"#444", marginTop:10 }}>
              Coût total : <strong style={{ color:"#fbbf24" }}>{coutTotal.toLocaleString("fr-FR")} €</strong>
              {prixMarche && <> · Prix marché : <strong style={{ color:"#93c5fd" }}>~{prixMarche.toLocaleString("fr-FR")} €</strong></>}
            </div>
          </div>
        )}

        {moto.notes && <div style={{ ...S.section, fontSize:13, color:"#777" }}>📝 {moto.notes}</div>}
        <button onClick={supprimerMoto} style={S.btn("#dc262622", { border:"1px solid #dc262655", color:"#f87171", width:"100%", marginTop:8 })}>
          🗑 Supprimer cette moto
        </button>
      </div>
    );
  }

  // Vue ajout
  if (vue === "ajouter") return (
    <div style={{ padding:"0 20px 40px" }}>
      <button onClick={() => setVue("liste")} style={S.btn("#161616", { border:"1px solid #333", marginBottom:20 })}>← Retour</button>
      <div style={{ ...S.section, maxWidth:480 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, marginBottom:18 }}>🏍️ AJOUTER UNE MOTO ACHETÉE</div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:12 }}>
          <div><span style={S.label}>Modèle</span><select value={form.modele} onChange={e => setForm({...form, modele:e.target.value})} style={S.inp()}>{MODELES.map(m=><option key={m}>{m}</option>)}</select></div>
          <div><span style={S.label}>Année</span><select value={form.annee} onChange={e => setForm({...form, annee:e.target.value})} style={S.inp()}>{ANNEES.map(a=><option key={a}>{a}</option>)}</select></div>
        </div>
        {[
          { l:"Prix d'achat (€) *", k:"prixAchat", t:"number", p:"ex: 2800" },
          { l:"Date d'achat",       k:"dateAchat", t:"text",   p:"ex: 15/03/2025" },
          { l:"Notes",              k:"notes",     t:"text",   p:"ex: pneus à changer..." },
        ].map(f => (
          <div key={f.k} style={{ marginBottom:12 }}>
            <span style={S.label}>{f.l}</span>
            <input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e => setForm({...form, [f.k]:e.target.value})} style={S.inp()} />
          </div>
        ))}
        {form.annee && form.modele && (
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:12, marginBottom:16, fontSize:13, color:"#555" }}>
            Prix marché estimé : <strong style={{ color:"#93c5fd" }}>{getPrixMarche(form.modele, +form.annee)?.toLocaleString("fr-FR")} €</strong>
            {form.prixAchat && (
              <> · Marge potentielle : <strong style={{ color:"#4ade80" }}>
                +{Math.max(0, getPrixMarche(form.modele, +form.annee) - +form.prixAchat - 300).toLocaleString("fr-FR")} € env.
              </strong></>
            )}
          </div>
        )}
        <button onClick={ajouterMoto} style={S.btn("#f97316", { width:"100%", padding:13 })}>✅ AJOUTER À MA FLOTTE</button>
      </div>
    </div>
  );

  // Vue liste
  return (
    <div>
      <div style={{ display:"flex", gap:10, padding:"18px 20px 0", flexWrap:"wrap" }}>
        <StatCard label="💰 Gains totaux"   value={`${margeTotal>=0?"+":""}${margeTotal.toLocaleString("fr-FR")} €`} color={margeTotal>=0?"#4ade80":"#f87171"} />
        <StatCard label="✅ Vendues"         value={vendues.length} />
        <StatCard label="📦 En stock"        value={enStock.length} color="#f97316" sub={capitalInvesti>0?`${capitalInvesti.toLocaleString("fr-FR")} € investis`:""} />
        <StatCard label="📈 Marge moyenne"   value={`${margeAvg>=0?"+":""}${margeAvg.toLocaleString("fr-FR")} €`} color="#fde047" />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px 14px" }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:"#555" }}>MA FLOTTE · {flotte.length} MOTOS</div>
        <button onClick={() => setVue("ajouter")} style={S.btn("#f97316")}>+ Ajouter une moto</button>
      </div>

      <div style={{ padding:"0 20px 32px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {flotte.map(m => {
          const tf = getTotalFrais(m);
          const mg = getMarge(m);
          return (
            <div key={m.id} onClick={() => ouvrirDetail(m)}
              style={{ ...S.card(m.statut==="vendue"?"#16a34a33":"#f9731622"), cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#f97316"}
              onMouseLeave={e => e.currentTarget.style.borderColor=m.statut==="vendue"?"#16a34a33":"#f9731622"}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:20, lineHeight:1 }}>{m.modele}</div>
                  <div style={{ fontSize:11, color:"#555" }}>{m.annee} · {m.dateAchat||"—"}</div>
                </div>
                <div style={{ background:m.statut==="vendue"?"#16a34a22":"#f9731622", color:m.statut==="vendue"?"#4ade80":"#f97316", borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700, height:"fit-content" }}>
                  {m.statut==="vendue"?"✅ VENDUE":"🏍️ STOCK"}
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ color:"#555" }}>Achat</span><span style={{ fontWeight:600 }}>{m.prixAchat.toLocaleString("fr-FR")} €</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ color:"#555" }}>Frais ({m.frais.length})</span><span style={{ color:"#f97316" }}>{tf>0?`+${tf} €`:"—"}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#444", marginBottom:10 }}>
                <span>Coût total</span><span style={{ color:"#fbbf24" }}>{(m.prixAchat+tf).toLocaleString("fr-FR")} €</span>
              </div>
              {mg !== null ? (
                <div style={{ display:"flex", justifyContent:"space-between", background:mg>=0?"#16a34a22":"#dc262622", borderRadius:8, padding:"9px 12px" }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>Marge nette</span>
                  <span style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:mg>=0?"#4ade80":"#f87171" }}>{mg>=0?"+":""}{mg.toLocaleString("fr-FR")} €</span>
                </div>
              ) : (
                <div style={{ textAlign:"center", fontSize:11, color:"#333", borderTop:"1px solid #1a1a1a", paddingTop:8 }}>Touche pour gérer · simuler la vente</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────
export default function App() {
  const [onglet, setOnglet] = useState("annonces");
  return (
    <>
      <style>{`${FONT} *{box-sizing:border-box;margin:0;padding:0} body{font-family:'Barlow',sans-serif;background:#0a0a0a} select option{background:#111} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#0a0a0a} ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}`}</style>
      <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#f0f0f0" }}>

        {/* Header */}
        <div style={{ background:"#0d0d0d", borderBottom:"1px solid #181818", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, position:"sticky", top:0, zIndex:100 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:2, lineHeight:1 }}>
              MOTO<span style={{ color:"#f97316" }}>TRACKER</span>
            </div>
            <div style={{ fontSize:10, color:"#444", letterSpacing:"1.5px" }}>ANNONCES · RENTABILITÉ · ACHAT-REVENTE CROSS</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[["annonces","🔍 Annonces"],["rentabilite","💰 Rentabilité"]].map(([v,l]) => (
              <button key={v} onClick={() => setOnglet(v)}
                style={S.btn(onglet===v?"#f97316":"#161616", {
                  border:`1px solid ${onglet===v?"#f97316":"#252525"}`,
                  color:onglet===v?"#fff":"#666", fontSize:13, padding:"9px 18px",
                  boxShadow:onglet===v?"0 0 18px #f9731633":"none",
                })}>{l}</button>
            ))}
          </div>
        </div>

        {onglet === "annonces"    && <AnnonceModule />}
        {onglet === "rentabilite" && <RentabiliteModule />}
      </div>
    </>
  );
}
