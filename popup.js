function atualizarContador() {
  chrome.storage.local.get(
    ["contador"],
    (resultado) => {
      document.getElementById("contador").textContent =
        resultado.contador || 0;
    }
  );
}

document
  .getElementById("zerar")
  .addEventListener("click", () => {
    chrome.storage.local.set(
      {
        contador: 0
      },
      atualizarContador
    );
  });

atualizarContador();