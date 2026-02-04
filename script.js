let pratosSelecionados = {};
let descontoAtual = 0;

/* ================= SONS ================= */
function tocarSomClick() {
    const som = document.getElementById("somClick");
    if (!som) return;
    som.currentTime = 0;
    som.play().catch(() => {});
}

function tocarSomFinalizar() {
    const som = document.getElementById("somFinalizar");
    if (!som) return;
    som.currentTime = 0;
    som.play().catch(() => {});
}

/* ================= FUNÇÕES ================= */
function nomeParaID(nome){ 
    return "qtd-" + nome; 
}

function alterarQuantidade(botao, delta, valor, nome){
    tocarSomClick();

    if(!pratosSelecionados[nome]) {
        pratosSelecionados[nome] = { preco: valor, quantidade: 0 };
    }

    pratosSelecionados[nome].quantidade += delta;
    if(pratosSelecionados[nome].quantidade < 0) {
        pratosSelecionados[nome].quantidade = 0;
    }

    document.getElementById(nomeParaID(nome)).innerText =
        `(${pratosSelecionados[nome].quantidade})`;

    if(delta > 0) animarPrato(botao);
    atualizarPedido();
}

function calcularTotal() {
    let total = 0;
    Object.keys(pratosSelecionados).forEach(nome => {
        const prato = pratosSelecionados[nome];
        if(prato.quantidade > 0){
            total += prato.quantidade * prato.preco;
        }
    });
    total -= total * descontoAtual;
    if(total < 0) total = 0;
    return total;
}

function atualizarPedido(){
    const lista = document.getElementById("lista-pratos");
    lista.innerHTML = "";
    const nomes = Object.keys(pratosSelecionados);

    if(nomes.length === 0 || nomes.every(n => pratosSelecionados[n].quantidade === 0)){
        lista.innerText = "Nenhum prato selecionado";
    } else {
        nomes.forEach(nome => {
            const prato = pratosSelecionados[nome];
            if(prato.quantidade > 0){
                const itemDiv = document.createElement("div");
                itemDiv.style.display = "flex";
                itemDiv.style.justifyContent = "space-between";
                itemDiv.style.alignItems = "center";
                itemDiv.style.marginBottom = "6px";

                const nomeP = document.createElement("span");
                nomeP.innerText =
                    `${nome.replace(/_/g," ")} (${prato.quantidade}) - ` +
                    (prato.quantidade * prato.preco).toLocaleString("pt-BR", {
                        style:"currency", currency:"BRL"
                    });

                const botoesDiv = document.createElement("div");
                botoesDiv.classList.add("pedido-item-botoes");

                const btnMenos = document.createElement("button");
                btnMenos.innerText = "-";
                btnMenos.onclick = () => alterarQuantidade(null, -1, prato.preco, nome);

                const btnMais = document.createElement("button");
                btnMais.innerText = "+";
                btnMais.onclick = () => alterarQuantidade(null, 1, prato.preco, nome);

                botoesDiv.appendChild(btnMenos);
                botoesDiv.appendChild(btnMais);

                itemDiv.appendChild(nomeP);
                itemDiv.appendChild(botoesDiv);
                lista.appendChild(itemDiv);
            }
        });
    }

    document.getElementById("total").innerText =
        "Total: " + calcularTotal().toLocaleString("pt-BR", {
            style:"currency", currency:"BRL"
        });
}

function limparPedido(){
    tocarSomClick();

    Object.keys(pratosSelecionados).forEach(nome => {
        pratosSelecionados[nome].quantidade = 0;
        const span = document.getElementById(nomeParaID(nome));
        if(span) span.innerText = "(0)";
    });

    descontoAtual = 0;
    document.getElementById("mensagem-cupom").innerText = "";
    document.getElementById("input-cupom").value = "";
    document.getElementById("observacoes-pedido").value = "";
    atualizarPedido();
}

/* ================= ANIMAÇÃO ================= */
function animarPrato(botao){
    if(!botao) return;

    const pratoItem = botao.closest(".prato-item")
        .querySelector(".foto-container img");

    const clone = pratoItem.cloneNode(true);
    clone.classList.add("voo-prato");
    document.body.appendChild(clone);

    const rect = pratoItem.getBoundingClientRect();
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";

    const destino = document.querySelector(".pedido-flutuante button");
    const destRect = destino.getBoundingClientRect();

    clone.offsetWidth;
    clone.style.transform =
        `translate(${destRect.left - rect.left}px,
                   ${destRect.top - rect.top}px) scale(0.2)`;
    clone.style.opacity = "0.7";

    setTimeout(() => clone.remove(), 800);
}

/* ================= PAGAMENTO ================= */
function abrirPagamento(){
    tocarSomFinalizar();

    const nomes = Object.keys(pratosSelecionados);
    if(nomes.every(n => pratosSelecionados[n].quantidade === 0)){
        alert("Selecione ao menos um prato antes de finalizar!");
        return;
    }

    const modal = document.getElementById("modal-pagamento");
    const resumo = document.getElementById("resumo-pedido");
    const totalModal = document.getElementById("total-modal");

    resumo.innerHTML = "";

    nomes.forEach(nome => {
        const prato = pratosSelecionados[nome];
        if(prato.quantidade > 0){
            const p = document.createElement("p");
            p.innerText =
                `${nome.replace(/_/g," ")} (${prato.quantidade}) - ` +
                (prato.quantidade * prato.preco).toLocaleString("pt-BR", {
                    style:"currency", currency:"BRL"
                });
            resumo.appendChild(p);
        }
    });

    totalModal.innerText =
        `Total: ${calcularTotal().toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;

    document.getElementById("pix-container").classList.add("oculto");
    modal.classList.remove("oculto");
}

function fecharModal(){
    tocarSomClick();
    document.getElementById("modal-pagamento").classList.add("oculto");
}

/* ================= CUPOM ================= */
function aplicarCupom(){
    tocarSomClick();

    const cupom = document.getElementById("input-cupom").value.trim().toUpperCase();
    const mensagem = document.getElementById("mensagem-cupom");
    descontoAtual = 0;

    if(cupom === "LUANA10") descontoAtual = 0.10;
    else if(cupom === "LUANA20") descontoAtual = 0.20;
    else if(cupom === "LUANA30") descontoAtual = 0.30;
    else if(cupom !== ""){
        mensagem.innerText = "Cupom inválido!";
        return;
    }

    mensagem.innerText =
        descontoAtual > 0
        ? `Cupom aplicado! ${descontoAtual * 100}% de desconto.`
        : "";

    // Atualiza total na seção “Seu pedido”
    atualizarPedido();

    // Atualiza total no modal, caso esteja aberto
    const modal = document.getElementById("modal-pagamento");
    if(!modal.classList.contains("oculto")){
        const totalModal = document.getElementById("total-modal");
        totalModal.innerText = `Total: ${calcularTotal().toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;
    }
}

/* ================= PAGAMENTO PIX ================= */
function mostrarPIX(){
    const pixContainer = document.getElementById("pix-container");
    pixContainer.classList.toggle("oculto");
    gerarQRCode();
}

function gerarQRCode(){
    const canvas = document.getElementById("qrcode");
    const chave = document.getElementById("pix-chave").innerText;
    QRCode.toCanvas(canvas, chave, { width:200 });
}

function copiarChave(){
    const chave = document.getElementById("pix-chave").innerText;
    navigator.clipboard.writeText(chave).then(() => {
        alert("Chave PIX copiada!");
    });
}

/* ================= ENVIAR PEDIDO ================= */
function enviarPedido(pagamento){
    // Verifica se tem pedido
    const nomes = Object.keys(pratosSelecionados);
    if(nomes.every(n => pratosSelecionados[n].quantidade === 0)){
        alert("Nenhum prato selecionado!");
        return;
    }

    // Monta a mensagem do pedido
    let mensagem = "Olá, quero fazer meu pedido:\n\n";
    nomes.forEach(nome => {
        const prato = pratosSelecionados[nome];
        if(prato.quantidade > 0){
            mensagem += `${nome.replace(/_/g," ")} (${prato.quantidade}) - ${ (prato.quantidade * prato.preco).toLocaleString("pt-BR",{style:"currency", currency:"BRL"}) }\n`;
        }
    });

    // Total com desconto
    mensagem += `\nTotal: ${calcularTotal().toLocaleString("pt-BR",{style:"currency", currency:"BRL"})}`;
    mensagem += `\nForma de pagamento: ${pagamento}`;

    // Observações, se houver
    const obs = document.getElementById("observacoes-pedido").value.trim();
    if(obs !== "") mensagem += `\nObservações: ${obs}`;

    // Número do WhatsApp do restaurante (formato internacional sem "+" nem "00")
    const numeroWhatsApp = "5584996274263"; // 55 = Brasil, 84 = DDD, 99627-4263 = número

    // Abre o WhatsApp com a mensagem
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    // Limpa pedido e fecha modal
    limparPedido();
    fecharModal();
}
// Função para checar se o botão flutuante está sobre o rodapé
function verificarBotaoSobreRodape() {
    const botao = document.querySelector(".pedido-flutuante");
    const rodape = document.querySelector(".rodape");
    
    const botaoRect = botao.getBoundingClientRect();
    const rodapeRect = rodape.getBoundingClientRect();

    if(botaoRect.bottom > rodapeRect.top) {
        botao.classList.add("sobre-rodape");
    } else {
        botao.classList.remove("sobre-rodape");
    }
}

// Verifica quando a página é rolada
window.addEventListener("scroll", verificarBotaoSobreRodape);
// Também verifica quando a página é redimensionada
window.addEventListener("resize", verificarBotaoSobreRodape);

// Chamada inicial para definir o estado correto
verificarBotaoSobreRodape();
