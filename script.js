function copyCA(){
  const ca=document.getElementById('ca').innerText;
  navigator.clipboard.writeText(ca);
  const btn=document.querySelector('.contract button');
  btn.innerText='COPIED!';
  setTimeout(()=>btn.innerText='COPY',1500);
}
