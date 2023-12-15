const fs = require('fs');

const arquivo = 'src/providers/express/routes/index.ts';

const novaRotaImportGenExpress = (nameRoute) =>{
  
const novoImport = `import ${nameRoute}Router from './${nameRoute}/router';`;
const novoMiddleware = `router.use('/${nameRoute}', ${nameRoute}Router);`;

fs.readFile(arquivo, 'utf8', (err, data) => {
  if (err) {
    console.error(`Erro ao ler o arquivo ${arquivo}: ${err}`);
    return;
  }

  // Verifique se o novo import já existe no arquivo
  if (data.includes(novoImport)) {
    console.log('O import já existe no arquivo.');
  } else {
    // Encontre a posição do último import
    const posicaoUltimoImport = data.lastIndexOf('import');

    if (posicaoUltimoImport === -1) {
      console.error(
        'Nenhum import encontrado no arquivo. Verifique o formato do arquivo.'
      );
      return;
    }

    // Encontre a posição do fechamento do último import
    const posicaoFimUltimoImport = data.indexOf(';', posicaoUltimoImport);

    if (posicaoFimUltimoImport === -1) {
      console.error(
        'Formato inválido do último import. Verifique o formato do arquivo.'
      );
      return;
    }

    // Adicione o novo import após o último import
    const importsAtualizados =
      data.slice(0, posicaoFimUltimoImport + 1) +
      '\n' +
      novoImport +
      data.slice(posicaoFimUltimoImport + 1);

    // Encontre a posição do último router.use
    const posicaoUltimoRouterUse = data.lastIndexOf('router.use');

    if (posicaoUltimoRouterUse === -1) {
      console.error(
        'Nenhum router.use encontrado no arquivo. Verifique o formato do arquivo.'
      );
      return;
    }

    // Encontre a posição do fechamento do último router.use
    const posicaoFimUltimoRouterUse = data.indexOf(
      ');',
      posicaoUltimoRouterUse
    );

    if (posicaoFimUltimoRouterUse === -1) {
      console.error(
        'Formato inválido do último router.use. Verifique o formato do arquivo.'
      );
      return;
    }

    // Adicione o novo middleware após o último router.use
    let arquivoAtualizado =
      importsAtualizados +
      data.slice(posicaoFimUltimoRouterUse + 2) +
      '\n' +
      novoMiddleware;

    arquivoAtualizado = arquivoAtualizado.replace(
      new RegExp('export { router };', 'g'),
      ''
    );
    arquivoAtualizado += '\nexport { router };';

    // Atualize o arquivo com o novo import e middleware
    fs.writeFile(arquivo, arquivoAtualizado, 'utf8', (err) => {
      if (err) {
        console.error(`Erro ao escrever no arquivo ${arquivo}: ${err}`);
      } else {
        console.log(`Arquivo ${arquivo} atualizado com sucesso.`);
      }
    });
  }
});

}
