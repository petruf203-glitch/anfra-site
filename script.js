function copyCA(){
  const ca=document.getElementById('ca').innerText;
  navigator.clipboard.writeText(ca);
  const btn=document.querySelector('.contract button');
  btn.innerText='COPIED!';
  setTimeout(()=>btn.innerText='COPY',1500);
}


async function connectWallet(){
  const btn = document.getElementById('connectWalletBtn');
  const status = document.getElementById('walletStatus');

  if(!window.solana || !window.solana.isPhantom){
    status.innerText = 'PHANTOM NOT DETECTED';
    btn.innerText = 'GET PHANTOM ↗';
    btn.onclick = () => window.open('https://phantom.app/', '_blank');
    return;
  }

  try{
    btn.disabled = true;
    btn.innerText = 'CONNECTING...';
    const response = await window.solana.connect();
    const wallet = response.publicKey.toString();

    status.innerText = wallet.slice(0,5) + '...' + wallet.slice(-5);
    btn.innerText = 'WALLET CONNECTED ✓';

    // Temporary local ANFRA ID until live token-balance/RPC verification is connected.
    const short = wallet.slice(0,4) + wallet.slice(-4);
    let hash = 0;
    for(let i=0;i<wallet.length;i++) hash = ((hash << 5) - hash) + wallet.charCodeAt(i) | 0;
    const id = String(Math.abs(hash) % 10000).padStart(4,'0');
    document.getElementById('anfraIdNumber').innerText = '#' + id;

    // Base identity achievement.
    unlockBadge('badgeEarly');
    document.getElementById('anfraScore').innerText = '100';
    document.getElementById('achievementCount').innerText = '1 / 6';
    document.getElementById('holderHint').innerText = 'Balance verification coming next';
    document.querySelector('.milestones > div:first-child b').innerText = 'UNLOCKED';

  }catch(err){
    status.innerText = 'CONNECTION CANCELLED';
    btn.disabled = false;
    btn.innerText = 'CONNECT WALLET ↗';
  }
}

function unlockBadge(id){
  const el = document.getElementById(id);
  if(el) {
    el.classList.remove('locked');
    el.classList.add('unlocked');
  }
}
