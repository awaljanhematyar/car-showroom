const Modal = {
  open({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    onConfirm,
  }) {
    const root = document.getElementById("modal-root");
    root.innerHTML = `<div class="modal-backdrop" role="presentation"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" id="modal-close" aria-label="Close">×</button><h3 id="modal-title">${title}</h3><div class="modal-message">${message}</div><div class="modal-actions"><button class="btn" id="modal-cancel">${cancelText}</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="modal-confirm">${confirmText}</button></div></div></div>`;
    const close = () => (root.innerHTML = "");
    root.querySelector("#modal-close").onclick = close;
    root.querySelector("#modal-cancel").onclick = close;
    root.querySelector("#modal-confirm").onclick = async () => {
      root.querySelector("#modal-confirm").disabled = true;
      await onConfirm();
      close();
    };
    root.querySelector(".modal-backdrop").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) close();
    });
    document.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", esc);
        }
      },
      { once: true },
    );
    root.querySelector("#modal-confirm").focus();
  },
};
