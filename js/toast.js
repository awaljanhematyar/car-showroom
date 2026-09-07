const Toast = {
  show(message,type="info",title=""){
    const root=document.getElementById("toast-root");
    const el=document.createElement("div");
    el.className=`toast ${type}`;
    const labels={success:"Success",error:"Error",warning:"Warning",info:"Info"};
    el.innerHTML=`<div>●</div><div><strong>${title||labels[type]}</strong><p>${message}</p></div><button class="toast-close" aria-label="Close notification">×</button>`;
    root.appendChild(el);
    const remove=()=>{el.style.opacity="0";el.style.transform="translateX(12px)";setTimeout(()=>el.remove(),180)};
    el.querySelector(".toast-close").addEventListener("click",remove);
    setTimeout(remove,4000);
  }
};
