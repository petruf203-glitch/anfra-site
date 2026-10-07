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

// Put your Supabase project values here.
// These are the public browser values; never put a service_role/secret key here.
const SUPABASE_URL = "https://fwdrqxnyrnxoywvexpze.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DZjsjTyU0dAcQoM69Ub2iQ_y2GEtsxe";

const supabaseReady =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");

const db = supabaseReady && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

async function connectWallet(){
  const btn = document.getElementById('connectWalletBtn');
  const status = document.getElementById('walletStatus');
  const provider = window.phantom?.solana || window.solana;

  if(!provider || !provider.isPhantom){
    status.innerText = 'PHANTOM NOT DETECTED';
    btn.innerText = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      ? 'OPEN IN PHANTOM ↗'
      : 'GET PHANTOM ↗';
    btn.onclick = () => {
      const site = encodeURIComponent('https://anfra.trade/');
      if(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)){
        window.location.href = 'https://phantom.app/ul/browse/' + site;
      }else{
        window.open('https://phantom.app/', '_blank');
      }
    };
    return;
  }

  try{
    btn.disabled = true;
    btn.innerText = 'CONNECTING...';

    const response = await provider.connect();
    const wallet = response.publicKey.toString();

    status.innerText = wallet.slice(0,5) + '...' + wallet.slice(-5);
    btn.innerText = 'WALLET CONNECTED ✓';

    let hash = 0;
    for(let i=0;i<wallet.length;i++){
      hash = ((hash << 5) - hash) + wallet.charCodeAt(i) | 0;
    }
    const id = String(Math.abs(hash) % 10000).padStart(4,'0');
    document.getElementById('anfraIdNumber').innerText = '#' + id;

    if(db){
      await registerFoundingWallet(wallet);
      await loadFoundingMembers(wallet);
    }else{
      unlockBadge('badgeEarly');
      document.getElementById('anfraScore').innerText = '100';
      document.getElementById('achievementCount').innerText = '1 / 6';
      document.getElementById('holderHint').innerText = 'Database setup required';
    }

  }catch(err){
    console.error(err);
    status.innerText = 'CONNECTION CANCELLED';
    btn.disabled = false;
    btn.innerText = 'CONNECT WALLET ↗';
  }
}

async function registerFoundingWallet(wallet){
  const { data, error } = await db.rpc('claim_founding_member', {
    p_wallet: wallet
  });

  if(error){
    console.error('Founding registration error:', error);
    return;
  }

  if(data?.claimed || data?.already_member){
    unlockBadge('badgeFounding');
    unlockBadge('badgeEarly');
    document.getElementById('anfraScore').innerText = '100';
    document.getElementById('achievementCount').innerText = '2 / 6';
    document.getElementById('holderHint').innerText =
      data.claimed ? `Founding Member #${String(data.rank).padStart(3,'0')}` :
      `Founding Member #${String(data.rank).padStart(3,'0')}`;
    document.querySelector('.milestones > div:first-child b').innerText = 'UNLOCKED';
    document.querySelector('.milestones > div:last-child b').innerText = 'UNLOCKED';
  }else{
    document.getElementById('holderHint').innerText = 'Founding 1000 is full';
  }
}

async function loadFoundingMembers(currentWallet){
  if(!db) return;

  const { data, error } = await db
    .from('founding_members')
    .select('rank,wallet,created_at')
    .order('rank', { ascending:true })
    .limit(1000);

  if(error){
    console.error('Leaderboard error:', error);
    return;
  }

  const count = data?.length || 0;
  document.getElementById('foundingCount').innerText = count;

  const list = document.getElementById('foundingList');
  if(!count){
    list.innerHTML = '<div class="founding-empty">No Founding Members yet.</div>';
    return;
  }

  list.innerHTML = data.map(row => {
    const w = row.wallet;
    const short = w.slice(0,6) + '...' + w.slice(-6);
    const date = new Date(row.created_at).toLocaleDateString('en-GB');
    const mine = w === currentWallet ? ' <strong style="color:#c38cff">YOU</strong>' : '';
    return `<div class="founding-row">
      <div class="founding-rank">#${String(row.rank).padStart(3,'0')}</div>
      <div class="founding-wallet">${short}${mine}</div>
      <div class="founding-date">${date}</div>
    </div>`;
  }).join('');
}

function unlockBadge(id){
  const el = document.getElementById(id);
  if(el) {
    el.classList.remove('locked');
    el.classList.add('unlocked');
  }
}
