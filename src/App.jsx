import { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import {
  Wallet, CreditCard, Smartphone, TrendingUp, CheckCircle2, RefreshCcw,
  Receipt, Plus, Trash2, Landmark, ShoppingCart, Zap
} from "lucide-react";

// Importação do ficheiro que criámos na Missão 4.2
import { supabase } from "./supabase"; 

const PALETTE = {
  bg: "#10151A",
  panel: "#1A2229",
  panelRaised: "#212B33",
  border: "#2B363E",
  text: "#E9E6DC",
  textMuted: "#8D969C",
  gold: "#C9A227",
  brick: "#C1502E",
  sage: "#5B9279",
  sky: "#6E93A6",
};
 
const DEFAULT_DATA = {
  lastUpdated: "2026-09-14",
  cashPosition: 0,
  debts: [
    { id: "lend", name: "Lend Direct", originalValue: 2505.25, paidValue: 0, apr: 34.99, dueLabel: "25/set/26 (pool Pixel)", notes: "Sem carência. Atraso de 8 dias já incorporado (~$19,21)." },
    { id: "walmart", name: "Walmart Mastercard", originalValue: 3741.40, paidValue: 150.00, apr: 21.99, dueLabel: "25/set + 15/out (pool Pixel + Nireeka)", notes: "Taxa reduzida até out/26, reverte a 26,99% em nov. $150 pago pontualmente em ago/26." },
    { id: "fairstone", name: "Fairstone", originalValue: 1060.20, paidValue: 200.00, apr: 0, dueLabel: "Diluída 3x, Out-Dez/26", notes: "0% se quitada até 18/dez/26. Depois: 31,99% + $286,16. $200 pago pontualmente em ago/26." },
    { id: "celso", name: "Empréstimo Brasil", originalValue: 5244.32, paidValue: 0, apr: 0, dueLabel: "$400/mês a partir Out/26", notes: "Empréstimo familiar. R$19.391,35 no câmbio de 13/set/26." },
  ],
  longTermLoans: [
    {
      id: "carro_gmc",
      name: "GMC Terrain 2021 (Scotiabank)",
      originalValue: 36273.91,
      paidValue: 9549.87,
      apr: 7.49,
      dueLabel: "Quinzenal $289,39 · 33/156 pagas · quita 18/jun/2031",
      notes: "Underwater (~-$11k a -$15k de equity). Decisão: manter como está, sem adiantar/vender/refinanciar por ora. Inclui GAP Insurance ($2.595) e garantia estendida ($2.995) no financiado.",
    },
  ],
  monthlyFlow: [
    { month: "Set/26", income: 9163.58, opexVida: 6655.39, telecom: 681.77, dividas: 6994.53, saldo: -307.85 }
  ],
  income: {
    gsciCarlos: 2220.00,
    gsciVanessa: 1730.00,
    childBenefit: 263.58,
    pixelProjects: [
      { id: "tbricker", name: "Mr. TBricker (4ª/última parcela)", value: 465.00, expectedDate: "2026-09-18", status: "confirmado" },
      { id: "invoice-grande", name: "Invoice grande (novo cliente)", value: 5000.00, expectedDate: "2026-09-25", status: "limite" },
      { id: "nireeka", name: "Nireeka — Manual Spectre Bike", value: 800.00, expectedDate: "2026-10-15", status: "em andamento" },
    ],
  },
  investment: {
    baseValue: 50,
    increment: 10,
    startMonth: "2026-09",
  },
  months: {
    "2026-09": {
      investmentStatus: "A investir",
      walletDeposits: { "Cartão Carlos": 0, "Cartão Vanessa": 0, "Débito": 0, "Dinheiro": 0 },
      fixedBills: [
        { id: "aluguel", name: "Aluguel", value: 2800.00, notes: "Vence dia 03", status: "A pagar", tag: "Pessoal", paymentMethod: "Débito Carlos" , dueDate: "2026-09-03" },
        { id: "metergy", name: "Metergy", value: 200.00, notes: "Orçado — varia com consumo. Cobrado no cartão da Vanessa (visto no extrato)", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Vanessa" , dueDate: "" },
        { id: "bell", name: "Bell (Regular)", value: 324.88, notes: "Em transição para Freedom", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "seguro_casa", name: "Seguro Casa (Square One)", value: 50.76, notes: "Cobrado no cartão da Vanessa (visto no extrato)", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Vanessa" , dueDate: "" },
        { id: "seguro_carro", name: "Seguro Carro (Square One)", value: 342.65, notes: "Cobrado no cartão da Vanessa (visto no extrato)", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Vanessa" , dueDate: "" },
        { id: "carro_parcela1", name: "Parcela Carro 1", value: 289.39, notes: "Débito automático da conta da Vanessa", status: "A pagar", tag: "Pessoal", paymentMethod: "Débito Vanessa" , dueDate: "2026-09-09" },
        { id: "carro_parcela2", name: "Parcela Carro 2", value: 289.30, notes: "Débito automático da conta da Vanessa", status: "A pagar", tag: "Pessoal", paymentMethod: "Débito Vanessa" , dueDate: "2026-09-26" },
        { id: "google_one", name: "Google One", value: 14.33, notes: "Assinatura", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "adobe", name: "Adobe", value: 39.83, notes: "Ferramenta Pixel Soul", status: "A pagar", tag: "Negócio", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "pensao_marcella", name: "Pensão Marcella", value: 247.00, notes: "Prazo indeterminado — via Remitly", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "psicologa_ana", name: "Psicóloga Ana", value: 97.38, notes: "Via Remitly", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "poise_ingles", name: "Poise Inglês", value: 80.00, notes: "Via Remitly", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "pais_carlos", name: "Ajuda aos pais do Carlos", value: 50.00, notes: "Via Remitly", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "netflix", name: "Netflix", value: 21.46, notes: "", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "2026-09-14" },
        { id: "google_storage", name: "Google (armazenamento)", value: 2.82, notes: "", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Vanessa" , dueDate: "2026-09-18" },
        { id: "youtube", name: "YouTube", value: 25.98, notes: "", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Vanessa" , dueDate: "" },
        { id: "baixo_yamaha", name: "Baixo — Yamaha", value: 75.07, notes: "Parcela 11/24", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "macbook_vanessa", name: "MacBook Vanessa", value: 126.58, notes: "Parcela 2/24, termina jul/28", status: "A pagar", tag: "Pessoal", paymentMethod: "Cartão Carlos" , dueDate: "" },
        { id: "claude", name: "Claude", value: 31.64, notes: "Ferramenta Pixel Soul", status: "A pagar", tag: "Negócio", paymentMethod: "Cartão Carlos" , dueDate: "" },
      ],
      variableBills: [
        { id: "var_001", name: "Combustível", value: 84.40, category: "Transporte", notes: "", date: "2026-09-01" , paymentMethod: "Cartão Carlos" },
        { id: "var_002", name: "Air (app)", value: 2.50, category: "Diversos", notes: "", date: "2026-09-01" , paymentMethod: "Cartão Vanessa" },
        { id: "var_003", name: "Mercado Mapletri", value: 82.02, category: "Mercado", notes: "", date: "2026-09-01" , paymentMethod: "Cartão Carlos" },
      ],
    },
  },
  telecom: {
    bellBaseline: 517.00,
    freedomInternet: 49.72,
    freedomLianaLine: 39.55,
    bellPayoffLiana: 123.55,
    bellResidualCarlos: 95.03,
    bellResidualVanessa: 127.55,
    estimativaFamilia: "240 a 260",
    notes: "Fase 1 confirmada: Linha da Liana (iPhone 15) + Internet Fixa migram para a Freedom. Carlos e Vanessa ficam temporariamente na Bell amortizando o saldo dos iPhones 16 e 16 Pro.",
  },
  projectionParams: {
    gsciBase: 7900,
    gsciStress: 6921.12,
    pixelBase: 1000,
    opexVidaBase: 6655.39,
    opexVidaStress: 7500,
  },
};
 
function monthKeyList(count = 24) {
  const keys = [];
  let d = new Date(2026, 8, 1);
  for (let i = 0; i < count; i++) {
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  return keys;
}
 
function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
}
 
function investmentForMonth(investment, key) {
  const [y, m] = key.split("-").map(Number);
  const [sy, sm] = investment.startMonth.split("-").map(Number);
  const elapsed = (y - sy) * 12 + (m - sm);
  if (elapsed < 0) return 0;
  return investment.baseValue + investment.increment * elapsed;
}
 
function applyKnownFixes(data) {
  const fixedPatches = {
    aluguel: { paymentMethod: "Débito Carlos", dueDate: "2026-09-03" },
    metergy: { paymentMethod: "Cartão Vanessa" },
    seguro_casa: { paymentMethod: "Cartão Vanessa" },
    seguro_carro: { paymentMethod: "Cartão Vanessa" },
    carro_parcela1: { paymentMethod: "Débito Vanessa", dueDate: "2026-09-09" },
    carro_parcela2: { paymentMethod: "Débito Vanessa", dueDate: "2026-09-26" },
    netflix: { paymentMethod: "Cartão Carlos", dueDate: "2026-09-14" },
    bell: { paymentMethod: "Cartão Carlos" },
    pensao_marcella: { paymentMethod: "Cartão Carlos" },
    psicologa_ana: { paymentMethod: "Cartão Carlos" },
    poise_ingles: { paymentMethod: "Cartão Carlos" },
    pais_carlos: { paymentMethod: "Cartão Carlos" },
    baixo_yamaha: { paymentMethod: "Cartão Carlos" },
    macbook_vanessa: { paymentMethod: "Cartão Carlos" },
    google_one: { paymentMethod: "Cartão Carlos" },
    google_storage: { paymentMethod: "Cartão Carlos" },
    youtube: { paymentMethod: "Cartão Carlos" },
  };
  const debtPatches = {
    walmart: { paidValue: 150.0 },
    fairstone: { paidValue: 200.0 },
    celso: { name: "Empréstimo Brasil" },
  };
  const loanPatches = {
    carro_gmc: { paidValue: 6391.26 },
  };
 
  const months = { ...data.months };
  if (months["2026-09"]) {
    months["2026-09"] = {
      ...months["2026-09"],
      fixedBills: months["2026-09"].fixedBills.map((b) =>
        fixedPatches[b.id] ? { ...b, ...fixedPatches[b.id] } : b
      ),
    };
  }
  return {
    ...data,
    months,
    debts: data.debts.map((d) => (debtPatches[d.id] ? { ...d, ...debtPatches[d.id] } : d)),
    longTermLoans: data.longTermLoans.map((d) => (loanPatches[d.id] ? { ...d, ...loanPatches[d.id] } : d)),
  };
}
 
function mergeById(parsedList, defaultList) {
  if (!parsedList) return defaultList || [];
  const existingIds = new Set(parsedList.map((b) => b.id));
  const toAdd = (defaultList || []).filter((b) => !existingIds.has(b.id));
  return [...parsedList, ...toAdd];
}
 
function mergeBillsById(parsedList, defaultList) {
  if (!parsedList) return defaultList || [];
  const existingIds = new Set(parsedList.map((b) => b.id));
  const toAdd = (defaultList || []).filter((b) => !existingIds.has(b.id));
  return [...parsedList, ...toAdd];
}
 
function mergeMonths(parsedMonths, defaultMonths) {
  const result = { ...parsedMonths };
  Object.keys(defaultMonths).forEach((key) => {
    if (!result[key]) {
      result[key] = defaultMonths[key];
    } else {
      result[key] = {
        ...defaultMonths[key],
        ...result[key],
        fixedBills: mergeBillsById(result[key].fixedBills, defaultMonths[key].fixedBills),
        variableBills: mergeBillsById(result[key].variableBills, defaultMonths[key].variableBills),
      };
    }
  });
  return result;
}
 
function ensureMonth(data, key) {
  if (data.months[key]) return data;
  const existing = Object.keys(data.months).sort();
  const lastKey = existing[existing.length - 1];
  const template = data.months[lastKey];
  return {
    ...data,
    months: {
      ...data.months,
      [key]: {
        investmentStatus: "A investir",
        walletDeposits: PAYMENT_METHODS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {}),
        fixedBills: template ? template.fixedBills.map((b) => ({ ...b, status: "A pagar" })) : [],
        variableBills: [],
      },
    },
  };
}
 
const TAGS = ["Pessoal", "Negócio"];
const PAYMENT_METHODS = ["Cartão Carlos", "Cartão Vanessa", "Débito Carlos", "Débito Vanessa", "Dinheiro"];
 
function money(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? "-" : "";
  return sign + "CA$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
 
function parseQuickEntry(input) {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const rawValue = parts.shift().replace(',', '.');
  const value = parseFloat(rawValue);
  if (isNaN(value)) return null;

  const remainingText = parts.join(' ').toLowerCase();

  let paymentMethod = "Dinheiro";
  if (remainingText.includes('carlos')) {
    paymentMethod = (remainingText.includes('débito') || remainingText.includes('debito'))
      ? "Débito Carlos" : "Cartão Carlos";
  } else if (remainingText.includes('vanessa')) {
    paymentMethod = (remainingText.includes('débito') || remainingText.includes('debito'))
      ? "Débito Vanessa" : "Cartão Vanessa";
  } else if (remainingText.includes('débito') || remainingText.includes('debito')) {
      paymentMethod = "Débito Carlos";
  }

  let name = parts.join(' ')
    .replace(/(carlos|vanessa|débito|debito|cartão|cartao|dinheiro)/gi, '')
    .trim();

  if (!name) name = "Diversos";
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  let category = "Diversos";
  const lowerName = formattedName.toLowerCase();
  if (/(mercado|costco|fortinos|walmart|assai|loblaws|dollarama|fresh|food|grocery)/.test(lowerName)) category = "Mercado";
  else if (/(uber|gas|combustível|posto|shell|esso|ônibus|bus|parking|estacionamento|air|carro|pedágio|veloe)/.test(lowerName)) category = "Transporte";
  else if (/(starbucks|cinema|sorvete|restaurante|eats|ifood|mcdonalds|astor|pizza|madalosso)/.test(lowerName)) category = "Lazer";
  else if (/(amazon|winners|shoppers|dollar tree|planet|puma|roupa|calcado|nike|calvin|farmácia|remedio)/.test(lowerName)) category = "Compras";
  else if (/(curso|aula|preply|hotmart|escola|francês|ingles|academia|crunch)/.test(lowerName)) category = "Educação";

  return { value, paymentMethod, name: formattedName, category };
}
 
function buildProjection(params) {
  const months = [];
  let d = new Date(2026, 8, 1);
  for (let i = 0; i < 24; i++) {
    months.push(new Date(d));
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  function series(stress) {
    let saldoCelso = 5244.32;
    let acumulado = 0;
    return months.map((dt) => {
      const y = dt.getFullYear(), m = dt.getMonth() + 1;
      const key = `${y}-${m}`;
      let telecom = key === "2026-9" ? 681.77 : ["2026-10", "2026-11", "2026-12"].includes(key) ? 475.71 : 256.37;
      let fairstone = ["2026-10", "2026-11", "2026-12"].includes(key) ? 1060.20 / 3 : 0;
      let celsoPag = 0;
      const afterOct = y > 2026 || (y === 2026 && m >= 10);
      if (afterOct && saldoCelso > 0) {
        celsoPag = Math.min(400, saldoCelso);
        saldoCelso -= celsoPag;
      }
      let pixel;
      if (key === "2026-9") pixel = 927.5 + 5000;
      else if (key === "2026-10") pixel = 800;
      else pixel = stress ? 0 : params.pixelBase;
      const gsci = stress ? params.gsciStress : params.gsciBase;
      const opex = stress ? params.opexVidaStress : params.opexVidaBase;
      const ccb = 263.58;
      const dividaPontual = key === "2026-9" ? 2505.25 + 3741.40 : 0;
      let saldo = gsci + pixel + ccb - opex - telecom - dividaPontual - fairstone - celsoPag;
      if (key === "2026-9") saldo = -307.85;
      acumulado += saldo;
      const label = dt.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
      return { label, saldo, acumulado };
    });
  }
  const base = series(false);
  const stress = series(true);
  return base.map((row, i) => ({
    label: row.label,
    base: Math.round(row.acumulado),
    stress: Math.round(stress[i].acumulado),
  }));
}
 
function Card({ children, style }) {
  return (
    <div
      style={{
        background: PALETTE.panel,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 6,
        padding: "1.1rem 1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
 
function Metric({ label, value, accent, sub }) {
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: PALETTE.textMuted, marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 22,
          fontWeight: 500,
          color: accent || PALETTE.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: PALETTE.textMuted, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </Card>
  );
}
 
function NumInput({ value, onChange, width = 110 }) {
  return (
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width,
        background: PALETTE.panelRaised,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 4,
        color: PALETTE.text,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
        padding: "4px 8px",
        textAlign: "right",
        boxSizing: "border-box"
      }}
    />
  );
}
 
function TextInput({ value, onChange, width = 200, placeholder = "" }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width,
        background: PALETTE.panelRaised,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 4,
        color: PALETTE.text,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13,
        padding: "4px 8px",
        boxSizing: "border-box"
      }}
    />
  );
}
 
function SelectInput({ value, onChange, options, width = 150, renderLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width,
        background: PALETTE.panelRaised,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 4,
        color: PALETTE.text,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13,
        padding: "4px 8px",
        boxSizing: "border-box"
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {renderLabel ? renderLabel(o) : o}
        </option>
      ))}
    </select>
  );
}
 
const TABS = [
  { id: "overview", label: "Visão geral", icon: Wallet },
  { id: "income", label: "Receitas", icon: Landmark },
  { id: "fixed", label: "Contas fixas", icon: Receipt },
  { id: "variable", label: "Contas variáveis", icon: ShoppingCart },
  { id: "debts", label: "Dívidas", icon: CreditCard },
  { id: "flow", label: "Fluxo de caixa", icon: TrendingUp },
  { id: "telecom", label: "Telecom", icon: Smartphone },
  { id: "projection", label: "Projeção 24 meses", icon: TrendingUp },
];
 
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [quickEntry, setQuickEntry] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
 
  useEffect(() => {
    (async () => {
      try {
        const { data: dbRes, error } = await supabase
          .from('painel_state')
          .select('payload')
          .eq('id', 1)
          .maybeSingle(); // maybeSingle evita erro se a tabela estiver completamente vazia
  
        if (dbRes && dbRes.payload && Object.keys(dbRes.payload).length > 0) {
          const parsed = dbRes.payload;
          
          const migratedMonths = parsed.months
            ? mergeMonths(parsed.months, DEFAULT_DATA.months)
            : parsed.fixedBills
            ? { "2026-09": { fixedBills: parsed.fixedBills, variableBills: [] } }
            : DEFAULT_DATA.months;
            
          const merged = {
            ...DEFAULT_DATA,
            ...parsed,
            months: migratedMonths,
            debts: (mergeById(parsed.debts, DEFAULT_DATA.debts)).map((d) =>
              d.originalValue !== undefined ? d : { ...d, originalValue: d.balance, paidValue: 0 }
            ),
            longTermLoans: mergeById(parsed.longTermLoans, DEFAULT_DATA.longTermLoans),
            income: { ...DEFAULT_DATA.income, ...(parsed.income || {}) },
            investment: { ...DEFAULT_DATA.investment, ...(parsed.investment || {}) },
            telecom: { ...DEFAULT_DATA.telecom, ...(parsed.telecom || {}) },
            projectionParams: { ...DEFAULT_DATA.projectionParams, ...(parsed.projectionParams || {}) },
          };
          delete merged.fixedBills;
          
          if (merged.months["2026-09"] && merged.months["2026-09"].variableBills.length === 0) {
            merged.months["2026-09"] = {
              ...merged.months["2026-09"],
              variableBills: DEFAULT_DATA.months["2026-09"].variableBills.map((b) => ({ ...b })),
            };
          }
          setData(applyKnownFixes(merged));
        } else {
          // Se for o primeiro acesso absoluto e a tabela não tiver payload válido
          setData(DEFAULT_DATA);
          await supabase.from('painel_state').upsert({ id: 1, payload: DEFAULT_DATA });
        }
      } catch (e) {
        console.error("Erro ao carregar do Supabase", e);
        setData(DEFAULT_DATA);
      }
      setLoading(false);
    })();
  }, []);
 
  useEffect(() => {
    if (!data || loading) return;
    if (timer.current) clearTimeout(timer.current);
    
    timer.current = setTimeout(async () => {
      try {
        await supabase
          .from('painel_state')
          .update({ payload: data })
          .eq('id', 1);
          
        setSavedAt(new Date());
      } catch (e) {
        console.error("Erro ao salvar no Supabase", e);
      }
    }, 600);
    
    return () => clearTimeout(timer.current);
  }, [data, loading]);
 
  const totalDividas = useMemo(
    () => (data ? data.debts.reduce((s, d) => s + (d.originalValue - d.paidValue), 0) : 0),
    [data]
  );
 
  const gsciMensal = data ? (data.income.gsciCarlos + data.income.gsciVanessa) * 2 : 0;
  const pixelConfirmado = data
    ? data.income.pixelProjects.filter((p) => p.status === "confirmado").reduce((s, p) => s + p.value, 0)
    : 0;
  const pixelNaoConfirmado = data
    ? data.income.pixelProjects.filter((p) => p.status !== "confirmado").reduce((s, p) => s + p.value, 0)
    : 0;
  const receitaGarantida = data ? gsciMensal + data.income.childBenefit + pixelConfirmado : 0;
  const receitaComEstimados = receitaGarantida + pixelNaoConfirmado;
 
  const currentMonthData =
    data && data.months[selectedMonth]
      ? data.months[selectedMonth]
      : { fixedBills: [], variableBills: [], investmentStatus: "A investir", walletDeposits: {} };
  const walletDeposits = currentMonthData.walletDeposits || {};
  const investimentoMes = data ? investmentForMonth(data.investment, selectedMonth) : 0;
  const investimentoContaNoTotal = currentMonthData.investmentStatus === "Investido";
  const totalFixasGeral = useMemo(
    () =>
      data
        ? currentMonthData.fixedBills.reduce((s, b) => s + b.value, 0) + (investimentoContaNoTotal ? investimentoMes : 0)
        : 0,
    [data, selectedMonth]
  );
  const totalFixasPago = useMemo(
    () =>
      data
        ? currentMonthData.fixedBills.filter((b) => (b.status || "A pagar") === "Pago").reduce((s, b) => s + b.value, 0) +
          (investimentoContaNoTotal ? investimentoMes : 0)
        : 0,
    [data, selectedMonth]
  );
  const totalFixasAPagar = totalFixasGeral - totalFixasPago;
  const totalFixasNegocio = useMemo(
    () => (data ? currentMonthData.fixedBills.filter((b) => b.tag === "Negócio").reduce((s, b) => s + b.value, 0) : 0),
    [data, selectedMonth]
  );
  const totalFixasPessoal = totalFixasGeral - totalFixasNegocio;
 
  const totalPorPagamento = useMemo(() => {
    if (!data) return {};
    const todas = [...currentMonthData.fixedBills, ...currentMonthData.variableBills];
    const totais = {};
    PAYMENT_METHODS.forEach((m) => (totais[m] = 0));
    todas.forEach((b) => {
      const m = b.paymentMethod || "Débito";
      totais[m] = (totais[m] || 0) + b.value;
    });
    if (investimentoContaNoTotal) totais["Débito"] = (totais["Débito"] || 0) + investimentoMes;
    return totais;
  }, [data, selectedMonth]);
 
  const totalVariaveis = useMemo(
    () => (data ? currentMonthData.variableBills.reduce((s, b) => s + b.value, 0) : 0),
    [data, selectedMonth]
  );
 
  const reserveFloor = data ? (data.projectionParams.opexVidaBase + 256.37) * 3 : 0;
  const reserveCeil = data ? (data.projectionParams.opexVidaBase + 256.37) * 6 : 0;
 
  const projection = useMemo(() => (data ? buildProjection(data.projectionParams) : []), [data]);

  const derivedFlowData = useMemo(() => {
    if (!data) return [];
    const monthsData = [];
    let d = new Date(2026, 8, 1);
    let saldoCelso = 5244.32;

    for (let i = 0; i < 24; i++) {
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const isCurrentMonth = key === "2026-09";

      let telecom = isCurrentMonth ? 681.77 : ["2026-10", "2026-11", "2026-12"].includes(key) ? 475.71 : 256.37;
      let fairstone = ["2026-10", "2026-11", "2026-12"].includes(key) ? 1060.20 / 3 : 0;
      let celsoPag = 0;

      const afterOct = y > 2026 || (y === 2026 && m >= 10);
      if (afterOct && saldoCelso > 0) {
        celsoPag = Math.min(400, saldoCelso);
        saldoCelso -= celsoPag;
      }

      let dividaPontual = isCurrentMonth ? (2505.25 + 3741.40) : 0;
      let dividas = dividaPontual + fairstone + celsoPag;

      let income = 0;
      if (isCurrentMonth) {
          income = (data.income.gsciCarlos + data.income.gsciVanessa)*2 + data.income.childBenefit +
                  data.income.pixelProjects.filter(p => p.status === "confirmado").reduce((s, p) => s + p.value, 0);
      } else {
          let pixel = key === "2026-10" ? 800 : data.projectionParams.pixelBase;
          income = data.projectionParams.gsciBase + 263.58 + pixel;
      }

      let opex = data.projectionParams.opexVidaBase;
      if (data.months[key]) {
          const bm = data.months[key];
          const invest = bm.investmentStatus === "Investido" ? investmentForMonth(data.investment, key) : 0;
          const fixas = bm.fixedBills.reduce((s, b) => s + b.value, 0) + invest;
          const varis = bm.variableBills.reduce((s, b) => s + b.value, 0);
          opex = fixas + varis;
      }

      let saldo = income - opex - telecom - dividas;

      monthsData.push({
        month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", ""),
        income, opexVida: opex, telecom, dividas, saldo
      });

      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return monthsData;
  }, [data]);
 
  if (loading || !data) {
    return (
      <div style={{ background: PALETTE.bg, color: PALETTE.textMuted, padding: "3rem", textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        A carregar o painel do Supabase...
      </div>
    );
  }
 
  function updateDebt(id, field, value) {
    setData({ ...data, debts: data.debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)) });
  }
 
  function updateLongTermLoan(id, field, value) {
    setData({ ...data, longTermLoans: data.longTermLoans.map((d) => (d.id === id ? { ...d, [field]: value } : d)) });
  }
 
  function updateIncome(field, value) {
    setData({ ...data, income: { ...data.income, [field]: value } });
  }
 
  function updatePixelProject(id, field, value) {
    setData({
      ...data,
      income: {
        ...data.income,
        pixelProjects: data.income.pixelProjects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      },
    });
  }
 
  function addPixelProject() {
    const id = "projeto_" + Date.now();
    setData({
      ...data,
      income: {
        ...data.income,
        pixelProjects: [...data.income.pixelProjects, { id, name: "Novo projeto", value: 0, expectedDate: "", status: "em andamento" }],
      },
    });
  }
 
  function removePixelProject(id) {
    setData({ ...data, income: { ...data.income, pixelProjects: data.income.pixelProjects.filter((p) => p.id !== id) } });
  }
 
  function updateFixedBill(id, field, value) {
    const bills = currentMonthData.fixedBills.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, fixedBills: bills } } });
  }
 
  function addFixedBill() {
    const id = "conta_" + Date.now();
    const bills = [...currentMonthData.fixedBills, { id, name: "Nova conta", value: 0, notes: "", status: "A pagar", tag: "Pessoal", paymentMethod: "Débito Carlos", dueDate: "" }];
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, fixedBills: bills } } });
  }
 
  function removeFixedBill(id) {
    const bills = currentMonthData.fixedBills.filter((b) => b.id !== id);
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, fixedBills: bills } } });
  }
 
  function updateInvestment(field, value) {
    setData({ ...data, investment: { ...data.investment, [field]: value } });
  }
 
  function updateInvestmentStatus(value) {
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, investmentStatus: value } } });
  }
 
  function updateWalletDeposit(method, value) {
    setData({
      ...data,
      months: {
        ...data.months,
        [selectedMonth]: { ...currentMonthData, walletDeposits: { ...walletDeposits, [method]: value } },
      },
    });
  }
 
  function updateVariableBill(id, field, value) {
    const bills = currentMonthData.variableBills.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, variableBills: bills } } });
  }
 
  function addVariableBill(entry = null) {
    const id = "var_" + Date.now();
    const baseBill = {
      id, name: "Novo item", value: 0, category: "Mercado", notes: "", paymentMethod: "Débito Carlos", date: new Date().toISOString().split('T')[0]
    };
    const newBill = entry ? { ...baseBill, ...entry } : baseBill;
    const bills = [...currentMonthData.variableBills, newBill];
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, variableBills: bills } } });
  }
 
  function removeVariableBill(id) {
    const bills = currentMonthData.variableBills.filter((b) => b.id !== id);
    setData({ ...data, months: { ...data.months, [selectedMonth]: { ...currentMonthData, variableBills: bills } } });
  }

  const handleQuickEntrySubmit = (e) => {
    e.preventDefault();
    if (!quickEntry.trim()) return;
    const parsed = parseQuickEntry(quickEntry);
    if (parsed) {
      addVariableBill(parsed);
      setQuickEntry("");
    } else {
      alert("Formato não reconhecido. Tente algo como: '50 Carlos Mercado'");
    }
  };
 
  function changeMonth(key) {
    setData((prev) => ensureMonth(prev, key));
    setSelectedMonth(key);
  }
 
  function updateTelecom(field, value) {
    setData({ ...data, telecom: { ...data.telecom, [field]: value } });
  }
 
  function updateParam(field, value) {
    setData({ ...data, projectionParams: { ...data.projectionParams, [field]: value } });
  }
 
  const sortedDebts = [...data.debts].sort((a, b) => b.apr - a.apr);
  const nextDue = sortedDebts.find((d) => d.apr > 0);
 
  return (
    <div
      style={{
        background: PALETTE.bg,
        color: PALETTE.text,
        minHeight: "100vh",
        padding: "2rem 1.5rem",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        
        .tabs-container {
          display: flex; gap: 4px; border-bottom: 1px solid ${PALETTE.border}; margin-bottom: 1.5rem;
          overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px;
        }
        .tabs-container::-webkit-scrollbar { height: 4px; display: none; }

        @media (max-width: 768px) {
          .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td {
            display: block; width: 100%; box-sizing: border-box;
          }
          .responsive-table thead { display: none; }
          .responsive-table tr {
            border: 1px solid ${PALETTE.border} !important; border-radius: 6px; margin-bottom: 12px; background: ${PALETTE.panel};
          }
          .responsive-table td {
            display: flex; flex-direction: column; align-items: flex-start; padding: 10px 12px !important;
            border-bottom: 1px solid ${PALETTE.border} !important; text-align: left !important;
          }
          .responsive-table td:last-child { border-bottom: none !important; }
          .responsive-table td::before {
            content: attr(data-label); color: ${PALETTE.textMuted}; font-size: 11px; margin-bottom: 4px; font-weight: 500; text-transform: uppercase;
          }
          .responsive-table input, .responsive-table select { width: 100% !important; }
          .grid-responsive { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
          .tabs-container { display: flex; }
        }
      `}</style>
 
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, margin: 0 }}>
              Painel financeiro
            </h1>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: PALETTE.textMuted, marginTop: 4 }}>
              Set/2026 → Set/2028 · Vaughan, ON
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: PALETTE.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
            {savedAt ? (
              <>
                <CheckCircle2 size={14} color={PALETTE.sage} />
                salvo às {savedAt.toLocaleTimeString("pt-BR")}
              </>
            ) : (
              <>
                <RefreshCcw size={14} /> a sincronizar
              </>
            )}
          </div>
        </div>
 
        <div className="tabs-container">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  borderBottom: active ? `2px solid ${PALETTE.gold}` : "2px solid transparent",
                  color: active ? PALETTE.text : PALETTE.textMuted,
                  padding: "8px 12px",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  cursor: "pointer",
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
 
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <Metric
                label="Saldo de caixa atual"
                value={money(data.cashPosition)}
                accent={data.cashPosition >= 0 ? PALETTE.sage : PALETTE.brick}
              />
              <Metric label="Total em dívidas" value={money(totalDividas)} accent={PALETTE.brick} />
              <Metric
                label="Próxima prioridade (Avalanche)"
                value={nextDue ? nextDue.name : "—"}
                sub={nextDue ? `${nextDue.apr}% a.a. · ${nextDue.dueLabel}` : ""}
                accent={PALETTE.gold}
              />
            </div>
 
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: PALETTE.textMuted }}>OPEX de</div>
              <SelectInput value={selectedMonth} onChange={changeMonth} options={monthKeyList()} renderLabel={monthLabel} width={120} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <Metric label="OPEX fixo" value={money(totalFixasGeral)} accent={PALETTE.sky} sub="Contas fixas + investimento" />
              <Metric label="OPEX variável" value={money(totalVariaveis)} accent={PALETTE.brick} sub="Contas variáveis" />
              <Metric label="OPEX total" value={money(totalFixasGeral + totalVariaveis)} accent={PALETTE.gold} sub={`Fixo + variável — ${monthLabel(selectedMonth)}`} />
            </div>
 
            <Card style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>
                Carteiras — {monthLabel(selectedMonth)}
              </div>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "6px 10px", color: PALETTE.textMuted, fontWeight: 500 }}>Carteira</th>
                    <th style={{ padding: "6px 10px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Enviado</th>
                    <th style={{ padding: "6px 10px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Usado</th>
                    <th style={{ padding: "6px 10px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Disponível</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYMENT_METHODS.map((m) => {
                    const enviado = walletDeposits[m] || 0;
                    const usado = totalPorPagamento[m] || 0;
                    const disponivel = enviado - usado;
                    return (
                      <tr key={m} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                        <td data-label="Carteira" style={{ padding: "8px 10px" }}>{m}</td>
                        <td data-label="Enviado" style={{ padding: "8px 10px", textAlign: "right" }}>
                          <NumInput value={enviado} onChange={(v) => updateWalletDeposit(m, v)} width={100} />
                        </td>
                        <td data-label="Usado" style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.textMuted }}>
                          {money(usado)}
                        </td>
                        <td
                          data-label="Disponível"
                          style={{
                            padding: "8px 10px",
                            textAlign: "right",
                            fontFamily: "'IBM Plex Mono', monospace",
                            color: disponivel >= 0 ? PALETTE.sage : PALETTE.brick,
                          }}
                        >
                          {money(disponivel)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: 12, color: PALETTE.textMuted, marginTop: 10 }}>
                "Enviado" é quanto vocês transferiram/depositaram pra essa carteira este mês. "Usado" vem automático das contas. "Disponível" negativo é alerta.
              </div>
            </Card>
 
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>
                Reserva de emergência (meta: 3x a 6x do OPEX crítico mensal)
              </div>
              <div style={{ background: PALETTE.panelRaised, borderRadius: 4, height: 10, overflow: "hidden", marginBottom: 8 }}>
                <div
                  style={{
                    width: `${Math.min(100, (Math.max(0, data.cashPosition) / reserveCeil) * 100)}%`,
                    background: PALETTE.gold,
                    height: "100%",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: PALETTE.textMuted }}>
                <span>$0</span>
                <span>piso 3x: {money(reserveFloor)}</span>
                <span>meta 6x: {money(reserveCeil)}</span>
              </div>
            </Card>
            <div style={{ marginTop: "1.25rem" }}>
              <label style={{ fontSize: 13, color: PALETTE.textMuted, marginRight: 10 }}>
                Ajustar saldo de caixa atual:
              </label>
              <NumInput value={data.cashPosition} onChange={(v) => setData({ ...data, cashPosition: v })} />
            </div>
          </div>
        )}
 
        {tab === "income" && (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <Metric label="GSCI mensal (80h, ambos)" value={money(gsciMensal)} accent={PALETTE.sage} />
              <Metric label="Receita garantida" value={money(receitaGarantida)} accent={PALETTE.sage} sub="GSCI + CCB + Pixel confirmado" />
              <Metric label="Com projetos em andamento" value={money(receitaComEstimados)} accent={PALETTE.gold} sub="inclui estimativas não confirmadas" />
            </div>
 
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>GSCI — por quinzena, por pessoa</div>
              <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Carlos</div>
                  <NumInput value={data.income.gsciCarlos} onChange={(v) => updateIncome("gsciCarlos", v)} width="100%" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Vanessa</div>
                  <NumInput value={data.income.gsciVanessa} onChange={(v) => updateIncome("gsciVanessa", v)} width="100%" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Child Benefit (mensal)</div>
                  <NumInput value={data.income.childBenefit} onChange={(v) => updateIncome("childBenefit", v)} width="100%" />
                </div>
              </div>
            </Card>
 
            <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>Pixel Soul — projetos nomeados</div>
            <Card style={{ padding: 0 }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Projeto</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Data prevista</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Status</th>
                    <th style={{ padding: "10px 14px", width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.income.pixelProjects.map((p) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                      <td data-label="Projeto" style={{ padding: "8px 14px" }}>
                        <TextInput value={p.name} onChange={(v) => updatePixelProject(p.id, "name", v)} width="100%" />
                      </td>
                      <td data-label="Valor" style={{ padding: "8px 14px", textAlign: "right" }}>
                        <NumInput value={p.value} onChange={(v) => updatePixelProject(p.id, "value", v)} width="100%" />
                      </td>
                      <td data-label="Data prevista" style={{ padding: "8px 14px" }}>
                        <input
                          type="date"
                          value={p.expectedDate}
                          onChange={(e) => updatePixelProject(p.id, "expectedDate", e.target.value)}
                          style={{
                            background: PALETTE.panelRaised, border: `1px solid ${PALETTE.border}`, borderRadius: 4,
                            color: PALETTE.text, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "4px 8px", width: "100%", boxSizing: "border-box"
                          }}
                        />
                      </td>
                      <td data-label="Status" style={{ padding: "8px 14px" }}>
                        <SelectInput
                          value={p.status} onChange={(v) => updatePixelProject(p.id, "status", v)}
                          options={["confirmado", "limite", "em andamento", "estimado"]} width="100%"
                        />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "center" }}>
                        <button
                          onClick={() => removePixelProject(p.id)} aria-label="Remover projeto"
                          style={{ background: "none", border: "none", color: PALETTE.textMuted, cursor: "pointer", display: "flex" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <button
              onClick={addPixelProject}
              style={{
                marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "none",
                border: `1px solid ${PALETTE.border}`, borderRadius: 4, color: PALETTE.text, padding: "6px 12px",
                fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <Plus size={14} /> Adicionar projeto
            </button>
          </div>
        )}
 
        {tab === "fixed" && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Mês</div>
                <SelectInput value={selectedMonth} onChange={changeMonth} options={monthKeyList()} renderLabel={monthLabel} width={140} />
              </div>
              <div style={{ fontSize: 12, color: PALETTE.textMuted, marginTop: 18 }}>
                {monthLabel(selectedMonth)} — meses novos copiam as fixas do mês anterior automaticamente
              </div>
            </div>
 
            <div style={{ display: "flex", gap: 12, marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <Metric label={`Total — ${monthLabel(selectedMonth)}`} value={money(totalFixasGeral)} accent={PALETTE.sky} sub={`${currentMonthData.fixedBills.length} itens + invest.`} />
              <Metric label="Total pago" value={money(totalFixasPago)} accent={PALETTE.sage} />
              <Metric label="Total a pagar" value={money(totalFixasAPagar)} accent={PALETTE.brick} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <Metric label="OPEX Pessoal" value={money(totalFixasPessoal)} accent={PALETTE.sky} sub="sai do caixa da família" />
              <Metric label="OPEX Negócio (Pixel Soul)" value={money(totalFixasNegocio)} accent={PALETTE.gold} sub="tag, não muda o caixa ainda" />
            </div>
 
            <Card style={{ marginBottom: 16, borderColor: PALETTE.gold }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontSize: 13, color: PALETTE.textMuted }}>Investimento mensal (cronograma automático)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SelectInput value={currentMonthData.investmentStatus || "A investir"} onChange={updateInvestmentStatus} options={["A investir", "Investido"]} width={120} />
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: investimentoContaNoTotal ? PALETTE.gold : PALETTE.textMuted }}>
                    {money(investimentoMes)}
                  </div>
                </div>
              </div>
              <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Valor inicial</div>
                  <NumInput value={data.investment.baseValue} onChange={(v) => updateInvestment("baseValue", v)} width="100%" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Incremento / mês</div>
                  <NumInput value={data.investment.increment} onChange={(v) => updateInvestment("increment", v)} width="100%" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Mês inicial</div>
                  <SelectInput value={data.investment.startMonth} onChange={(v) => updateInvestment("startMonth", v)} options={monthKeyList()} renderLabel={monthLabel} width="100%" />
                </div>
              </div>
            </Card>
 
            <Card style={{ padding: 0 }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Conta</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Vencimento</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Status</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Tag</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Pagamento</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Notas</th>
                    <th style={{ padding: "10px 14px", width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthData.fixedBills.map((b) => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                      <td data-label="Conta" style={{ padding: "8px 14px" }}>
                        <TextInput value={b.name} onChange={(v) => updateFixedBill(b.id, "name", v)} width={"100%"} />
                      </td>
                      <td data-label="Valor" style={{ padding: "8px 14px", textAlign: "right" }}>
                        <NumInput value={b.value} onChange={(v) => updateFixedBill(b.id, "value", v)} width="100%" />
                      </td>
                      <td data-label="Vencimento" style={{ padding: "8px 14px" }}>
                        <input
                          type="date"
                          value={b.dueDate || ""}
                          onChange={(e) => updateFixedBill(b.id, "dueDate", e.target.value)}
                          style={{
                            background: PALETTE.panelRaised, border: `1px solid ${PALETTE.border}`, borderRadius: 4,
                            color: PALETTE.text, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "4px 6px", width: "100%", boxSizing: "border-box"
                          }}
                        />
                      </td>
                      <td data-label="Status" style={{ padding: "8px 14px" }}>
                        <SelectInput value={b.status || "A pagar"} onChange={(v) => updateFixedBill(b.id, "status", v)} options={["A pagar", "Pago"]} width="100%" />
                      </td>
                      <td data-label="Tag" style={{ padding: "8px 14px" }}>
                        <SelectInput value={b.tag || "Pessoal"} onChange={(v) => updateFixedBill(b.id, "tag", v)} options={TAGS} width="100%" />
                      </td>
                      <td data-label="Pagamento" style={{ padding: "8px 14px" }}>
                        <SelectInput value={b.paymentMethod || "Débito"} onChange={(v) => updateFixedBill(b.id, "paymentMethod", v)} options={PAYMENT_METHODS} width="100%" />
                      </td>
                      <td data-label="Notas" style={{ padding: "8px 14px" }}>
                        <TextInput value={b.notes} onChange={(v) => updateFixedBill(b.id, "notes", v)} width={"100%"} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "center" }}>
                        <button onClick={() => removeFixedBill(b.id)} aria-label="Remover" style={{ background: "none", border: "none", color: PALETTE.textMuted, cursor: "pointer", display: "flex" }}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <button
              onClick={addFixedBill}
              style={{
                marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${PALETTE.border}`, borderRadius: 4, color: PALETTE.text, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <Plus size={14} /> Adicionar conta
            </button>
          </div>
        )}
 
        {tab === "variable" && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Mês</div>
                <SelectInput value={selectedMonth} onChange={changeMonth} options={monthKeyList()} renderLabel={monthLabel} width={140} />
              </div>
            </div>

            <Card style={{ marginBottom: 16, borderColor: PALETTE.gold }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: PALETTE.textMuted, marginBottom: 8 }}>
                <Zap size={14} color={PALETTE.gold} /> Inserção Rápida (Smart Parser)
              </div>
              <form onSubmit={handleQuickEntrySubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <TextInput
                    value={quickEntry}
                    onChange={setQuickEntry}
                    width="100%"
                    placeholder="Ex: 50 Carlos Mercado ou 120 debito vanessa farmacia"
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: PALETTE.gold, color: PALETTE.bg, border: "none", borderRadius: 4, padding: "8px 16px",
                    fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13
                  }}
                >
                  Lançar
                </button>
              </form>
              <div style={{ fontSize: 11, color: PALETTE.textMuted, marginTop: 6 }}>
                Preparação para a integração por voz. O painel converte o texto e adivinha a categoria.
              </div>
            </Card>
 
            <div style={{ display: "flex", gap: 12, marginBottom: "1.25rem" }}>
              <Metric label={`Total de variáveis — ${monthLabel(selectedMonth)}`} value={money(totalVariaveis)} accent={PALETTE.brick} sub={`${currentMonthData.variableBills.length} itens lançados`} />
            </div>
 
            <Card style={{ padding: 0 }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Item</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Data</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Categoria</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Pagamento</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Notas</th>
                    <th style={{ padding: "10px 14px", width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {[...currentMonthData.variableBills]
                    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                    .map((b) => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                      <td data-label="Item" style={{ padding: "8px 14px" }}>
                        <TextInput value={b.name} onChange={(v) => updateVariableBill(b.id, "name", v)} width="100%" />
                      </td>
                      <td data-label="Data" style={{ padding: "8px 14px" }}>
                        <input
                          type="date"
                          value={b.date || ""}
                          onChange={(e) => updateVariableBill(b.id, "date", e.target.value)}
                          style={{
                            background: PALETTE.panelRaised, border: `1px solid ${PALETTE.border}`, borderRadius: 4,
                            color: PALETTE.text, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: "4px 6px", width: "100%", boxSizing: "border-box"
                          }}
                        />
                      </td>
                      <td data-label="Categoria" style={{ padding: "8px 14px" }}>
                        <SelectInput
                          value={b.category} onChange={(v) => updateVariableBill(b.id, "category", v)}
                          options={["Mercado", "Transporte", "Lazer", "Compras", "Educação", "Diversos"]} width="100%"
                        />
                      </td>
                      <td data-label="Valor" style={{ padding: "8px 14px", textAlign: "right" }}>
                        <NumInput value={b.value} onChange={(v) => updateVariableBill(b.id, "value", v)} width="100%" />
                      </td>
                      <td data-label="Pagamento" style={{ padding: "8px 14px" }}>
                        <SelectInput value={b.paymentMethod || "Débito"} onChange={(v) => updateVariableBill(b.id, "paymentMethod", v)} options={PAYMENT_METHODS} width="100%" />
                      </td>
                      <td data-label="Notas" style={{ padding: "8px 14px" }}>
                        <TextInput value={b.notes} onChange={(v) => updateVariableBill(b.id, "notes", v)} width={"100%"} />
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "center" }}>
                        <button onClick={() => removeVariableBill(b.id)} aria-label="Remover" style={{ background: "none", border: "none", color: PALETTE.textMuted, cursor: "pointer", display: "flex" }}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <button
              onClick={() => addVariableBill()}
              style={{
                marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${PALETTE.border}`, borderRadius: 4, color: PALETTE.text, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <Plus size={14} /> Adicionar manualmente
            </button>
          </div>
        )}
 
        {tab === "debts" && (
          <div>
            <Card style={{ padding: 0 }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Credor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor da dívida</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor pago</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Saldo devedor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>APR</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Vencimento / fonte</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDebts.map((d) => {
                    const saldoDevedor = d.originalValue - d.paidValue;
                    return (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                        <td data-label="Credor" style={{ padding: "10px 14px" }}>{d.name}</td>
                        <td data-label="Original" style={{ padding: "10px 14px", textAlign: "right" }}>
                          <NumInput value={d.originalValue} onChange={(v) => updateDebt(d.id, "originalValue", v)} width="100%" />
                        </td>
                        <td data-label="Pago" style={{ padding: "10px 14px", textAlign: "right" }}>
                          <NumInput value={d.paidValue} onChange={(v) => updateDebt(d.id, "paidValue", v)} width="100%" />
                        </td>
                        <td data-label="Saldo" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: saldoDevedor <= 0 ? PALETTE.sage : PALETTE.text }}>
                          {money(saldoDevedor)}
                        </td>
                        <td data-label="APR" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: d.apr > 25 ? PALETTE.brick : d.apr > 0 ? PALETTE.gold : PALETTE.sage }}>
                          {d.apr.toFixed(2)}%
                        </td>
                        <td data-label="Detalhes" style={{ padding: "10px 14px", color: PALETTE.textMuted, fontSize: 12 }}>{d.dueLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
 
            <div style={{ marginTop: 28, marginBottom: 10, fontSize: 13, color: PALETTE.textMuted }}>
              Financiamentos de longo prazo — referência, fora da Matriz Avalanche
            </div>
            <Card style={{ padding: 0, borderColor: PALETTE.sky }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Financiamento</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Valor original</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Pago</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>Saldo devedor</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500, textAlign: "right" }}>APR</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.longTermLoans.map((d) => {
                    const saldo = d.originalValue - d.paidValue;
                    return (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                        <td data-label="Financiamento" style={{ padding: "10px 14px" }}>{d.name}</td>
                        <td data-label="Original" style={{ padding: "10px 14px", textAlign: "right" }}>
                          <NumInput value={d.originalValue} onChange={(v) => updateLongTermLoan(d.id, "originalValue", v)} width="100%" />
                        </td>
                        <td data-label="Pago" style={{ padding: "10px 14px", textAlign: "right" }}>
                          <NumInput value={d.paidValue} onChange={(v) => updateLongTermLoan(d.id, "paidValue", v)} width="100%" />
                        </td>
                        <td data-label="Saldo" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>
                          {money(saldo)}
                        </td>
                        <td data-label="APR" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: PALETTE.sky }}>
                          {d.apr.toFixed(2)}%
                        </td>
                        <td data-label="Detalhes" style={{ padding: "10px 14px", color: PALETTE.textMuted, fontSize: 12 }}>{d.dueLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}
 
        {tab === "flow" && (
          <div>
            <div style={{ marginBottom: "1rem", fontSize: 13, color: PALETTE.textMuted }}>
              Tabela calculada automaticamente. Para meses que já possuem contas inseridas, o <strong>OPEX vida</strong> reflete a soma real de contas Fixas + Variáveis daquele mês. Para os próximos, reflete a projeção.
            </div>
            <Card style={{ padding: 0 }}>
              <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PALETTE.border}`, textAlign: "right" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: PALETTE.textMuted, fontWeight: 500 }}>Mês</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Receita</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>OPEX real/base</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Telecom</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Dívidas</th>
                    <th style={{ padding: "10px 14px", color: PALETTE.textMuted, fontWeight: 500 }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {derivedFlowData.map((f, i) => (
                    <tr key={f.month} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                      <td data-label="Mês" style={{ padding: "10px 14px" }}>{f.month}</td>
                      <td data-label="Receita" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{money(f.income)}</td>
                      <td data-label="OPEX" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{money(f.opexVida)}</td>
                      <td data-label="Telecom" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{money(f.telecom)}</td>
                      <td data-label="Dívidas" style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{money(f.dividas)}</td>
                      <td
                        data-label="Saldo"
                        style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: f.saldo >= 0 ? PALETTE.sage : PALETTE.brick }}
                      >
                        {money(f.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
 
        {tab === "telecom" && (() => {
          const freedomRecorrente = data.telecom.freedomInternet + data.telecom.freedomLianaLine;
          const bellResidual = data.telecom.bellResidualCarlos + data.telecom.bellResidualVanessa;
          const bellAntigoLianaInternet = 71.0 * 1.13 + 84.52 * 1.13;
          const economiaMensal = bellAntigoLianaInternet - freedomRecorrente;
          const payback = data.telecom.bellPayoffLiana / economiaMensal;
          const totalCombinado = freedomRecorrente + bellResidual;
          return (
            <div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <Metric label="Bell histórico (3 linhas + internet)" value={money(data.telecom.bellBaseline)} accent={PALETTE.brick} />
                <Metric label="Freedom recorrente (Internet + Liana)" value={money(freedomRecorrente)} accent={PALETTE.sage} />
                <Metric label="Payback da quitação" value={`${payback.toFixed(2)} meses`} accent={PALETTE.gold} sub={`quitação de ${money(data.telecom.bellPayoffLiana)}`} />
              </div>
 
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>
                  Fase 1 em execução — Linha da Liana (iPhone 15) + Internet Fixa
                </div>
                <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Freedom Internet 100 (c/ HST)</div>
                    <NumInput value={data.telecom.freedomInternet} onChange={(v) => updateTelecom("freedomInternet", v)} width="100%" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Freedom Linha Liana (c/ HST)</div>
                    <NumInput value={data.telecom.freedomLianaLine} onChange={(v) => updateTelecom("freedomLianaLine", v)} width="100%" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Quitação Bell — iPhone 15 (c/ HST, única vez)</div>
                    <NumInput value={data.telecom.bellPayoffLiana} onChange={(v) => updateTelecom("bellPayoffLiana", v)} width="100%" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Economia mensal recorrente</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: PALETTE.sage, paddingTop: 4 }}>
                      {money(economiaMensal)}
                    </div>
                  </div>
                </div>
              </Card>
 
              <Card style={{ marginBottom: 16, borderColor: PALETTE.sky }}>
                <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>
                  Residual na Bell — Carlos (iPhone 16) e Vanessa (iPhone 16 Pro), temporário
                </div>
                <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Linha Carlos (c/ HST)</div>
                    <NumInput value={data.telecom.bellResidualCarlos} onChange={(v) => updateTelecom("bellResidualCarlos", v)} width="100%" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>Linha Vanessa (c/ HST)</div>
                    <NumInput value={data.telecom.bellResidualVanessa} onChange={(v) => updateTelecom("bellResidualVanessa", v)} width="100%" />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, paddingTop: 8, borderTop: `1px solid ${PALETTE.border}` }}>
                  <span style={{ color: PALETTE.textMuted, fontFamily: "'IBM Plex Sans', sans-serif" }}>Total combinado (Freedom + residual Bell)</span>
                  <span style={{ color: PALETTE.text }}>{money(totalCombinado)}</span>
                </div>
              </Card>
            </div>
          );
        })()}
 
        {tab === "projection" && (
          <div>
            <Card>
              <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 12 }}>
                Acumulado projetado — cenário base vs. estresse (linha tracejada = piso da reserva de emergência)
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={projection} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={PALETTE.border} strokeDasharray="2 2" vertical={false} />
                  <XAxis dataKey="label" stroke={PALETTE.textMuted} fontSize={11} interval={2} />
                  <YAxis stroke={PALETTE.textMuted} fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ background: PALETTE.panelRaised, border: `1px solid ${PALETTE.border}`, fontSize: 12 }}
                    formatter={(v) => money(v)}
                  />
                  <ReferenceLine y={reserveFloor} stroke={PALETTE.gold} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="base" stroke={PALETTE.sage} strokeWidth={2} dot={false} name="Base" />
                  <Line type="monotone" dataKey="stress" stroke={PALETTE.brick} strokeWidth={2} dot={false} name="Estresse" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: PALETTE.textMuted }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: PALETTE.sage, marginRight: 4 }} />Base</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: PALETTE.brick, marginRight: 4 }} />Estresse</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: PALETTE.gold, marginRight: 4 }} />Piso reserva 3x</span>
              </div>
            </Card>
 
            <Card style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 10 }}>Parâmetros do modelo</div>
              <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  ["GSCI base (80h)", "gsciBase"],
                  ["GSCI estresse (70h)", "gsciStress"],
                  ["Pixel Soul (teto conservador)", "pixelBase"],
                  ["OPEX vida base", "opexVidaBase"],
                  ["OPEX vida estresse", "opexVidaStress"],
                ].map(([label, field]) => (
                  <div key={field}>
                    <div style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 4 }}>{label}</div>
                    <NumInput value={data.projectionParams[field]} onChange={(v) => updateParam(field, v)} width="100%" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}