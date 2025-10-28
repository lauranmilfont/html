// script selectores de elementos
const palavraInput = document.getElementById("palavra_input");
const listaPalavras = document.getElementById("lista_palavras");
const revisoesContainer = document.getElementById("revisoesContainer");
const form = document.getElementById("documentForm");;
const output = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const gerarPdfBtn = document.getElementById("gerarPdfBtn")

let palavras = [];

//funçoes de manipulacao do formulario

//adiciona palavras chave ao pressionar enter

palavraInput.addEventListener("keypress", e =>{
    if(e.key == "Enter"){
        e.preventDefault();
        const palavra = palavraInput.ariaValueMax.trim();
        if(palavra && !palavra.includes(palavra)){
          palavras.push(palavra);
          atualizarPalavras();
          palavraInput.value = "";
        }
    }
});

function atualizarPalavras() {
    listaPalavras.innerHTML = "";
    palavras.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        li.addEventListener("click", () => {
            palavras = palavras.filter(item => item !== p);
            atualizarPalavras();
        });
        listaPalavras.appendChild(li);
    });
}


document.getElementById("addRevisao").addEventListener("click", () => {
   const div = document.createElement("div");
   div.classList.add("revisao");
   div.innerHTML = `
      <label>Data:</label>
      <input type="datetime-local" class="datarevisao" required>
      <label>Revisado por:</label>
      <input type="text" class="revisado_por" required>
      <label>Comentário:</label>
      <input type="text" class="comentario_revisao" required>
   `;
   document.getElementById("revisoesContainer").appendChild(div);
});


function construirDocumento(){
    const revisoesInputs =Array.from(document.querySelectorAll(".revisao"));
    const revisoes = revisoesInputs.map(div =>({
        data:div.querySelector(".data_revisao").value,
        revisado_por:div.querySelector(".revisado_por").value,
        comentario:div.querySelector("comentario_revisao").value
    }));

    const document={
        titulo:document.getElementById("titulo").value,
        tipo:document.getElementById("tipo").value,
        ano:parseInt(document.getElementById("ano").value),
        status:document.getElementById("status").value,
        data_envio:document.getElementById("data_envio").value,
        responsavel:{
            nome:document.getElementById("nome_responsavel").value,
            cargo:document.getElementById("cargo_responsavel").value,
            departamento:document.getElementById("departamento_responsavel").value
        },
        palavras_chave: palavras,
        revisoes:revisoes,
    };

    return document;
}
form.addEventListener("submit", e => {
    e.preventDefault();
    const documento = construirDocumento();

    const documentoMongo = JSON.parse(JSON.stringify(documento));
    documentoMongo.data_envio = { "$date": documento.data_envio };
    documentoMongo.revisoes.forEach(rev => {
        rev.data = { "$date": rev.data };
    });

  output.textContent = JSON.stringify(documentoMongo,null, 2);

});


gerarPdfBtn.addEventListener("click",()=>{
    const doc = construirDocumento();
    if(!doc.titulo){
        alert("Por favor, preencha o formulário antes de gerar o PDF.");
        return;
    }
    const {jsPDF} = window.jspdf;
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSizw(18);
    pdf.text(doc,titulo,105,y,{ align: 'center' });
    y+=15;
    pdf.setFontSize(12);
    pdf.text(`Tipo: ${doc.tipo}`,20,y)
    pdf.text(`Ano: ${doc.ano}`,120,y)
    y+=7;
    pdf.text(`Status: ${doc.status}`,20,y)
    pdf.text(`Data de Envio: ${new Date(doc,data_envio).toLocaleString('pt-BR')}`,120,y)
    y+=15;

    pdf.setFontSize(14);
    pdf.text("Responsável",20,y);
    y+=7;
    pdf.setFontSize(12);
pdf.text(`-Nome${doc.responsavel.nome}`,25,y);
})
