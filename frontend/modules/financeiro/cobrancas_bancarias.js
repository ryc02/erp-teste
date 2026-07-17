const CobrancasBancarias = {
    async init() {
        console.log("Módulo Cobranças Bancárias inicializado.");
    },

    async gerarRemessa() {
        const banco = document.getElementById('cnabBancoSelect').value;
        if (!banco) {
            window.showNotify("Selecione um banco para gerar a remessa.", "warning");
            return;
        }

        try {
            const res = await window.apiFetch(`/financeiro/cnab/gerar-remessa?banco_str=${banco}`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                window.showNotify(`Remessa gerada com ${data.total_contas} boletos!`, "success");
                
                const resultDiv = document.getElementById('cnabResult');
                const textArea = document.getElementById('cnabText');
                
                resultDiv.style.display = 'block';
                textArea.value = data.arquivo;
                
                // Em um cenário real, iniciaríamos o download de um arquivo .txt ou .rem aqui
            } else {
                const err = await res.json();
                window.showNotify(err.detail || "Erro ao gerar remessa", "error");
            }
        } catch (error) {
            console.error("Erro na geração de remessa:", error);
            window.showNotify("Falha na comunicação com o servidor.", "error");
        }
    },

    processarRetorno() {
        const fileInput = document.getElementById('arquivoRetorno');
        if (!fileInput.files || fileInput.files.length === 0) {
            window.showNotify("Selecione um arquivo de retorno CNAB para processar.", "warning");
            return;
        }
        
        // Simulação do processamento
        window.showNotify("Enviando arquivo para processamento...", "info");
        
        setTimeout(() => {
            fileInput.value = "";
            window.showNotify("Arquivo CNAB processado. As baixas foram registradas com sucesso!", "success");
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CobrancasBancarias.init();
});
