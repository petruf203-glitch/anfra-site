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

  // Phantom may expose the provider under either of these paths.
  const provider = window.phantom?.solana || window.solana;

  // On iPhone/iPad Safari, Phantom usually isn't injected into normal Safari.
  // Send the user to ANFRA inside Phantom's in-app browser.
  if(!provider || !provider.isPhantom){
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    status.innerText = 'PHANTOM NOT DETECTED';

    if(isIOS || isAndroid){
      btn.innerText = 'OPEN IN PHANTOM ↗';
      btn.onclick = () => {
        const site = encodeURIComponent('https://anfra.trade/');
        window.location.href = 'https://phantom.app/ul/browse/' + site;
      };
    } else {
      btn.innerText = 'GET PHANTOM ↗';
      btn.onclick = () => window.open('https://phantom.app/', '_blank');
    }
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

    // Temporary identity score until live ANFRA balance verification is connected.
    unlockBadge('badgeEarly');
    document.getElementById('anfraScore').innerText = '100';
    document.getElementById('achievementCount').innerText = '1 / 6';
    document.getElementById('holderHint').innerText = 'Balance verification coming next';
    document.querySelector('.milestones > div:first-child b').innerText = 'UNLOCKED';

  }catch(err){
    console.error(err);
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
