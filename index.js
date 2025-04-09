import express from "express";
import axios from "axios";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
const apiSecret = "dfce06c031b8e4fe7282634d";



app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}))

app.get("/", async (req, res) => {
    try {
      const result = await axios.get(`https://v6.exchangerate-api.com/v6/${apiSecret}/codes`);
      const moedasDisponiveis = result.data.supported_codes;
      res.render("index.ejs", {
        content: "", 
        valor: "",
        moedaOrigem: "BRL",  
        moedaDestino: "USD" ,
        taxa: " ",
        atualizacao: " ",
        moedasDisponiveis: moedasDisponiveis 
      });
    }  catch (error) {
      res.render("index.ejs", {  content: "Erro ao carregar as moedas",
        valor: "",  
        moedaOrigem: "BRL",
        taxa: " ",
        atualizacao: " ",
        moedaDestino: "USD",
        moedasDisponiveis: []});
      console.log("erro")
    } 

  });

app.post("/convert", async (req,res) => {
  const moedaOrigem = req.body.moedaorigem
  const moedaDestino = req.body.moedadestino
  const valor = req.body.valor;
console.log(moedaOrigem,moedaDestino,valor)
    try {
    /* const result = await axios.get(`https://v6.exchangerate-api.com/v6/${apiSecret}/latest/${moedaOrigem}`);
        const lista = JSON.stringify(result.data.conversion_rates);
        const cambio = JSON.parse(lista)
        const taxa = cambio[moedaDestino]
        console.log(taxa)
        const resultado = (valor * taxa).toFixed(2)
        console.log(resultado);
*/
      const[taxasRes,moedasRes] = await Promise.all([
        axios.get(`https://v6.exchangerate-api.com/v6/${apiSecret}/latest/${moedaOrigem}`),
        axios.get(`https://v6.exchangerate-api.com/v6/${apiSecret}/codes`)
        ]);

        const moedasDisponiveis = moedasRes.data.supported_codes;
        const cambio = taxasRes.data.conversion_rates;
        const taxa = cambio[moedaDestino];
        const resultado = (valor * taxa).toFixed(2);
        const atualizacao = taxasRes.data.time_last_update_utc;

        res.render("index.ejs", {

          content: `${moedaDestino} ${resultado}`,
          valor: valor,
          moedaOrigem: moedaOrigem,
          moedaDestino: moedaDestino,
          moedasDisponiveis: moedasDisponiveis,
          taxa: taxa,
          atualizacao: atualizacao
        })
    } 
    catch (error) {
      res.render("index.ejs", {  content: "Erro ao converter, tente novamente.",
      valor: valor, // Passando o valor de volta no erro
      moedaOrigem: moedaOrigem,
      moedaDestino: moedaDestino,
      moedasDisponiveis: []  });
      console.log("erro")
    }
  });


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

