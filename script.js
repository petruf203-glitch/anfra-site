function copyCA(){
  const ca=document.getElementById('ca').innerText;
  navigator.clipboard.writeText(ca);
  const btn=document.querySelector('.contract button');
  btn.innerText='COPIED!';
  setTimeout(()=>btn.innerText='COPY',1500);
}

/* ================================
   ANFRA ID / FOUNDING 1000
   ================================ */
const SUPABASE_URL = "https://fwdrqxnyrnxoywvexpze.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DZjsjTyU0dAcQoM69Ub2iQ_y2GEtsxe";

const supabaseReady = SUPABASE_URL.startsWith("https://") && SUPABASE_PUBLISHABLE_KEY && !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
const db = supabaseReady && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

const ANFRA_MINT = "BphpFLbusysVvshrz8tB7uuvPMf6qssypve4sUG9vray";
const ANFRA_RPCS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.g.alchemy.com/v2/demo"
];
const FOUNDING_MIN_ANFRA = 10000;

let selectedWallet = null;
let selectedWalletName = '';
let standardWallets = [];

// Wallet Standard discovers compatible wallets automatically (including new Solana wallets).
(async function discoverStandardWallets(){
  try{
    const mod = await import('https://esm.sh/@wallet-standard/app@1.1.0');
    const registry = mod.getWallets();
    const refresh = () => {
      standardWallets = registry.get().filter(w =>
        Array.isArray(w.chains) && w.chains.some(c => String(c).startsWith('solana:')) &&
        w.features && w.features['standard:connect']
      );
    };
    refresh();
    registry.on('register', refresh);
  }catch(e){
    console.warn('Wallet Standard discovery unavailable:', e);
  }
})();

const walletCatalog = [
  {id:'phantom', name:'Phantom', icon:'👻', deep:'https://phantom.app/ul/browse/https%3A%2F%2Fanfra.trade%2F'},
  {id:'solflare', name:'Solflare', icon:'🔥', deep:'https://solflare.com/'},
  {id:'backpack', name:'Backpack', icon:'🎒', deep:'https://backpack.app/'},
  {id:'jupiter', name:'Jupiter Wallet', icon:'🪐', deep:'https://jup.ag/'},
  {id:'okx', name:'OKX Wallet', icon:'🟠', deep:'https://www.okx.com/web3'},
  {id:'bitget', name:'Bitget Wallet', icon:'🟢', deep:'https://web3.bitget.com/'},
  {id:'coinbase', name:'Coinbase Wallet', icon:'🔵', deep:'https://www.coinbase.com/wallet'},
  {id:'trust', name:'Trust Wallet', icon:'🛡️', deep:'https://trustwallet.com/'},
  {id:'brave', name:'Brave Wallet', icon:'🦁', deep:'https://brave.com/wallet/'},
  {id:'ledger', name:'Ledger', icon:'💎', deep:'https://www.ledger.com/'}
];

function createWalletModal(){
  if(document.getElementById('walletModal')) return;
  const modal = document.createElement('div');
  modal.id = 'walletModal';
  modal.className = 'wallet-modal';
  modal.innerHTML = `
    <div class="wallet-backdrop" data-close-wallet></div>
    <div class="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="walletTitle">
      <button class="wallet-close" data-close-wallet aria-label="Close">×</button>
      <div class="wallet-dialog-head">
        <span class="id-label">ANFRA ID</span>
        <h3 id="walletTitle">Connect your wallet</h3>
        <p>Select your preferred Solana wallet.</p>
      </div>
      <div id="walletOptions" class="wallet-options"></div>
      <div class="wallet-modal-note">More compatible wallets are detected automatically when available.</div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-close-wallet]').forEach(el => el.addEventListener('click', closeWalletModal));
}

function openWalletModal(){
  createWalletModal();
  renderWalletOptions();
  document.getElementById('walletModal').classList.add('show');
  document.body.classList.add('wallet-open');
}

function closeWalletModal(){
  const modal = document.getElementById('walletModal');
  if(modal) modal.classList.remove('show');
  document.body.classList.remove('wallet-open');
}

function isMobile(){ return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }

function getInjectedProvider(id){
  const w = window;
  if(id === 'phantom') return w.phantom?.solana || (w.solana?.isPhantom ? w.solana : null);
  if(id === 'solflare') return w.solflare || null;
  if(id === 'backpack') return w.backpack?.solana || w.backpack || null;
  if(id === 'okx') return w.okxwallet?.solana || null;
  if(id === 'bitget') return w.bitkeep?.solana || w.bitget?.solana || null;
  if(id === 'coinbase') return w.coinbaseSolana || w.coinbaseWalletExtension?.solana || null;
  if(id === 'trust') return w.trustwallet?.solana || null;
  if(id === 'brave') return w.braveSolana || null;
  if(id === 'jupiter') return w.jupiter?.solana || null;
  return null;
}

function walletStandardForName(name){
  return standardWallets.find(w => w.name.toLowerCase() === name.toLowerCase()) ||
    standardWallets.find(w => w.name.toLowerCase().includes(name.toLowerCase())) || null;
}

function walletIsDetected(item){
  if(item.id === 'ledger') return false;
  if(getInjectedProvider(item.id)) return true;
  return !!walletStandardForName(item.name);
}

function renderWalletOptions(){
  const box = document.getElementById('walletOptions');
  if(!box) return;

  const detected = standardWallets.filter(w => w.name).map(w => w.name);
  const known = walletCatalog.map(x => x.name.toLowerCase());
  const extras = standardWallets.filter(w => !known.some(k => w.name.toLowerCase().includes(k) || k.includes(w.name.toLowerCase())));

  let html = walletCatalog.map(item => {
    const detectedNow = walletIsDetected(item);
    const mobile = isMobile();
    const actionText = detectedNow ? 'Detected' : (mobile ? 'Open' : 'Select');
    return `<button class="wallet-option" data-wallet="${item.id}">
      <span class="wallet-icon">${item.icon}</span>
      <span class="wallet-name"><b>${item.name}</b><small>${detectedNow ? 'Ready to connect' : 'Solana wallet'}</small></span>
      <span class="wallet-action">${actionText} ›</span>
    </button>`;
  }).join('');

  extras.forEach((w, i) => {
    html += `<button class="wallet-option" data-standard-index="${standardWallets.indexOf(w)}">
      <span class="wallet-icon">◈</span>
      <span class="wallet-name"><b>${w.name}</b><small>Wallet Standard</small></span>
      <span class="wallet-action">Select ›</span>
    </button>`;
  });

  box.innerHTML = html;
  box.querySelectorAll('[data-wallet]').forEach(btn => btn.addEventListener('click', () => chooseWallet(btn.dataset.wallet)));
  box.querySelectorAll('[data-standard-index]').forEach(btn => btn.addEventListener('click', () => {
    const wallet = standardWallets[Number(btn.dataset.standardIndex)];
    connectStandardWallet(wallet);
  }));
}

async function chooseWallet(id){
  const item = walletCatalog.find(x => x.id === id);
  if(!item) return;

  const provider = getInjectedProvider(id);
  const standard = walletStandardForName(item.name);

  if(standard){
    await connectStandardWallet(standard);
    return;
  }

  if(provider){
    await connectInjectedWallet(provider, item.name);
    return;
  }

  // On mobile, open the wallet/dapp route when there is no browser injection.
  if(isMobile()){
    closeWalletModal();
    if(id === 'phantom') window.location.href = item.deep;
    else window.open(item.deep, '_blank');
    return;
  }

  const status = document.getElementById('walletStatus');
  status.innerText = item.name.toUpperCase() + ' NOT DETECTED';
}

async function connectStandardWallet(wallet){
  if(!wallet) return;
  try{
    const feature = wallet.features?.['standard:connect'];
    if(!feature) throw new Error('Wallet does not support standard connect');
    closeWalletModal();
    const result = await feature.connect();
    const account = result?.accounts?.find(a => String(a.chains || '').includes('solana:')) || result?.accounts?.[0];
    const address = account?.address;
    if(!address) throw new Error('No Solana account returned');
    await handleConnectedWallet(address, wallet.name, wallet);
  }catch(err){
    console.error(err);
    const status = document.getElementById('walletStatus');
    status.innerText = 'CONNECTION CANCELLED';
  }
}

async function connectInjectedWallet(provider, name){
  try{
    closeWalletModal();
    const response = await provider.connect();
    const publicKey = response?.publicKey || provider.publicKey;
    if(!publicKey) throw new Error('No public key returned');
    await handleConnectedWallet(publicKey.toString(), name, provider);
  }catch(err){
    console.error(err);
    document.getElementById('walletStatus').innerText = 'CONNECTION CANCELLED';
  }
}

async function handleConnectedWallet(wallet, walletName, provider){
  selectedWallet = provider;
  selectedWalletName = walletName;

  const btn = document.getElementById('connectWalletBtn');
  const status = document.getElementById('walletStatus');
  btn.disabled = true;
  btn.innerText = 'CHECKING ANFRA...';
  status.innerText = wallet.slice(0,5) + '...' + wallet.slice(-5) + ' • ' + walletName.toUpperCase();

  let hash = 0;
  for(let i=0;i<wallet.length;i++) hash = ((hash << 5) - hash) + wallet.charCodeAt(i) | 0;
  document.getElementById('anfraIdNumber').innerText = '#' + String(Math.abs(hash)%10000).padStart(4,'0');

  try{
    const result = await checkAndClaimFounding(wallet);
    const balance = Number(result.balance || 0);
    const niceBalance = balance.toLocaleString('en-US', {maximumFractionDigits: 2});
    document.getElementById('holderHint').innerText = niceBalance + ' ANFRA';

    if(!result.eligible){
      document.getElementById('anfraScore').innerText = '0';
      document.getElementById('achievementCount').innerText = '1 / 6';
      document.getElementById('holderLevel').innerText = balance > 0 ? 'HOLDER' : '—';
      status.innerText = wallet.slice(0,5) + '...' + wallet.slice(-5) + ' • NOT ELIGIBLE';
      btn.disabled = false;
      btn.innerText = 'NOT ELIGIBLE — 10K ANFRA REQUIRED';
      return;
    }

    document.getElementById('anfraScore').innerText = '100';
    document.getElementById('holderLevel').innerText = balance >= 500000 ? 'DIAMOND' : balance >= 100000 ? 'OG' : 'HOLDER';
    unlockBadge('badgeEarly');

    if(result.claimed || result.already_member){
      unlockBadge('badgeFounding');
      document.getElementById('achievementCount').innerText = '2 / 6';
      document.querySelector('.milestones > div:first-child b').innerText = 'UNLOCKED';
      document.querySelector('.milestones > div:last-child b').innerText = 'UNLOCKED';
    }

    await loadFoundingMembers(wallet);
    status.innerText = wallet.slice(0,5) + '...' + wallet.slice(-5) + ' • ' + walletName.toUpperCase();
    btn.disabled = false;
    btn.innerText = result.claimed ? 'FOUNDING #' + String(result.rank).padStart(3,'0') : 'WALLET CONNECTED ✓';
  }catch(err){
    console.error(err);
    status.innerText = 'BALANCE CHECK FAILED — RETRY';
    btn.disabled = false;
    btn.innerText = 'TRY AGAIN ↗';
  }
}

async function checkAndClaimFounding(wallet){
  const response = await fetch(`${SUPABASE_URL}/functions/v1/check-and-claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    },
    body: JSON.stringify({wallet})
  });
  const data = await response.json();
  if(!response.ok || data?.error) throw new Error(data?.error || `Edge Function HTTP ${response.status}`);
  return data;
}

async function connectWallet(){
  openWalletModal();
}

async function loadFoundingMembers(currentWallet){
  if(!db) return;
  const { data, error } = await db.from('founding_members').select('rank,wallet,created_at').order('rank', { ascending:true }).limit(1000);
  if(error){ console.error('Leaderboard error:', error); return; }

  const count = data?.length || 0;
  document.getElementById('foundingCount').innerText = count;
  const list = document.getElementById('foundingList');
  if(!count){ list.innerHTML = '<div class="founding-empty">No Founding Members yet.</div>'; return; }

  list.innerHTML = data.map(row => {
    const w = row.wallet;
    const short = w.slice(0,6) + '...' + w.slice(-6);
    const date = new Date(row.created_at).toLocaleDateString('en-GB');
    const mine = w === currentWallet ? ' <strong style="color:#c38cff">YOU</strong>' : '';
    return `<div class="founding-row"><div class="founding-rank">#${String(row.rank).padStart(3,'0')}</div><div class="founding-wallet">${short}${mine}</div><div class="founding-date">${date}</div></div>`;
  }).join('');
}

function unlockBadge(id){
  const el = document.getElementById(id);
  if(el){ el.classList.remove('locked'); el.classList.add('unlocked'); }
}
