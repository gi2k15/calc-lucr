// Facilitando as coisas
let gid = id => {
    let val = document.getElementById(id).value;
    // Remove máscara de moeda (R$, pontos e troca vírgula por ponto)
    val = val.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(val) || 0;
};

// Máscara simples para moeda brasileira
function maskMoeda(el) {
    let v = el.value.replace(/\D/g, "");
    v = (v/100).toFixed(2) + "";
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    el.value = "R$ " + v;
}
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.moeda').forEach(function(input) {
        input.addEventListener('input', function() {
            maskMoeda(this);
        });
        // Para aplicar a máscara ao carregar com valor preenchido
        maskMoeda(input);
    });
});

// Desabilitar os campos de desconto alternadamente
function toggleInputs() {
    const descPerc = document.getElementById('desc_perc');
    const descDinheiro = document.getElementById('desc_dinheiro');
    // Checa valor sem considerar máscara
    const descPercVal = descPerc.value.trim();
    // Para desc_dinheiro, remove tudo que não for número ou vírgula/ponto
    const descDinheiroVal = descDinheiro.value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.').trim();
    if (descPercVal !== '') {
        descDinheiro.disabled = true;
        descPerc.disabled = false;
    } else if (descDinheiroVal !== '' && parseFloat(descDinheiroVal) !== 0) {
        descPerc.disabled = true;
        descDinheiro.disabled = false;
    } else {
        descPerc.disabled = false;
        descDinheiro.disabled = false;
    }
}

// Se algum formulário for alterado, esconde os resultados
document.getElementById("profitForm").addEventListener("input", function() {
    document.getElementById("resultados").style.display = "none";
});

// Função que calcula o rendimento acumulado ao longo de um mês
function calcularRendimentoMensal(capitalInicial, taxaDiaria) {
    const dias = 21; // Aproximadamente 21 dias úteis em um mês
    const montanteFinal = capitalInicial * Math.pow((1 + taxaDiaria), dias);
    return parseFloat((montanteFinal - capitalInicial).toFixed(2));
}

// Função que simula o rendimento e pagamento parcelado ao longo do tempo
function calcularGanhoParcelado(valorTotal, numParcelas, taxaDiaria) {
    let saldo = valorTotal;
    const valorParcela = valorTotal / numParcelas;

    for (let i = 0; i < numParcelas; i++) {
        saldo += calcularRendimentoMensal(saldo, taxaDiaria);
        saldo -= valorParcela;
    }
    return saldo;
}

// Função que calcula o desconto para pagamento à vista
function calcularGanhoAVista(valor, isPercentual, desconto) {
    return isPercentual ? valor * (desconto / 100) : desconto;
}

// Função que determina após quantos meses o parcelamento se torna mais vantajoso
function determinarMesesParaLucro(valorTotal, ganhoAVista, taxaDiaria) {
    let meses = 2;
    let ganhoAPrazo = 0;

    while (ganhoAPrazo < ganhoAVista && meses <= 120) {
        ganhoAPrazo = calcularGanhoParcelado(valorTotal, meses, taxaDiaria);
        meses++;
    }

    return meses > 120 ? -1 : meses - 1;
}

// Função que calcula o lucro após o botão ser pressionado
function calculateProfit(event) {
    // Evitar que o formulário seja enviado
    event.preventDefault();

    // Definição de parâmetros
    let valorTotal = gid("valor");
    let isPercentual = false;
    let taxaDiaria = ((gid("CDI") / 100) * (gid("rend_cdi") / 100)) / 365;
    let desconto = 0;

    // Verifica se o desconto é percentual ou em dinheiro
    if (document.getElementById("desc_perc").value !== "" && document.getElementById("desc_dinheiro").value === "") {
        isPercentual = true;
        desconto = gid("desc_perc");
    } else if (document.getElementById("desc_dinheiro").value !== "" && document.getElementById("desc_perc").value === "") {
        isPercentual = false;
        desconto = gid("desc_dinheiro");
    } else {
        isPercentual = false;
        desconto = 0;
    }

    // Cálculo de resultados
    let ganhoAVista = calcularGanhoAVista(valorTotal, isPercentual, desconto);
    let ganhoParcelado = calcularGanhoParcelado(valorTotal, gid("num_parcelas"), taxaDiaria);
    let quandoSeraLucrativo = determinarMesesParaLucro(valorTotal, ganhoAVista, taxaDiaria);

    // Exibir resultados
    document.getElementById("ganho_parcelado").innerText = ganhoParcelado.toFixed(2).replace(".", ",");
    document.getElementById("ganho_a_vista").innerText = ganhoAVista.toFixed(2).replace(".", ",");
    if (ganhoAVista >= ganhoParcelado) {
        document.getElementById("vantajoso_span").innerText = "à vista";
        document.getElementById("vantajoso_p").style.color = "green";
        document.getElementById("quando_sera_lucrativo").innerText = quandoSeraLucrativo;
        document.getElementById("quando_sera_lucrativo_p").style.display = "block";
    } else {
        document.getElementById("vantajoso_span").innerText = "parcelado";
        document.getElementById("vantajoso_p").style.color = "red";
        document.getElementById("quando_sera_lucrativo_p").style.display = "none";
    }

    document.getElementById("profitForm").blur();
    document.getElementById("resultados").style.display = "block";
    document.getElementById("resultados").scrollIntoView({ behavior: "smooth" });
}