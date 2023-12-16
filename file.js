const fs = require('fs').promises;

// Função assíncrona que escreve no arquivo
async function writeFileAsync(arquivo, content) {
  try {
    await fs.writeFile(arquivo, content, 'utf8');
    console.log(`Arquivo ${arquivo} atualizado com sucesso.`);
  } catch (err) {
    console.error(`Erro ao escrever no arquivo ${arquivo}: ${err}`);
    throw err; // Rejeita a Promise em caso de erro
  }
}

// Função assíncrona que lê o conteúdo do arquivo
async function readFileAsync(arquivo) {
  try {
    // Lê o conteúdo do arquivo
    const conteudo = await fs.readFile(arquivo, 'utf8');
    return conteudo;
  } catch (err) {
    console.error(`Erro ao ler o arquivo ${arquivo}: ${err}`);
    throw err; // Rejeita a Promise em caso de erro
  }
}

module.exports = {
  writeFileAsync,
  readFileAsync
};
